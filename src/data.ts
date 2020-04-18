import * as d3 from 'd3';
import { INDEX, WorldData, CountryIndex, Case } from './types';

const CASES_LOCAL = "data/confirmed.csv"
const CASES_CONFIRMED = "https://ghcdn.rawgit.org/kangabru/stop-killing-people/data/data/confirmed.csv"
const CASES_URL = process.env.NODE_ENV == 'production' ? CASES_CONFIRMED : CASES_LOCAL

const DEATHS_LOCAL = "data/deaths.csv"
const DEATHS_CONFIRMED = "https://ghcdn.rawgit.org/kangabru/stop-killing-people/data/data/deaths.csv"
const DEATHS_URL = process.env.NODE_ENV == 'production' ? DEATHS_CONFIRMED : DEATHS_LOCAL

const GetDeaths = () => GetData(DEATHS_URL, 'Deaths')
const GetCases = () => GetData(CASES_URL, 'Cases')

const GetData = (url: string, description: string) => d3.text(url)
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

        const world: WorldData = { description, dates, cases, countries }
        return world
    })

export { GetCases, GetDeaths }