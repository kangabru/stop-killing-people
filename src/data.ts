import * as d3 from 'd3';
import { INDEX, WorldData, CountryIndex, Case, Country } from './types';

const LOCAL = "data/confirmed.csv"
const CONFIRMED = "https://ghcdn.rawgit.org/kangabru/stop-killing-people/data/data/confirmed.csv"

const DATA_URL = process.env.NODE_ENV == 'production' ? CONFIRMED : LOCAL

const GetData = () => d3.text(DATA_URL)
    .then(text => d3.csvParseRows(text))
    .then(data => {
        const dates = Object.values(data[0]).slice(INDEX.DATE_START).map(x => new Date(x))
        const cases: Case[] = data.slice(1).map(row => {
            const _cases = row.slice(INDEX.DATE_START).map(x => +x)
            return {
                state: row[INDEX.STATE],
                country: row[INDEX.COUNTRY],
                lat: +row[INDEX.LAT],
                lng: +row[INDEX.LNG],
                totalCases: _cases.slice(-1)[0],
                dailyCases: _cases,
            }
        })

        const countries: CountryIndex = {}
        cases.forEach(_case => {
            const country = countries[_case.country] || {
                name: _case.country,
                lat: 0,
                lng: 0,
                totalCases: 0,
                caseIndex: {},
                dailyCases: undefined,
            }

            countries[_case.country] = country
            country.totalCases += _case.totalCases
            country.caseIndex[_case.state] = _case
        })

        // Merge state data into country totals
        Object.values(countries).forEach(country => {

            // Find the average lat and lng locations
            const cases = Object.values(country.caseIndex)
            const [latSum, lngSum] = cases
                .map(c => ([c.lat, c.lng]))
                .reduce(([latSum, lngSum], [lat, lng]) => [latSum + lat, lngSum + lng], [0, 0])
            country.lat = latSum / cases.length
            country.lng = lngSum / cases.length

            // Merge daily cases from each state to the country total daily cases
            for (const _case of cases) {
                if (!country.dailyCases)
                    country.dailyCases = _case.dailyCases
                else for (let i = 0; i < country.dailyCases.length; i++)
                    country.dailyCases[i] += _case.dailyCases[i]
            }
        });

        const world: WorldData = { dates, cases, countries }
        return world
    })

export default GetData