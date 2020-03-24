import './plot';
import './index.less';
import GetData from './data';
import { CreateChart } from './plot';
import { WorldData } from './types';

GetData()
    .then((world: WorldData) => {
        const input1: HTMLSelectElement = document.getElementById('countries-1') as HTMLSelectElement
        const input2: HTMLSelectElement = document.getElementById('countries-2') as HTMLSelectElement

        const updateData = CreateChart(world)
        const update = () => { updateData(input1.value, input2.value) }
        AddCountries(world, input1, 0); AddCountries(world, input2, 1);
        update()

        input1.addEventListener('change', update)
        input2.addEventListener('change', update)
    })

function AddCountries(world: WorldData, input: HTMLSelectElement, defaultIndex: number) {
    const countries = Object.values(world.countries)
        .filter(country => country.totalCases > 100)
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