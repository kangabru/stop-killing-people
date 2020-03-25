import * as React from 'react';
import { render } from 'react-dom';
import './plot';
import './index.less';
import GetData from './data';
import { CreateChart } from './plot';
import { WorldData, Country } from './types';
import { Section } from './common';

const MIN_NUM_CASES = 100

const COUNTRY_DEFAULT_1 = "Italy", COUNTRY_DEFAULT_2 = "US"
const CLASS_COLOR_1 = "bg-color1", CLASS_COLOR_2 = "bg-color2"

function Graph() {
    React.useEffect(() => { makeGraph() }, []) // Only on load

    const InputSection = (props: { id: string, text: string, classColour?: string }) =>
        <Section classContainer={props.classColour} classContent="text-center">
            <div className="mb-5 text-xl">{props.text}</div>
            <select id={props.id} className="rounded px-3 py-2 mx-auto"></select>
        </Section>

    return <>
        <InputSection id="countries-1" classColour="bg-red-200" text="Where are you?" />
        <InputSection id="countries-2" classColour="bg-blue-200" text="Compare with..." />

        <div className="flex flex-row justify-center">
            <input id="toggle" type="checkbox" defaultChecked={false}></input>
            <label htmlFor="toggle" className="ml-3">Aligned</label>
        </div>
        <svg className="mx-auto my-5"></svg>
    </>
}

const makeGraph = () => GetData()
    .then((world: WorldData) => {
        const countries = Object.values(world.countries)
            .filter(country => country.totalCases > MIN_NUM_CASES)
            .sort((c0, c1) => c0.totalCases - c1.totalCases)
            .reverse()

        const select1: HTMLSelectElement = document.getElementById('countries-1') as HTMLSelectElement
        const select2: HTMLSelectElement = document.getElementById('countries-2') as HTMLSelectElement
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

            PopulateCountryInput(select1, countries, countryMax.name, countryMax.name, countryMin.name)
            PopulateCountryInput(select2, countries, countryMin.name, countryMax.name, countryMin.name)

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
            const colorClass = country.name === countryMax ? CLASS_COLOR_1 : country.name === countryMin ? CLASS_COLOR_2 : ""
            return <option value={country.name} className={colorClass}>
                {`${country.name} (${country.totalCases})`}
            </option>
        })}
    </>, input)

    input.value = countrySelected
}

function SetClasses(input: HTMLSelectElement, index: number, classes: string) {
    for (let i = 0; i < input.children.length; i++) {
        const child = input.children[i];
        if (i === index) child.classList.add(classes)
        else child.classList.remove(classes)
    }
}

export default Graph