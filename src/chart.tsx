import * as React from 'react';
import { WorldData, Country, Case } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ChartSvg, { MIN_NUM_CASES } from './chart-svg';
import ChartDataSections from './chart-data-sections';

const COUNTRY_DEFAULT_1 = "Italy", COUNTRY_DEFAULT_2 = "US", DEFAULT_ALIGNED = true

function Graph(world: WorldData) {
    const countries = Object.values(world.countries)
        .filter(country => country.totalCases > MIN_NUM_CASES)
        .sort((c0, c1) => c0.totalCases - c1.totalCases)
        .reverse()

    const findCountry = (country: string, cs = countries) => cs.find(c => c.name === country)
    const [country1, setCountry1] = React.useState<Country>(findCountry(COUNTRY_DEFAULT_1))
    const [country2, setCountry2] = React.useState<Country>(findCountry(COUNTRY_DEFAULT_2))
    const [aligned, setAligned] = React.useState(DEFAULT_ALIGNED)
    const [useDeaths,] = React.useState(false)

    const countryMax = country1.totalCases > country2.totalCases ? country1 : country2
    const countryMin = countryMax === country1 ? country2 : country1
    const casesTerm = useDeaths ? "deaths" : "cases"

    function InputSection(text: string, country: Country, onChange: (country: Country) => void, children?: React.ReactChild): React.ReactNode {
        const classColor = country === countryMax ? "border-color-max" : "border-color-min"
        return <div className={"mb-5 md:mb-0 flex-1 mx-3 transition-colors rounded duration-200 ease-in-out text-center bg-gray-100 p-5 border-b-8 " + classColor} >
            <span className="mb-5 text-xl px-4 py-2 inline-block font-bold text-gray-900">{text}</span>
            <br />
            <CountryInput countries={countries} country={country} countryMax={countryMax} countryMin={countryMin} onChange={country => onChange(findCountry(country))} />
            {children && <br />}
            {children}
        </div >
    }

    function SetCountryByPosition(pos: Position) {
        const dist = (c: Case) => Math.sqrt((c.lat - pos.coords.latitude) ** 2 + (c.lng - pos.coords.longitude) ** 2)
        const closest = world.cases.map(c => ({ dist: dist(c), case: c })).sort((a, b) => a.dist - b.dist)[0]
        setCountry1(world.countries[closest.case.country])
    }

    return <>
        <div className="container mx-auto flex flex-col md:flex-row justify-evenly p-8 mx-10">
            {InputSection("Where are you?", country1, setCountry1, FindUserButton(SetCountryByPosition))}
            {InputSection("Compare with...", country2, setCountry2, <>
                <label className="mt-5 text-lg bg-gray-800 rounded whitespace-no-wrap px-3 py-2 inline-block select-none text-white font-bold">
                    <input type="checkbox" defaultChecked={DEFAULT_ALIGNED} onChange={e => setAligned(e.target.checked)}></input>
                    <span className="ml-3">Align</span>
                </label>
            </>)}
        </div>
        <div className="container mx-auto">
            <div className="mx-auto max-w-3xl">
                <ChartSvg world={world} countryMax={countryMax} countryMin={countryMin} aligned={aligned} />
            </div>
        </div>
        <ChartDataSections {...{ casesTerm, countryMin, countryMax, countrySelected: country1 }} />
    </>
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