import * as d3 from 'd3';
import { INDEX, WorldData, CountryData, CaseData } from './types';

const LOCAL = "data/cases.csv"
const CONFIRMED = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv"

const DATA_URL = process.env.NODE_ENV == 'production' ? CONFIRMED : LOCAL

const get_data = () => d3.text(DATA_URL)
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

export default get_data