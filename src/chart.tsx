import * as React from 'react';
import { WorldData, Country, Case } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ChartSvg, { MIN_NUM_CASES } from './chart-svg';
import ChartDataSections from './chart-data-sections';
import './chart.less';
import useTimeline from './timeline';

const COUNTRY_DEFAULT_1 = "Italy", COUNTRY_DEFAULT_2 = "US", DEFAULT_ALIGNED = true

function Graph(props: { worldCases: WorldData, worldDeaths: WorldData }) {
    const [useDeaths, setUseDeaths] = React.useState(false)
    const world: WorldData = useDeaths ? props.worldDeaths : props.worldCases
    const countries = Object.values(world.countries)
        .filter(country => country.totalCases > MIN_NUM_CASES)
        .sort((c0, c1) => c0.totalCases - c1.totalCases)
        .reverse()

    // Timeline stuff
    const mostRecentDate = world.dates.slice(-1)[0]
    const numberOfDays = world.dates.length
    const [timeline, upperDate] = useTimeline(mostRecentDate, numberOfDays)
    const dates = world.dates.filter(d => d.getTime() < upperDate.getTime())

    const findCountry = (country: string) => LimitCountryDates(countries.find(c => c.name === country), dates)
    const [countryName1, setCountryName1] = React.useState<string>(COUNTRY_DEFAULT_1)
    const [countryName2, setCountryName2] = React.useState<string>(COUNTRY_DEFAULT_2)
    const [aligned, setAligned] = React.useState(DEFAULT_ALIGNED)

    const country1 = findCountry(countryName1), country2 = findCountry(countryName2)

    const countryMax = country1.totalCases > country2.totalCases ? country1 : country2
    const countryMin = countryMax === country1 ? country2 : country1

    const casesTerm = useDeaths ? "deaths" : "cases"
    const CasesTerm = useDeaths ? "Deaths" : "Cases"

    function InputSection(text: string, country: Country, onChange: (countryName: string) => void, children?: React.ReactChild): React.ReactNode {
        const classColor = country === countryMax ? "border-color-max" : "border-color-min"
        return <div className={"mb-5 md:mb-0 flex-1 mx-3 transition-colors rounded duration-200 ease-in-out text-center bg-gray-100 p-5 border-b-8 " + classColor} >
            <span className="mb-5 text-xl px-4 py-2 inline-block font-bold text-gray-900">{text}</span>
            <br />
            <CountryInput countries={countries} country={country} countryMax={countryMax} countryMin={countryMin} onChange={country => onChange(country)} />
            {children && <br />}
            {children}
        </div >
    }

    function SetCountryByPosition(pos: Position) {
        const dist = (c: Case) => Math.sqrt((c.lat - pos.coords.latitude) ** 2 + (c.lng - pos.coords.longitude) ** 2)
        const closest = world.cases.map(c => ({ dist: dist(c), case: c })).sort((a, b) => a.dist - b.dist)[0]
        setCountryName1(closest.case.country)
    }

    return <>
        <div className="container mx-auto flex flex-col md:flex-row justify-evenly p-8 mx-10">
            {InputSection("Where are you?", country1, setCountryName1, FindUserButton(SetCountryByPosition))}
            {InputSection("Compare with...", country2, setCountryName2, <>
                <div className="mt-5 text-lg select-none text-white font-bold flex flex-row justify-center">
                    <label className="bg-gray-800 rounded whitespace-no-wrap px-3 py-2 inline-block">
                        <input type="checkbox" defaultChecked={DEFAULT_ALIGNED} onChange={e => setAligned(e.target.checked)}></input>
                        <span className="ml-3">Align</span>
                    </label>
                    <label className="switch ml-2 bg-gray-800 rounded whitespace-no-wrap pl-2 pr-3 py-2 inline-block">
                        <div className="flex flex-row items-center">
                            <input className="hidden" type="checkbox" defaultChecked={useDeaths} onChange={e => setUseDeaths(e.target.checked)}></input>
                            <span className="toggle inline-block round w-10 h-6"></span>
                            <span className="inline-block ml-2">{CasesTerm}</span>
                        </div>
                    </label>
                </div>
            </>)}
        </div>
        <div className="container mx-auto max-w-3xl">
            <ChartSvg {...{ countryMin, countryMax, aligned, dates, worldDescription: world.description }} />
        </div>
        {timeline}
        <ChartDataSections {...{ casesTerm, CasesTerm, countryMin, countryMax, countrySelected: country1 }} />
    </>
}

/* Returns a new country with all cases limited to the given dates. */
function LimitCountryDates(country: Country, dates: Date[]): Country {
    const { name, lat, lng, dailyCases } = country
    const newCases = dailyCases.slice(9, dates.length)
    const totalCases = newCases.slice(-1)[0]
    return { name, lat, lng, totalCases, dailyCases: newCases }
}

function CountryInput(props: { countries: Country[], country: Country, countryMax: Country, countryMin: Country, onChange: (country: string) => void }) {
    let hasCountryAsOption = false
    const getOption = (country: Country) => {
        const name = country.name
        hasCountryAsOption = hasCountryAsOption || name === props.country.name // Check our country is in the list
        const colorClass = name === props.countryMax.name ? "bg-color-max" : name === props.countryMin.name ? "bg-color-min" : ""
        return <option key={name} value={name} className={colorClass}>{`${name} (${country.totalCases})`}</option>
    }
    return <select value={props.country.name} onChange={e => props.onChange(e.target.value)} className="px-3 py-2 mx-auto rounded border border-gray-400 max-w-full">
        {props.countries.map(getOption)}
        {!hasCountryAsOption && getOption(props.country)}
    </select>
}

function FindUserButton(findCountry: (pos: Position) => void) {
    const [searchState, setSearchState] = React.useState<"default" | "searching" | "found" | "failed">("default")

    const found = (pos: Position) => { setSearchState("found"); findCountry(pos) }
    const error = () => { setSearchState("failed") }
    const search = () => {
        setSearchState("searching")
        navigator.geolocation.getCurrentPosition(found, error)
    }

    return navigator.geolocation && <>
        <button onClick={search} className="mt-5 text-lg bg-gray-800 text-white font-bold whitespace-no-wrap px-3 py-2 rounded inline-block select-none block">
            <span className="">
                <FontAwesomeIcon icon="location-arrow" className="mr-2" />
                {searchState === "searching" ? "Searching..." : searchState === "found" ? "Found" : "Find me!"}
            </span>
        </button>
    </>
}

export default Graph