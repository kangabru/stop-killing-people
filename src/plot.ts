import * as d3 from 'd3';
// @ts-ignore
import d3tip from 'd3-tip';
import { WorldData } from './types';

const margin = { top: 20, right: 20, bottom: 70, left: 50, text: 5 }
const height = 400, width = 600, duration = 1000
const heightPlot = height - margin.top - margin.bottom,
    widthPlot = width - margin.left - margin.right

const CreateChart = (dates: Date[]) => {
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
    const x = d3.scaleLinear().range([0, widthPlot])

    const xAxis = chart.append("g").attr("class", "axis x").attr("y", 100).attr("transform", `translate(0, ${margin.top + heightPlot})`)
    const yAxis = chart.append("g").attr("class", "axis y")

    const t = chart.transition().duration(duration)

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

    return (name1: string, name2: string, data1: number[], data2: number[], daysOffset: number = 0) => {
        const numPoints = d3.max([data1.length, data2.length])
        let barWidth = width / numPoints

        // Update title and legend
        updateInfo(name1, name2)

        // Update axis
        x.domain([0, numPoints])
        y.domain([0, d3.max([...data1, ...data2])]).nice()

        xAxis.transition(t as any).call(d3.axisBottom(x).ticks(10))
        yAxis.transition(t as any).call(d3.axisLeft(y).ticks(10))

        function drawBars(bars: d3.Selection<SVGGElement, unknown, HTMLElement, any>, cases: number[], classes: string, offset: number = 0) {
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

        drawBars(bars1, data1, "color-1")
        drawBars(bars2, data2, "color-2")

        bars2.transition(t as any).attr("transform", `translate(${x(daysOffset)}, 0)`)
    }
}

export { CreateChart }