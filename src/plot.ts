import * as d3 from 'd3';
// @ts-ignore
import d3tip from 'd3-tip';
import get_data from './data'
import { WorldData } from './types'

const margin = { top: 20, right: 20, bottom: 30, left: 20 }
const height = 400, width = 600, delay = 1000

const create_chart = (world: WorldData) => {
    const dates = world.dates

    let chart = d3.select('svg')
        .attr("height", height)
        .attr("width", width)
        .append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`)


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

    const t = chart.transition().duration(delay);
    const title = chart.append("text").attr("x", 100)

    return (country: string) => {
        const data = world.countries[country][0]

        let y = d3.scaleLinear()
            .domain([0, d3.max(data.cases)]).nice()
            .range([height - margin.bottom, margin.top])

        let x = d3.scaleLinear()
            .domain([0, dates.length])
            .range([0, width])

        let barWidth = width / world.dates.length

        chart.append("g")
            .attr("class", "axis x")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(10));

        chart.append("g")
            .attr("class", "axis y")
            .call(d3.axisLeft(y).ticks(10))

        title.text(`${data.state && (data.state + ", ")}${data.country}`);

        const rect = chart.selectAll('.bar')
            .data(data.cases)
            .join(
                enter =>
                    enter.append('rect')
                        .attr('class', 'bar')
                        .attr('x', (_, i) => x(i))
                        .attr('y', d => y(d))
                        .attr("height", d => height - margin.bottom - y(d))
                        .attr("width", barWidth - 2)
                        .on('mouseover', tip.show)
                        .on('mouseout', tip.hide),
                update => update,
                exit => exit.call(rect => rect.transition(t as any).remove()
                    .attr("y", y(0))
                    .attr("height", 0))
            )

        rect.transition(t as any)
            .attr("y", d => y(d))
            .attr("height", d => y(0) - y(d));
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