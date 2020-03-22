import * as d3 from 'd3';
// @ts-ignore
import d3tip from 'd3-tip';
import DATA_URL from './data'


const margin = { top: 20, right: 20, bottom: 30, left: 20 }
const height = 400, width = 600

let chart = d3.select('svg')
    .attr("height", height)
    .attr("width", width)
    .append('g')
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

const INDEX = { STATE: 0, COUNTRY: 1, LAT: 2, LNG: 3, DATE_START: 4 }

type WorldData = {
    dates: Date[],
    countries: CountryData, // Cases by country
    cases: CaseData[], // All cases
}

type CountryData = { [country: string]: CaseData[] }

type CaseData = {
    state: string | undefined,
    country: string,
    lat: number,
    lng: number,
    cases: number[],
}

d3.text(DATA_URL)
    .then(text => d3.csvParseRows(text))
    .then(data => {
        const dates = Object.values(data[0]).slice(INDEX.DATE_START).map(x => new Date(x))
        const cases: CaseData[] = data.slice(1).map(row => ({
            state: row[INDEX.STATE],
            country: row[INDEX.COUNTRY],
            lat: +row[INDEX.LAT],
            lng: +row[INDEX.LNG],
            cases: row.slice(INDEX.DATE_START).map(x => +x)
        }))

        // Additionally index cases by country
        const countries: CountryData = {}
        cases.forEach(c => {
            const cs = countries[c.country] || []
            cs.push(c)
            countries[c.country] = cs
        })

        const world: WorldData = { dates, cases, countries }
        return world
    })
    .then((world: WorldData) => {

        const dates = world.dates
        const data = world.countries["Australia"][0]
        console.log(data);

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

        let y = d3.scaleLinear()
            .domain([0, d3.max(data.cases)]).nice()
            .range([height - margin.bottom, margin.top])

        let x = d3.scaleTime()
            .domain(world.dates)
            .range([0, width])

        let barWidth = width / world.dates.length

        chart.append("g")
            .attr("class", "axis x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(10));

        chart.append("g")
            .attr("class", "axis y")
            .call(d3.axisLeft(y).ticks(10))

        chart.append("text")
            .attr("x", 100)
            .text(`${data.state && (data.state + ", ")}${data.country}`);

        chart.selectAll('.bar')
            .data(data.cases)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (_, i) => i * barWidth)
            .attr('y', d => y(d))
            .attr("height", d => height - margin.bottom - y(d))
            .attr("width", barWidth - 2)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
    })