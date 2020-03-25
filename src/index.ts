import './plot';
import './index.less';
import GetData from './data';
import { CreateChart } from './plot';
import { WorldData, Country } from './types';

const MIN_NUM_CASES = 100

GetData()
    .then((world: WorldData) => {
        const countries = Object.values(world.countries)
            .filter(country => country.totalCases > MIN_NUM_CASES)
            .sort((c0, c1) => c0.totalCases - c1.totalCases)
            .reverse()

        const select1: HTMLSelectElement = document.getElementById('countries-1') as HTMLSelectElement
        const select2: HTMLSelectElement = document.getElementById('countries-2') as HTMLSelectElement
        const toggle: HTMLInputElement = document.getElementById('toggle') as HTMLInputElement

        const updateData = CreateChart(world.dates)
        PopulateCountryInput(select1, countries)
        PopulateCountryInput(select2, countries)

        select1.value = "Italy"
        select2.value = "US"

        const update = () => {
            const isAligned = toggle.checked
            const country1 = world.countries[select1.value], country2 = world.countries[select2.value]

            const countryMax = country1.totalCases > country2.totalCases ? country1 : country2
            const countryMin = countryMax === country1 ? country2 : country1
            const casesMax = [...countryMax.dailyCases], casesMin = [...countryMin.dailyCases]

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

function PopulateCountryInput(input: HTMLSelectElement, countries: Country[]) {
    input.innerHTML = '' // remove existing children

    for (const country of countries) {
        const option = document.createElement("option")
        option.value = country.name
        option.text = `${country.name} (${country.totalCases})`
        input.appendChild(option)
    }
}