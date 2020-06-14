import * as React from 'react';
import * as d3 from '../common/d3-rollup';
// @ts-ignore
import d3tip from 'd3-tip';
import { Country } from '../types';
import { s } from '../common/util';
import { getAvgGrowthRate } from './chart-data';

export const MIN_NUM_CASES = 100

const margin = { top: 20, right: 20, bottom: 70, left: 70, text: 5 }
const height = 400, width = 600
const heightPlot = height - margin.top - margin.bottom,
    widthPlot = width - margin.left - margin.right

const SVG_ID = "svg-root"
const color1 = "svg-color-max", color2 = "svg-color-min"

type UpdateChartProps = { country1: string, country2: string, daysBehindText: string, dates: Date[], data1: number[], data2: number[], daysOffset: number }
type UpdateChartFunc = (props: UpdateChartProps) => void

/** Renders the actual SVG chart used to plot data in a graph format.
 * @remarks
 * Since we're sing d3 we need to create the svg but update the values independently from react.
 * We do this by rendering the chart once, and using an update function to set data as needed.
 */
function ChartSvg(props: { worldDescription: string, dates: Date[], countryMax: Country, countryMin: Country, aligned: boolean }) {
    // Sets the update function that will be used when input data changes
    const [updateChart, setUpdateChart] = React.useState<{ update: UpdateChartFunc }>() // Note the initial variable doesn't set unless we wrap the function

    // This effect is called on when specific input data updates.
    // This allows us to only render the SVG once but update it as needed.
    React.useEffect(() => {
        // Performs the graph update
        const updateInternal = (update: UpdateChartFunc) => {
            const { aligned, dates, countryMax, countryMin } = props
            const { realDaysBehind, alignDaysBehind, casesMax, casesMin } = GetDaysBehind(countryMax, countryMin)
            const daysBehindText = realDaysBehind ? ` (${realDaysBehind} ${s("day", realDaysBehind)} behind)` : ""

            update({
                country1: countryMax.name, country2: countryMin.name, daysBehindText, dates,
                data1: casesMax, data2: casesMin, daysOffset: aligned ? -alignDaysBehind : 0
            })
        }

        // Creates the graph once then updates it on subsequent calls
        if (updateChart) updateInternal(updateChart.update)
        else {
            const update = CreateChart() // Create d3 chart
            updateInternal(update) // Init chart
            setUpdateChart({ update }) // Set func for future use
        }
    }, [props.worldDescription, props.dates.length, props.aligned,
    props.countryMin.name, props.countryMin.dailyCases.length,
    props.countryMax.name, props.countryMax.dailyCases.length,]) // Effect is updated when this data changes

    // Return the root SVG element that d3 will find and use to render the plot data
    return <svg id={SVG_ID} className="mx-auto"></svg>
}

/** Calculates the number of days the min and max country are to each other.
 * This is used to align the two country graphs to each other if the user has selected that option.
 * */
export function GetDaysBehind(countryMax: Country, countryMin: Country): { realDaysBehind: number | undefined, alignDaysBehind: number, casesMax: number[], casesMin: number[], } {
    const casesMax = [...countryMax.dailyCases], casesMin = [...countryMin.dailyCases]

    const casesMaxGrowth = getAvgGrowthRate(casesMax).growthRaw
    const casesMinGrowth = getAvgGrowthRate(casesMin).growthRaw
    const growthDiff = casesMinGrowth - casesMaxGrowth

    let realDaysBehind: number
    if (growthDiff * 100 > 0.2) {
        const totalCasesMax = casesMax.slice(-1)[0]
        const totalCasesMin = casesMin.slice(-1)[0]
        const daysBehind = Math.log10(totalCasesMax / totalCasesMin) / Math.log10(casesMinGrowth / casesMaxGrowth)
        realDaysBehind = Math.floor(daysBehind)
    }

    const indexAtMinNumCasesMax = casesMax.findIndex(_case => _case > MIN_NUM_CASES)
    const indexAtMinNumCasesMin = casesMin.findIndex(_case => _case > MIN_NUM_CASES)
    const indexAtMinNumCases = Math.min(indexAtMinNumCasesMin, indexAtMinNumCasesMax)

    casesMax.splice(0, indexAtMinNumCases)
    casesMin.splice(0, indexAtMinNumCases)

    const matchingIndexMax = casesMax.findIndex(cases => cases >= countryMin.totalCases)
    const alignDaysBehind = casesMin.length - matchingIndexMax - 1
    return { realDaysBehind, alignDaysBehind, casesMax, casesMin }
}

