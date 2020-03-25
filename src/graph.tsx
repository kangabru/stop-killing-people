import * as React from 'react';
import { render } from 'react-dom';
import './plot';
import './index.less';
import GetData from './data';
import { CreateChart } from './plot';
import { WorldData, Country } from './types';
import { Section, Classes } from './common';

const MIN_NUM_CASES = 100

const COUNTRY_DEFAULT_1 = "Italy", COUNTRY_DEFAULT_2 = "US"
const CLASS_COLOR_1 = "bg-color1", CLASS_COLOR_2 = "bg-color2"
const ID_CONTAINER_1 = "countries-1", ID_CONTAINER_2 = "countries-2"

function Graph() {
    const InputSection = (id: string, classColourDefault: string, text: string): [React.ReactNode, (color: string) => void] => {
        const [classColor, setClassColor] = React.useState(classColourDefault)

        return [<Section classContainer={Classes("transition-colors duration-200 ease-in-out", classColor)} classContent="text-center">
            <div className="mb-5 text-xl">{text}</div>
            <select id={id} className="rounded px-3 py-2 mx-auto"></select>
        </Section>, setClassColor]
    }

    const [section1, setColorSection1] = InputSection("countries-1", CLASS_COLOR_1, "Where are you?")
    const [section2, setColorSection2] = InputSection("countries-2", CLASS_COLOR_2, "Compare with...")

    React.useEffect(() => { makeGraph(setColorSection1, setColorSection2) }, []) // Only on load

    return <>
        {section1} {section2}
        <div className="flex flex-row justify-center">
            <input id="toggle" type="checkbox" defaultChecked={false}></input>
            <label htmlFor="toggle" className="ml-3">Aligned</label>
        </div>
        <svg className="mx-auto my-5"></svg>
    </>
}

const makeGraph = (setColorSection1: (color: string) => void, setColorSection2: (color: string) => void) => GetData()
    .then((world: WorldData) => {
        const countries = Object.values(world.countries)
            .filter(country => country.totalCases > MIN_NUM_CASES)
            .sort((c0, c1) => c0.totalCases - c1.totalCases)
            .reverse()

        const select1: HTMLSelectElement = document.getElementById(ID_CONTAINER_1) as HTMLSelectElement
        const select2: HTMLSelectElement = document.getElementById(ID_CONTAINER_2) as HTMLSelectElement
        const toggle: HTMLInputElement = document.getElementById('toggle') as HTMLInputElement

        const updateData = CreateChart(world.dates)
        PopulateCountryInput(select1, countries, COUNTRY_DEFAULT_1, COUNTRY_DEFAULT_1, COUNTRY_DEFAULT_2)
        PopulateCountryInput(select2, countries, COUNTRY_DEFAULT_2, COUNTRY_DEFAULT_1, COUNTRY_DEFAULT_2)

        const update = () => {
            const isAligned = toggle.checked
            const country1 = world.countries[select1.value], country2 = world.countries[select2.value]

            const countryMax = country1.totalCases > country2.totalCases ? country1 : country2
            const countryMin = countryMax === country1 ? country2 : country1
            const casesMax = [...countryMax.dailyCases], casesMin = [...countryMin.dailyCases]

            PopulateCountryInput(select1, countries, country1.name, countryMax.name, countryMin.name)
            PopulateCountryInput(select2, countries, country2.name, countryMax.name, countryMin.name)

            const country1IsMax = country1 === countryMax
            setColorSection1(country1IsMax ? CLASS_COLOR_1 : CLASS_COLOR_2)
            setColorSection2(country1IsMax ? CLASS_COLOR_2 : CLASS_COLOR_1)

            const indexAtMinNumCasesMax = casesMax.findIndex(_case => _case > MIN_NUM_CASES)
            const indexAtMinNumCasesMin = casesMin.findIndex(_case => _case > MIN_NUM_CASES)
            const indexAtMinNumCases = Math.min(indexAtMinNumCasesMin, indexAtMinNumCasesMax)

            casesMax.splice(0, indexAtMinNumCases)
            casesMin.splice(0, indexAtMinNumCases)

            const matchingIndexMax = casesMax.findIndex(cases => cases >= countryMin.totalCases)
            const daysBehind = casesMin.length - matchingIndexMax - 1

            const daysBehindText = ` (${daysBehind} day${daysBehind !== 1 ? "s" : ""} behind)`
            updateData(countryMax.name, countryMin.name + daysBehindText, casesMax, casesMin, isAligned ? -daysBehind : 0)
        }
        update()

        select1.addEventListener('change', update)
        select2.addEventListener('change', update)
        toggle.addEventListener('change', update)
    })

function PopulateCountryInput(input: HTMLSelectElement, countries: Country[], countrySelected: string, countryMax: string, countryMin: string) {
    render(<>
        {countries.map(country => {
            const name = country.name
            const colorClass = name === countryMax ? CLASS_COLOR_1 : name === countryMin ? CLASS_COLOR_2 : ""
            return <option key={name} value={name} className={colorClass}>{`${name} (${country.totalCases})`}</option>
        })}
    </>, input)

    input.value = countrySelected
}

export default Graph