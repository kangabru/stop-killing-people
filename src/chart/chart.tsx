import * as React from 'react';
import { WorldData, Country, Case, CountryIndex } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ChartSvg, { MIN_NUM_CASES } from './chart-svg';
import ChartDataSections from './chart-data-sections';
import useTimeline from './timeline';
import './chart.less';
import { useHistory, useLocation } from 'react-router-dom';
import MapSvg from './map-svg';

const DEFAULT_ALIGNED = false

const PARAM_1 = "c1", PARAM_2 = "c2";

/** Renders the graph and all related components that interact with graph data. */
function Graph(props: { worldCases: WorldData, worldDeaths: WorldData }) {
    const location = useLocation();
    const history = useHistory();

    const addParam = (name: string, value: string) => {
        const params = new URLSearchParams(location.search)
        params.set(name, value)
        history.replace("?" + params.toString());
    }

    // Whether to use total case or death data
    const [useDeaths, setUseDeaths] = React.useState(false)

    const worldRaw: WorldData = useDeaths ? props.worldDeaths : props.worldCases

    // Create a timeline which lets a user limit the upper date used by the data throughout the app
    const mostRecentDate = worldRaw.dates.slice(-1)[0], numberOfDays = worldRaw.dates.length
    const [timeline, upperDate] = useTimeline(mostRecentDate, numberOfDays)

    // Filter the dates by the upper date. These dates define all data used throughout the app
    const dates = worldRaw.dates.filter(d => d.getTime() < upperDate.getTime())
    const world = LimitWorldData(worldRaw, dates)

    const totalCases = Object.values(world.countries).reduce((total, country) => total + country.totalCases, 0) || 0
    const countries = Object.values(world.countries)
        .filter(country => country.totalCases > MIN_NUM_CASES)
        .sort((c0, c1) => c0.totalCases - c1.totalCases)
        .reverse()

    const blankCountry: Country = { name: "NA", lat: 0, lng: 0, totalCases: 0, dailyCases: [] }
    const findCountry = (country: string) => countries.find(c => c.name === country) ?? blankCountry

    const getDefaultCountryName = (i: number) => countries.length > i ? countries.slice(i)[0].name : null
    const searchParams = new URLSearchParams(location.search)
    const countryName1 = searchParams.get(PARAM_1) ?? getDefaultCountryName(1)
    const countryName2 = searchParams.get(PARAM_2) ?? getDefaultCountryName(0)

    const setCountryName1 = (country: string) => { addParam(PARAM_1, country); }
    const setCountryName2 = (country: string) => { addParam(PARAM_2, country); }

    const switchCountries = () => {
        setCountryName1(countryName2);
        setCountryName2(countryName1);
    }

    const [soloCountry1, setSoloCountry1] = React.useState(false)
    const [_aligned, setAligned] = React.useState(DEFAULT_ALIGNED)
    const aligned = _aligned && !soloCountry1

    const country1 = findCountry(countryName1), country2 = findCountry(countryName2)

    // Data throughout the app relies on the 'max' and 'min' country to define colours and organise data.
    // The max country is simply the one which has more cases at the given point in time.
    const countryMax = country1.totalCases > country2.totalCases ? country1 : country2
    const countryMin = countryMax === country1 ? country2 : country1

    const casesTerm = useDeaths ? "deaths" : "cases"
    const CasesTerm = useDeaths ? "Deaths" : "Cases"

    // Hide country 2 data if the user solos country 1
    if (soloCountry1) {
        country2.totalCases = 0
        country2.dailyCases = []
    }

    /** Renders one of the main input components which contains stuff like a country selector etc. */
    function InputSection(text: string, country: Country, onChange: (countryName: string) => void, children?: React.ReactChild): React.ReactNode {
        const classColor = country === countryMax ? "border-color-max" : "border-color-min"
        return <div className={"mb-2 md:mb-5 md:mb-0 flex-1 mx-3 transition-colors rounded duration-200 ease-in-out text-center bg-gray-100 p-5 border-b-8 " + classColor} >
            <span className="mb-5 text-xl px-4 py-2 inline-block font-bold text-gray-900">{text}</span>
            <br />
            <CountryInput countries={countries} country={country} countryMax={countryMax} countryMin={countryMin} onChange={country => onChange(country)} />
            <br />
            {children}
        </div >
    }

    /** Finds the country closest to the physical location of the user as given by their browser coordinates. */
    function SetCountryByPosition(pos: Position) {
        const dist = (c: Case) => Math.sqrt((c.lat - pos.coords.latitude) ** 2 + (c.lng - pos.coords.longitude) ** 2)
        const closest = world.cases.map(c => ({ dist: dist(c), case: c })).sort((a, b) => a.dist - b.dist)[0]
        setCountryName1(closest.case.country)
    }

    return <>
        <div className="container mx-auto flex flex-col md:flex-row justify-evenly items-center p-8 mx-10">
            {InputSection("Where are you?", country1, setCountryName1, <>
                <div className="mt-5 text-lg select-none text-white font-bold flex flex-row justify-center">
                    {FindUserButton(SetCountryByPosition)}
                    <label className="bg-gray-800 ml-2 rounded whitespace-no-wrap px-3 py-2 inline-block cursor-pointer"
                        title="Select to only show this country on the graph">
                        <input type="checkbox" defaultChecked={soloCountry1} onChange={e => setSoloCountry1(e.target.checked)}></input>
                        <span className="ml-3">Solo</span>
                    </label>
                </div>
            </>)}
            <button className="bg-gray-100 h-10 mb-2 md:mb-5 text-gray-800 text-lg rounded whitespace-no-wrap px-3 pt-2 pb-3 border-b-2 border-gray-800"
                onClick={switchCountries}>
                <FontAwesomeIcon icon="arrows-alt-h" />
            </button>
            {InputSection("Compare with...", country2, setCountryName2, <>
                <div className="mt-5 text-lg select-none text-white font-bold flex flex-row justify-center">
                    <label className="switch mr-2 bg-gray-800 rounded whitespace-no-wrap pl-2 pr-3 py-2 inline-block cursor-pointer">
                        <div className="flex flex-row items-center">
                            <input className="hidden" type="checkbox" defaultChecked={useDeaths} onChange={e => setUseDeaths(e.target.checked)}></input>
                            <span className="toggle inline-block round w-10 h-6"></span>
                            <span className="inline-block ml-2">{CasesTerm}</span>
                        </div>
                    </label>
                    <label className="bg-gray-800 rounded whitespace-no-wrap px-3 py-2 inline-block cursor-pointer"
                        title="Aligns the total cases of a country to match the cases of the other. Works best when both countries are in exponential growth.">
                        <input type="checkbox" defaultChecked={DEFAULT_ALIGNED} onChange={e => setAligned(e.target.checked)}></input>
                        <span className="ml-3">Align</span>
                    </label>
                </div>
            </>)}
        </div>
        <div className="container mx-auto max-w-3xl">
            <ChartSvg {...{ countryMin, countryMax, aligned, dates, worldDescription: world.description }} />
        </div>
        {timeline}
        <div className="text-2xl sm:text-3xl md:text-4xl text-center">{`Total ${casesTerm}: ${totalCases}`}</div>
        <div className="container mx-auto max-w-3xl">
            <MapSvg {...{ world, worldDescription: world.description, casesTerm }} />
        </div>
        <ChartDataSections {...{ casesTerm, CasesTerm, countryMin, countryMax, countrySelected: country1 }} />
    </>
}

