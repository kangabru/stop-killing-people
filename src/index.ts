import './plot';
import './index.less';
import GetData from './data';
import { CreateChart } from './plot';
import { WorldData } from './types';

const MIN_NUM_CASES = 100

GetData()
    .then((world: WorldData) => {
        const select1: HTMLSelectElement = document.getElementById('countries-1') as HTMLSelectElement
        const select2: HTMLSelectElement = document.getElementById('countries-2') as HTMLSelectElement

        const updateData = CreateChart(world.dates)
        PopulateCountryInput(world, select1, 0)
        PopulateCountryInput(world, select2, 1)

        const update = () => {
            const country1 = world.countries[select1.value]
            const country2 = world.countries[select2.value]

            const countryMax = country1.totalCases > country2.totalCases ? country1 : country2
            const countryMin = countryMax === country1 ? country2 : country1
            const casesMax = [...countryMax.dailyCases], casesMin = [...countryMin.dailyCases]

            updateData(countryMax.name, countryMin.name, casesMax, casesMin)
        }
        update()

        select1.addEventListener('change', update)
        select2.addEventListener('change', update)
    })

function PopulateCountryInput(world: WorldData, input: HTMLSelectElement, defaultIndex: number) {
    const countries = Object.values(world.countries)
        .filter(country => country.totalCases > MIN_NUM_CASES)
        .sort((c0, c1) => c0.totalCases - c1.totalCases)
        .reverse()

    for (const country of countries) {
        const option = document.createElement("option")
        option.value = country.name
        option.text = `${country.name} (${country.totalCases})`
        input.appendChild(option)
    }
    input.value = countries[defaultIndex].name
}