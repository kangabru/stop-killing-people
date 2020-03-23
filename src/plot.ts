import * as d3 from 'd3';
// @ts-ignore
import d3tip from 'd3-tip';
import get_data from './data';
import { WorldData } from './types';

const margin = { top: 20, right: 20, bottom: 70, left: 50, text: 5 }
const height = 400, width = 600, delay = 1000
const heightPlot = height - margin.top - margin.bottom,
    widthPlot = width - margin.left - margin.right

const create_chart = (world: WorldData) => {
    const dates = world.dates
    let barWidth = width / dates.length

    const svg = d3.select('svg')
        .attr("height", height)
        .attr("width", width)

    const title = svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")

    svg.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("text-anchor", "end")
        .text("Cases")

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - margin.top + 6)
        .attr("text-anchor", "middle")
        .text("Days")

    const chart = svg.append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`)

    const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])

    const x = d3.scaleLinear()
        .domain([0, dates.length])
        .range([0, widthPlot])

    const xAxis = chart.append("g")
        .attr("class", "axis x")
        .attr("y", 100)
        .attr("transform", `translate(0, ${margin.top + heightPlot})`)

    const yAxis = chart.append("g")
        .attr("class", "axis y")

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

    return (country: string) => {
        const data = world.countries[country][0]

        y.domain([0, d3.max(data.cases)]).nice()

        xAxis.call(d3.axisBottom(x).ticks(10))
        yAxis.call(d3.axisLeft(y).ticks(10))

        title.text(`${data.state && (data.state + ", ")}${data.country}`)

        chart.selectAll('.bar')
            .data(data.cases)
            .join(enter => enter
                .append('rect')
                .attr('class', 'bar')
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
}

get_data()
    .then((world: WorldData) => {
        let i = 0
        const cs = ["Australia", "Thailand", "Canada"]

        const updateData = create_chart(world)

        const updateCountry = () => {
            updateData(cs[i])
            i += 1
            i %= cs.length
            setTimeout(updateCountry, 1000)
        }

        updateCountry()
    })