/** Returns a new world with all cases limited to within the given dates. */
function LimitWorldData(world: WorldData, dates: Date[]): WorldData {
    var countries: CountryIndex = {}
    Object.values(world.countries).map(c => LimitCountryDates(c, dates)).forEach(c => countries[c.name] = c)

    var cases = Object.values(world.cases).map(c => LimitCaseDates(c, dates))

    return {
        description: world.description,
        dates,
        countries,
        cases,
    }
}

/** Returns a new case with all cases limited to within the given dates. */
function LimitCaseDates(c: Case, dates: Date[]): Case {
    const { country, state, lat, lng, dailyCases } = c
    const newCases = dailyCases.slice(0, dates.length)
    const totalCases = newCases.slice(-1)[0]
    return { country, state, lat, lng, totalCases, dailyCases: newCases }
}

/** Returns a new country with all cases limited to within the given dates. */
function LimitCountryDates(country: Country, dates: Date[]): Country {
    if (!country) return { name: "Not Found", lat: 0, lng: 0, totalCases: 0, dailyCases: [] }
    const { name, lat, lng, dailyCases } = country
    const newCases = dailyCases.slice(0, dates.length)
    const totalCases = newCases.slice(-1)[0]
    return { name, lat, lng, totalCases, dailyCases: newCases }
}

/** Renders a country selector.
 * @remarks
 * The currently selected options are highlighted by the appropriate color.
 */
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

/** Renders the button the user can use to find their location.
 * @param findCountry - The callback to use when the browser returns the users location.
 */
function FindUserButton(findCountry: (pos: Position) => void) {
    const [searchState, setSearchState] = React.useState<"default" | "searching" | "found" | "failed">("default")

    const found = (pos: Position) => { setSearchState("found"); findCountry(pos) }
    const error = () => { setSearchState("failed") }
    const search = () => {
        setSearchState("searching")
        navigator.geolocation.getCurrentPosition(found, error)
    }

    return navigator.geolocation && <>
        <button onClick={search} className="text-lg bg-gray-800 text-white font-bold whitespace-no-wrap px-3 py-2 rounded inline-block select-none block"
            title="Uses your location to quickly populate the data for your country">
            <span className="">
                <FontAwesomeIcon icon="location-arrow" className="mr-2" />
                {searchState === "searching" ? "Searching..." : searchState === "found" ? "Found" : "Find me!"}
            </span>
        </button>
    </>
}

export default Graph