/** Initialises the d3 graph and returns a function which can be used to update the data as needed. */
function CreateChart(): UpdateChartFunc {
    // Root svg element
    const svg = d3.select(`#${SVG_ID}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width} ${height}`)

    const title = svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")

    // Create the legend
    svg.append("circle").attr("cx", margin.left + 20).attr("cy", margin.top + 30).attr("r", 6).attr("class", color1)
    svg.append("circle").attr("cx", margin.left + 20).attr("cy", margin.top + 50).attr("r", 6).attr("class", color2)
    const legend1 = svg.append("text").attr("x", margin.left + 35).attr("y", margin.top + 35)
    const legend2 = svg.append("text").attr("x", margin.left + 35).attr("y", margin.top + 55)

    /** Updates title and legend info. */
    function updateInfo(country1: string, country2: string, daysBehindText: string) {
        title.text(country1 + " / " + country2)
        legend1.text(country1)
        legend2.text(country2 + " " + daysBehindText)
    }

    // Axis labels
    svg.append("text").attr("text-anchor", "end").attr("x", margin.left).attr("y", margin.top).text("Cases")
    svg.append("text").attr("text-anchor", "middle").attr("x", width / 2).attr("y", height - margin.top + 6).text("Days")

    // Plot area
    const chart = svg.append('g').attr("transform", `translate(${margin.left}, ${margin.top})`)

    const x = d3.scaleLinear().range([0, widthPlot])
    const y = d3.scaleLinear().range([height - margin.bottom, margin.top])

    const xAxis = chart.append("g").attr("class", "axis x").attr("y", 100).attr("transform", `translate(0, ${margin.top + heightPlot})`)
    const yAxis = chart.append("g").attr("class", "axis y")

    const bars1 = chart.append('g')
    const bars2 = chart.append('g').attr("transform", `translate(0, 0)`)

    // Here we return a function that can be used to update this graph as needed.
    return (props: UpdateChartProps) => {
        if (!props) return

        const { country1, country2, daysBehindText, dates, data1, data2, daysOffset } = props
        const numPoints = d3.max([data1.length, data2.length])
        const tipDates = dates.slice(-numPoints)

        updateInfo(country1, country2, daysBehindText)

        // Update axis
        x.domain([0, numPoints])
        y.domain([0, d3.max([...data1, ...data2])]).nice()

        xAxis.transition().call(d3.axisBottom(x).ticks(10))
        yAxis.transition().call(d3.axisLeft(y).ticks(10))

        // Renders info when hovering over the chart data
        const tip = d3tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html((num: number, i: number) => {
                const date = new Date(tipDates[i])
                const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' })
                const [{ value: mo }, , { value: da }, , { value: ye }] = dtf.formatToParts(date)
                const date_pretty = `${da}-${mo}-${ye}`
                return `<strong>${num} cases</strong><br>${date_pretty}`
            })
        chart.call(tip)

        function drawBars(bars: d3.Selection<SVGGElement, unknown, HTMLElement, any>, cases: number[], classes: string) {
            const rect = bars.selectAll('.bar').data(cases).join(
                enter => enter
                    .append('rect')
                    .attr('class', 'bar ' + classes)
                    .attr('x', (_, i) => x(i))
                    .attr('y', d => y(d))
                    .attr("height", d => height - margin.bottom - y(d))
                    .attr("width", x(1) - 2)
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide)
            )

            rect.transition()
                .attr('x', (_, i) => x(i))
                .attr("y", d => y(d))
                .attr("width", x(1) - 2)
                .attr("height", d => y(0) - y(d))
        }

        drawBars(bars1, data1, color1)
        drawBars(bars2, data2, color2)

        // Aligns the two plots with the offset amount
        bars2.transition().attr("transform", `translate(${x(daysOffset)}, 0)`)
    }
}

export default ChartSvg