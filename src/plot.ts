import * as d3 from 'd3';
// @ts-ignore
import d3tip from 'd3-tip';
import { WorldData } from './types';

const margin = { top: 20, right: 20, bottom: 70, left: 50, text: 5 }
const height = 400, width = 600, delay = 1000
const heightPlot = height - margin.top - margin.bottom,
    widthPlot = width - margin.left - margin.right

const CreateChart = (world: WorldData) => {
    const dates = world.dates
    let barWidth = width / dates.length

    // Root svg element
    const svg = d3.select('svg')
        .attr("height", height)
        .attr("width", width)

    const title = svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")

    svg.append("circle").attr("cx", margin.left + 20).attr("cy", margin.top + 30).attr("r", 6).attr("class", "color-1")
    svg.append("circle").attr("cx", margin.left + 20).attr("cy", margin.top + 50).attr("r", 6).attr("class", "color-2")
    const legend1 = svg.append("text").attr("x", margin.left + 35).attr("y", margin.top + 35)
    const legend2 = svg.append("text").attr("x", margin.left + 35).attr("y", margin.top + 55)

    function updateInfo(country1: string, country2: string) {
        title.text(country1 + " / " + country2)
        legend1.text(country1)
        legend2.text(country2)
    }

    // Axis labels
    svg.append("text").attr("text-anchor", "end").attr("x", margin.left).attr("y", margin.top).text("Cases")
    svg.append("text").attr("text-anchor", "middle").attr("x", width / 2).attr("y", height - margin.top + 6).text("Days")

    // Plot area
    const chart = svg.append('g').attr("transform", `translate(${margin.left}, ${margin.top})`)

    const y = d3.scaleLinear().range([height - margin.bottom, margin.top])
    const x = d3.scaleLinear().domain([0, dates.length]).range([0, widthPlot])

    const xAxis = chart.append("g").attr("class", "axis x").attr("y", 100).attr("transform", `translate(0, ${margin.top + heightPlot})`)
    const yAxis = chart.append("g").attr("class", "axis y")

    const t = chart.transition().duration(delay)

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
    const bars2 = chart.append('g')

    function drawBars(bars: d3.Selection<SVGGElement, unknown, HTMLElement, any>, cases: number[], classes: string) {
        bars.selectAll('.bar')
            .data(cases)
            .join(enter => enter
                .append('rect')
                .attr('class', 'bar ' + classes)
                .attr('x', (_, i) => x(i))
                .attr('y', d => y(d))
                .attr("height", d => height - margin.bottom - y(d))
                .attr("width", barWidth - 2)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide))
            .transition(t as any)
            .attr("y", d => y(d))
            .attr("height", d => y(0) - y(d))
    }

    return (countryName1: string, countryName2: string) => {
        const country1 = world.countries[countryName1]
        const country2 = world.countries[countryName2]

        // Update title and legend
        updateInfo(country1.name, country2.name)

        // Update axis
        xAxis.call(d3.axisBottom(x).ticks(10))
        y.domain([0, d3.max([...country1.dailyCases, ...country2.dailyCases])]).nice()
        yAxis.transition(t as any).call(d3.axisLeft(y).ticks(10))

        drawBars(bars1, country1.dailyCases, "color-1")
        drawBars(bars2, country2.dailyCases, "color-2")
    }
}

export { CreateChart }