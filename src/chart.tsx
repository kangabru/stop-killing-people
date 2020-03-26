import * as React from 'react';
import * as d3 from 'd3';
// @ts-ignore
import d3tip from 'd3-tip';
import { WorldData, Country } from './types';
import { s } from './common';

export const MIN_NUM_CASES = 100

const margin = { top: 20, right: 20, bottom: 70, left: 50, text: 5 }
const height = 400, width = 600
const heightPlot = height - margin.top - margin.bottom,
    widthPlot = width - margin.left - margin.right

const SVG_ID = "svg-root"
const color1 = "svg-color-max", color2 = "svg-color-min"

type UpdateChartProps = { country1: string, country2: string, daysBehindText: string, data1: number[], data2: number[], daysOffset: number }
type UpdateChartFunc = (props: UpdateChartProps) => void

function ChartSvg(props: { world: WorldData, countryMax: Country, countryMin: Country, aligned: boolean }) {
    /* Since we're sing d3 we need to create the svg but update the values independently from react.
    We do this by saving the update function and only updating it when country input changes */

    const [updateChart, setUpdateChart] = React.useState<{ update: UpdateChartFunc }>() // Var won't set unless we wrap the function

    React.useEffect(() => {
        const updateIntenral = (update: UpdateChartFunc) => {
            const { aligned, countryMax, countryMin } = props
            const [daysBehind, casesMax, casesMin] = GetDaysBehind(countryMax, countryMin)
            const daysBehindText = ` (${daysBehind} ${s("day", daysBehind)} behind)`

            update({
                country1: countryMax.name, country2: countryMin.name, daysBehindText,
                data1: casesMax, data2: casesMin, daysOffset: aligned ? -daysBehind : 0
            })
        }

        if (updateChart) {
            updateIntenral(updateChart.update)
        } else {
            const update = CreateChart(props.world.dates) // Create d3 chart
            updateIntenral(update) // Init chart
            setUpdateChart({ update }) // Set func for future use
        }
    }, [props.countryMax.name, props.countryMin.name, props.aligned]) // Only update on input changes

    return <svg id={SVG_ID} className="mx-auto"> </svg>
}

export function GetDaysBehind(countryMax: Country, countryMin: Country): [number, number[], number[]] {
    const casesMax = [...countryMax.dailyCases], casesMin = [...countryMin.dailyCases]

    const indexAtMinNumCasesMax = casesMax.findIndex(_case => _case > MIN_NUM_CASES)
    const indexAtMinNumCasesMin = casesMin.findIndex(_case => _case > MIN_NUM_CASES)
    const indexAtMinNumCases = Math.min(indexAtMinNumCasesMin, indexAtMinNumCasesMax)

    casesMax.splice(0, indexAtMinNumCases)
    casesMin.splice(0, indexAtMinNumCases)

    const matchingIndexMax = casesMax.findIndex(cases => cases >= countryMin.totalCases)
    const daysBehind = casesMin.length - matchingIndexMax - 1
    return [daysBehind, casesMax, casesMin]
}

function CreateChart(dates: Date[]): UpdateChartFunc {
    // Root svg element
    const svg = d3.select(`#${SVG_ID}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width} ${height}`)

    const title = svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")

    svg.append("circle").attr("cx", margin.left + 20).attr("cy", margin.top + 30).attr("r", 6).attr("class", color1)
    svg.append("circle").attr("cx", margin.left + 20).attr("cy", margin.top + 50).attr("r", 6).attr("class", color2)
    const legend1 = svg.append("text").attr("x", margin.left + 35).attr("y", margin.top + 35)
    const legend2 = svg.append("text").attr("x", margin.left + 35).attr("y", margin.top + 55)

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

    let tip = d3tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html((num: number, i: number) => {
            const date = new Date(dates[i])
            const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' })
            const [{ value: mo }, , { value: da }, , { value: ye }] = dtf.formatToParts(date)
            const date_pretty = `${da}-${mo}-${ye}`
            return `<strong>${num} cases</strong><br>${date_pretty}`
        })
    chart.call(tip)

    const bars1 = chart.append('g')
    const bars2 = chart.append('g').attr("transform", `translate(0, 0)`)

    return (props: UpdateChartProps) => {
        if (!props) return

        const { country1, country2, daysBehindText, data1, data2, daysOffset } = props
        const numPoints = d3.max([data1.length, data2.length])

        updateInfo(country1, country2, daysBehindText)

        // Update axis
        x.domain([0, numPoints])
        y.domain([0, d3.max([...data1, ...data2])]).nice()

        xAxis.transition().call(d3.axisBottom(x).ticks(10))
        yAxis.transition().call(d3.axisLeft(y).ticks(10))

        function drawBars(bars: d3.Selection<SVGGElement, unknown, HTMLElement, any>, cases: number[], classes: string, offset: boolean) {
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

        drawBars(bars1, data1, color1, false)
        drawBars(bars2, data2, color2, true)

        bars2.transition().attr("transform", `translate(${x(daysOffset)}, 0)`)
    }
}

export default ChartSvg