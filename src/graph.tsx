import * as React from 'react';
import { WorldData, Country, Case } from './types';
import { Section, Classes } from './common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ChartSvg, { MIN_NUM_CASES } from './plot';

const COUNTRY_DEFAULT_1 = "Italy", COUNTRY_DEFAULT_2 = "US"
const CLASS_COLOR_1 = "bg-color1", CLASS_COLOR_2 = "bg-color2"

function Graph(world: WorldData) {
    const countries = Object.values(world.countries)
        .filter(country => country.totalCases > MIN_NUM_CASES)
        .sort((c0, c1) => c0.totalCases - c1.totalCases)
        .reverse()

    const findCountry = (country: string, cs = countries) => cs.find(c => c.name === country)
    const [country1, setCountry1] = React.useState<Country>(findCountry(COUNTRY_DEFAULT_1))
    const [country2, setCountry2] = React.useState<Country>(findCountry(COUNTRY_DEFAULT_2))
    const [aligned, setAligned] = React.useState(false)

    const countryMax = country1.totalCases > country2.totalCases ? country1 : country2
    const countryMin = countryMax === country1 ? country2 : country1

    function InputSection(text: string, country: Country, onChange: (country: Country) => void, children?: React.ReactChild): React.ReactNode {
        const classColor = country === countryMax ? CLASS_COLOR_1 : CLASS_COLOR_2
        return <Section classContainer={Classes("transition-colors duration-200 ease-in-out", classColor)} classContent="text-center" >
            <div className="mb-5 text-xl">{text}</div>
            <CountryInput countries={countries} country={country} countryMax={countryMax} countryMin={countryMin} onChange={country => onChange(findCountry(country))} />
            {children && <br />}
            {children}
        </Section>
    }

    function SetCountryByPosition(pos: Position) {
        const dist = (c: Case) => Math.sqrt((c.lat - pos.coords.latitude) ** 2 + (c.lng - pos.coords.longitude) ** 2)
        const closest = world.cases.map(c => ({ dist: dist(c), case: c })).sort((a, b) => a.dist - b.dist)[0]
        setCountry1(world.countries[closest.case.country])
    }

    const section1 = InputSection("Where are you?", country1, setCountry1, FindUserButton(SetCountryByPosition))
    const section2 = InputSection("Compare with...", country2, setCountry2, <>
        <label className="mt-5 text-lg bg-white whitespace-no-wrap px-3 py-1 rounded inline-block select-none">
            <input type="checkbox" defaultChecked={false} onChange={e => setAligned(e.target.checked)}></input>
            <span className="ml-3">Align</span>
        </label>
    </>)

    return <>
        {section1} {section2}
        <ChartSvg world={world} countryMax={countryMax} countryMin={countryMin} aligned={aligned} />
    </>
}

function CountryInput(props: { countries: Country[], country: Country, countryMax: Country, countryMin: Country, onChange: (country: string) => void }) {
    let hasCountryAsOption = false
    const getOption = (country: Country) => {
        const name = country.name
        hasCountryAsOption = hasCountryAsOption || name === props.country.name // Check our country is in the list
        const colorClass = name === props.countryMax.name ? CLASS_COLOR_1 : name === props.countryMin.name ? CLASS_COLOR_2 : ""
        return <option key={name} value={name} className={colorClass}>{`${name} (${country.totalCases})`}</option>
    }
    return <select value={props.country.name} onChange={e => props.onChange(e.target.value)} className="rounded px-3 py-2 mx-auto">
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
        <button onClick={search} className="mt-5 text-lg bg-white whitespace-no-wrap px-3 py-1 rounded inline-block select-none block">
            <span className="">
                <FontAwesomeIcon icon="location-arrow" className="mr-2" />
                {searchState === "searching" ? "Searching..." : searchState === "found" ? "Found" : "Find me!"}
            </span>
        </button>
    </>
}

export default Graph