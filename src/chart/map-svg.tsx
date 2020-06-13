import * as React from 'react';
import * as d3 from '../common/d3-rollup';
// @ts-ignore
import d3tip from 'd3-tip';
import { WorldData } from '../types';
import { getAvgGrowthRate } from './chart-data';

const SVG_ID = "svg-root-map"
const height = 600, width = 900
const growthScale = 5

type CountryGrowth = { lat: number, lng: number, growth: number }
type UpdateChartProps = { growthRates: CountryGrowth[] }
type UpdateChartFunc = (props: UpdateChartProps) => void

/** Renders the actual SVG chart used to plot data in a graph format.
 * @remarks
 * Since we're sing d3 we need to create the svg but update the values independently from react.
 * We do this by rendering the chart once, and using an update function to set data as needed.
 */
function MapSvg(props: { worldDescription: string, world: WorldData }) {
    // Sets the update function that will be used when input data changes
    const [updateChart, setUpdateChart] = React.useState<{ update: UpdateChartFunc }>() // Note the initial variable doesn't set unless we wrap the function

    // This effect is called on when specific input data updates.
    // This allows us to only render the SVG once but update it as needed.
    React.useEffect(() => {
        // Performs the graph update
        const updateInternal = (update: UpdateChartFunc) => {
            const growthRates = getGrowth(props.world)
            update({ growthRates })
        }

        // Creates the graph once then updates it on subsequent calls
        if (updateChart) updateInternal(updateChart.update)
        else {
            const update = CreateChart() // Create d3 chart
            updateInternal(update) // Init chart
            setUpdateChart({ update }) // Set func for future use
        }
    }, [props.worldDescription, props.world.countries.length, props.world.dates.length,]) // Effect is updated when this data changes

    // Return the root SVG element that d3 will find and use to render the plot data
    return <svg id={SVG_ID} className="mx-auto"></svg>
}

function getGrowth(world: WorldData): CountryGrowth[] {
    const result: CountryGrowth[] = []
    for (const country of Object.values(world.cases)) {
        var growth = getAvgGrowthRate(country.dailyCases)
        result.push({ lat: country.lat, lng: country.lng, growth: growth.growthRaw })
    }
    return result
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

    d3.json("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
        .then((uState) => {
            mapProjection.selectAll('path')
                .data(uState.features)
                .enter()
                .append('path')
                .attr("d", map as any)
                .attr("stroke", "#ddd")
                .attr("fill", "#eee")
        });

    // Here we return a function that can be used to update this graph as needed.
    return (props: UpdateChartProps) => {
        if (!props) return

        var data = props.growthRates.filter(x => !!x.growth).map(x => ({ growth: x.growth, latLong: projection([x.lng, x.lat]) }))

        // mapData.selectAll('circle').remove()
        var circles = mapData.selectAll('circle')
            .data(data)
            .join(
                enter => enter
                    .append('svg:circle')
                    .attr("r", r => r.growth * growthScale)
                    .style("fill", "steelblue")
                    .attr("cx", r => r.latLong[0])
                    .attr("cy", r => r.latLong[1])
            )


        circles.transition()
            .attr('r', (x, _) => x.growth * growthScale)
    }
}

export default MapSvg