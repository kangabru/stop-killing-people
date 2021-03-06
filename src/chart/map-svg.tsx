import * as React from 'react';
import * as d3 from '../common/d3-rollup';
// @ts-ignore
import d3tip from 'd3-tip';
import { WorldData, Case } from '../types';
import { getAvgGrowthRate } from './chart-data';
import { MIN_NUM_CASES } from './chart-svg';
import { MAP_SVG_GEOJSON } from '../common/data';

const SVG_ID = "svg-root-map"
const height = 600, width = 900
const growthScale = 4
const totalMaxSize = 25

type CaseGrowth = Case & { name: String, growth: number }
type UpdateChartProps = { growthRates: CaseGrowth[], casesTerm: String, showMapGrowth: boolean, maxTotal: number }
type UpdateChartFunc = (props: UpdateChartProps) => void

/** Renders the actual SVG chart used to plot data in a graph format.
 * @remarks
 * Since we're sing d3 we need to create the svg but update the values independently from react.
 * We do this by rendering the chart once, and using an update function to set data as needed.
 */
function MapSvg(props: { worldDescription: string, world: WorldData, casesTerm: String, showMapGrowth: boolean }) {
    // Sets the update function that will be used when input data changes
    const [updateChart, setUpdateChart] = React.useState<{ update: UpdateChartFunc }>() // Note the initial variable doesn't set unless we wrap the function

    // This effect is called on when specific input data updates.
    // This allows us to only render the SVG once but update it as needed.
    React.useEffect(() => {
        // Performs the graph update
        const updateInternal = (update: UpdateChartFunc) => {
            const { casesTerm, showMapGrowth } = props
            const growthRates = getGrowth(props.world)
            const maxTotal = growthRates.length ? growthRates[0].totalCases : 1
            update({ growthRates, casesTerm, showMapGrowth, maxTotal })
        }

        // Creates the graph once then updates it on subsequent calls
        if (updateChart) updateInternal(updateChart.update)
        else {
            const update = CreateChart() // Create d3 chart
            updateInternal(update) // Init chart
            setUpdateChart({ update }) // Set func for future use
        }
    }, [props.worldDescription, props.world.countries.length, props.world.dates.length,
    props.casesTerm, props.showMapGrowth,]) // Effect is updated when this data changes

    // Return the root SVG element that d3 will find and use to render the plot data
    return <svg id={SVG_ID} className="mx-auto"></svg>
}

function getGrowth(world: WorldData): CaseGrowth[] {
    const result: CaseGrowth[] = []
    for (const c of Object.values(world.cases).filter(c => c.totalCases > MIN_NUM_CASES)) {
        var name = c.state ? `${c.country}: ${c.state}` : c.country
        var growthRaw = getAvgGrowthRate(c.dailyCases).growthRaw
        var growth = 100 * (growthRaw - 1)
        result.push({ ...c, name, growth })
    }
    return result.sort((a, b) => b.totalCases - a.totalCases)
}

/** Initialises the d3 graph and returns a function which can be used to update the data as needed. */
function CreateChart(): UpdateChartFunc {
    const svg = d3.select(`#${SVG_ID}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width} ${height}`)

    const mapProjection = svg.append('g')
    const mapData = svg.append('g')

    const projection = d3.geoNaturalEarth1()
        .translate([width * 4 / 9, height / 2])
    const map = d3.geoPath().projection(projection);

    d3.json(MAP_SVG_GEOJSON)
        .then((uState) => {
            mapProjection.selectAll('path')
                .data(uState.features)
                .enter()
                .append('path')
                .attr("d", map as any)
                .attr("stroke", "#ddd")
                .attr("fill", "#eee")
        });

    const projectGrowth = (x: CaseGrowth): CaseGrowth => {
        const latLong = projection([x.lng, x.lat])
        return { ...x, lat: latLong[0], lng: latLong[1] }
    }

    // Here we return a function that can be used to update this graph as needed.
    return (props: UpdateChartProps) => {
        if (!props) return

        const tip = d3tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html((c: CaseGrowth) => {
                const growthClean = c.growth.toFixed(0)
                return `<strong>${c.name}</strong><br>${growthClean}% growth<br>${c.totalCases} ${props.casesTerm}`
            })
        mapData.call(tip)

        const { growthRates, showMapGrowth, maxTotal } = props
        const totalScale = totalMaxSize / Math.sqrt(maxTotal)
        const data = growthRates.map(projectGrowth)

        function growthToRadius(c: CaseGrowth): number {
            return showMapGrowth ? Math.sqrt(c.growth) * growthScale : Math.sqrt(c.totalCases) * totalScale
        }

        mapData.selectAll('circle')
            .data(data, (x: any) => x.name)
            .join(
                enter => enter
                    .append('svg:circle')
                    .style("fill", "steelblue")
                    .attr("cx", r => r.lat)
                    .attr("cy", r => r.lng)
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide),
            )
            .transition()
            .attr("r", r => growthToRadius(r))

        mapData.selectAll('circle')
            .data(data).exit().remove()
    }
}

export default MapSvg