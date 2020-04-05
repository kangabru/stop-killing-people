import * as React from 'react';
import { Country } from './types';
import { Section, s, Classes } from './common';
import { GetDaysBehind } from './chart-svg';
import { PastDays, FutureDays, getCasesDataSinceDate, getAvgGrowthRate, getEstimatedGrowthCases } from './chart-data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from "./icons";

function ChartDataSections(props: { casesTerm: string, countryMin: Country, countryMax: Country, countrySelected: Country }) {
    const { casesTerm, countryMin, countryMax, countrySelected } = props
    const daysBehind = GetDaysBehind(countryMax, countryMin)[0]

    const spanMin = <span className="border-b-4 border-color-min">{countryMin.name}</span>
    const spanMax = <span className="border-b-4 border-color-max">{countryMax.name}</span>

    const spanSelectColor = countrySelected === countryMin ? "border-color-min" : "border-color-max"
    const spanSelect = <span className={`border-b-4 ${spanSelectColor}`}>{countrySelected.name}</span>

    const [pastDays, , pastTimeSelect] = useSelector({
        [PastDays.yesterday]: "yesterday",
        [PastDays.days3]: "the past 3 days",
        [PastDays.week]: "the past week",
        [PastDays.weeks2]: "the past 2 weeks",
        [PastDays.month]: "the past month",
    }, PastDays.yesterday)

    const [futureDays, , futureTimeSelect] = useSelector({
        [FutureDays.tomorrow]: "tomorrow",
        [FutureDays.days3]: "in 3 days",
        [FutureDays.week]: "in a week",
        [FutureDays.weeks2]: "in 2 weeks",
        [FutureDays.month]: "in a month",
    }, FutureDays.week, "text-black")

    const cases = countrySelected.dailyCases
    const { casesAbsolute, casesMultiple } = getCasesDataSinceDate(cases, pastDays as number)
    const { growthRaw, growthDisplay, doubleDays } = getAvgGrowthRate(cases)
    const estGrowthCases = getEstimatedGrowthCases(countrySelected.totalCases, growthRaw, futureDays as number)

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
        <SeparationSection />
        <Section classContainer="info-section text-center">
            <p>Wash your hands, stay inside, avoid people.</p>
            <p>This is not the flu.</p>
            <p>Money is temporary. Death is forever.</p>
            <p className="font-bold text-2xl">Stop Killing People.</p>
            <p><a href="https://staythefuckhome.com/" target="_blank">#StayTheFuckHome</a></p>
        </Section>
    </>
}

function useSelector(terms: { [key: string]: string }, defaultTerm: string | number, classses?: string): [string | number, string, JSX.Element] {
    const [termkey, setTermKey] = React.useState(defaultTerm)
    const term = terms[termkey]

    const allClasses = Classes("px-1 pt-1 pb-2 rounded", classses)
    const select = <select defaultValue={defaultTerm} className={allClasses} onChange={e => setTermKey(e.currentTarget.value)}>
        {Object.entries(terms).map(([key, message]) => <option key={key} value={key}>{message}</option>)}
    </select>

    return [termkey, term, select]
}

const Separators: { [key: string]: { src: string, count: number } } = {
    "alligator": { src: "images/crocodile.svg", count: 1 },
    "baguettes": { src: "images/baguette.svg", count: 3 },
    "bananas": { src: "images/banana.svg", count: 10 },
}

function SeparationSection() {
    const keys = Object.keys(Separators)
    const keyRand = Math.floor(Math.random() * keys.length)

    const selectorObject = keys.reduce<{ [key: string]: string }>((obj, curr) => { obj[curr] = curr; return obj; }, {})
    const [key, , selector] = useSelector(selectorObject, keys[keyRand], "text-black")

    const { count } = Separators[key]
    const [attributionIcon, attributionLinks] = GetIconAttribution()

    return <Section classContainer="info-section bg-gray-200">
        <p className="text-center">Keep at least {count} {selector} or 6 feet apart. {attributionIcon}</p>
        {attributionLinks}
        {SeparationDiagram(key as string)}
    </Section>
}

function SeparationDiagram(key: string) {
    const { src, count } = Separators[key]
    const personSrc = "images/person.svg"
    const personClasses = "h-12 md:h-24 lg:h-40 opacity-75"

    return <div className="w-full flex flex-row justify-center items-center">
        <img className={personClasses + " mr-3"} src={personSrc} alt="Person" />
        {Loop(count).map(i => <img key={i} className="max-w-xs mr-3" src={src} alt={key} />)}
        <img className={personClasses} src={personSrc} alt="Person" />
    </div>
}

function Loop(count: number) {
    return [...Array(count).keys()]
}

function GetIconAttribution(): [JSX.Element, JSX.Element] {
    const [showLinks, setShowLinks] = React.useState(false)
    const toggleLinks = () => setShowLinks(!showLinks)

    const icon = <button onClick={toggleLinks}>
        <FontAwesomeIcon icon={Icons.faInfoCircle} className="opacity-75" />
    </button>

    const links = showLinks && <div className="text-center text-base">
        <p>Icons made by <a target="_blank" href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></p>
        <p>Icons made by <a target="_blank" href="https://www.flaticon.com/authors/good-ware" title="Good Ware">Good Ware</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></p>
        <p>Icons made by <a target="_blank" href="https://www.flaticon.com/authors/dinosoftlabs" title="DinosoftLabs">DinosoftLabs</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></p>
        <p>Icons made by <a target="_blank" href="https://www.flaticon.com/authors/becris" title="Becris">Becris</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></p>
    </div>

    return [icon, links]
}

export default ChartDataSections