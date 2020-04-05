import * as React from 'react';
import { WorldData, Country } from './types';
import { Section, s, Classes } from './common';
import { GetDaysBehind } from './chart-svg';
import { PastDays, FutureDays, getCasesDataSinceDate, getAvgGrowthRate, getEstimatedGrowthCases } from './chart-data';

function ChartDataSections(props: { casesTerm: string, countryMin: Country, countryMax: Country, countrySelected: Country }) {
    const { casesTerm, countryMin, countryMax, countrySelected } = props
    const daysBehind = GetDaysBehind(countryMax, countryMin)[0]

    const spanMin = <span className="border-b-4 border-color-min">{countryMin.name}</span>
    const spanMax = <span className="border-b-4 border-color-max">{countryMax.name}</span>

    const spanSelectColor = countrySelected === countryMin ? "border-color-min" : "border-color-max"
    const spanSelect = <span className={`border-b-4 ${spanSelectColor}`}>{countrySelected.name}</span>

    const [pastDays, pastTimeTerm, pastTimeSelect] = useSelector({
        [PastDays.yesterday]: "yesterday",
        [PastDays.days3]: "the past 3 days",
        [PastDays.week]: "the past week",
        [PastDays.weeks2]: "the past 2 weeks",
        [PastDays.month]: "the past month",
    }, PastDays.yesterday)

    const [futureDays, futureTimeTerm, futureTimeSelect] = useSelector({
        [FutureDays.tomorrow]: "tomorrow",
        [FutureDays.days3]: "in 3 days",
        [FutureDays.week]: "in a week",
        [FutureDays.weeks2]: "in 2 weeks",
        [FutureDays.month]: "in a month",
    }, FutureDays.week, "text-black")

    const cases = countrySelected.dailyCases
    const { casesAbsolute, casesMultiple } = getCasesDataSinceDate(cases, pastDays)
    const { growthRaw, growthDisplay, doubleDays } = getAvgGrowthRate(cases)
    const estGrowthCases = getEstimatedGrowthCases(countrySelected.totalCases, growthRaw, futureDays)

    return <>
        <Section classContainer="info-section bg-gray-200">
            <p className="text-center">{spanMin} is {daysBehind} {s("day", daysBehind)} behind {spanMax}.</p>
            <p className="text-center">{spanSelect} has {casesMultiple.toFixed(1)} times more {casesTerm} than {pastTimeSelect}.</p>
            <p className="text-center">That's {casesAbsolute} new {casesTerm}.</p>
        </Section>
        <Section classContainer="info-section bg-gray-800 text-white">
            <p className="text-center">{spanSelect} is growing at {growthDisplay.toFixed(0)}% per day on average.</p>
            {doubleDays && <p className="text-center">That a doubling of {casesTerm} every {doubleDays - 1}-{doubleDays} days.</p>}
            <p className="text-center">At that rate you'll have ~{estGrowthCases} {casesTerm} {futureTimeSelect}.</p>
        </Section>
        <Section classContainer="info-section text-center">
            <p>Wash your hands, stay inside, avoid people.</p>
            <p>This is not the flu.</p>
            <p>Money is temporary. Death is forever.</p>
            <p className="font-bold text-2xl">Stop Killing People.</p>
        </Section>
    </>
}

function useSelector(terms: { [key: number]: string }, defaultTerm: number, classses?: string): [number, string, JSX.Element] {
    const [termkey, setTermKey] = React.useState(defaultTerm)
    const term = terms[termkey]

    const allClasses = Classes("px-1 pt-1 pb-2 rounded", classses)
    const select = <select defaultValue={defaultTerm} className={allClasses} onChange={e => setTermKey(parseInt(e.currentTarget.value))}>
        {Object.entries(terms).map(([key, message]) => <option key={key} value={key}>{message}</option>)}
    </select>

    return [termkey, term, select]
}

export default ChartDataSections