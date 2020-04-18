import * as React from 'react';
import { Country } from '../types';
import { Section, s, Classes, Loop } from '../common/util';
import { GetDaysBehind } from './chart-svg';
import { PastDays, FutureDays, getCasesDataSinceDate, getAvgGrowthRate, getEstimatedGrowthCases } from './chart-data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from "../common/icons";
import "../../images/baguette.svg"
import "../../images/banana.svg"
import "../../images/crocodile.svg"
import "../../images/person.svg"

/** Renders the text section below the graph which allow the user to see and interact with the data in various ways. */
function ChartDataSections(props: { casesTerm: string, CasesTerm: string, countryMin: Country, countryMax: Country, countrySelected: Country }) {
    const { casesTerm, CasesTerm, countryMin, countryMax, countrySelected } = props
    const daysBehind = GetDaysBehind(countryMax, countryMin)[0]

    // Define appropriately styled spans for the max and min countries
    const spanMin = <span className="border-b-4 border-color-min">{countryMin.name}</span>
    const spanMax = <span className="border-b-4 border-color-max">{countryMax.name}</span>

    // Defines the appropriately style span for the users selected country
    const spanSelectColor = countrySelected === countryMin ? "border-color-min" : "border-color-max"
    const spanCountrySelect = <span className={`border-b-4 ${spanSelectColor}`}>{countrySelected.name}</span>

    const [pastDays, pastTimeSelect] = useSelector({
        [PastDays.yesterday]: "yesterday",
        [PastDays.days3]: "3 days ago",
        [PastDays.week]: "last week",
        [PastDays.weeks2]: "2 weeks ago",
        [PastDays.month]: "last month",
    }, PastDays.yesterday)

    const [futureDays, futureTimeSelect] = useSelector({
        [FutureDays.tomorrow]: "tomorrow",
        [FutureDays.days3]: "in 3 days",
        [FutureDays.week]: "in a week",
        [FutureDays.weeks2]: "in 2 weeks",
        [FutureDays.month]: "in a month",
    }, FutureDays.week, "text-black")

    // Get data to display in the sections
    const cases = countrySelected.dailyCases
    const { casesAbsolute, casesGrowth } = getCasesDataSinceDate(cases, pastDays as number)
    const { growthRaw, growthDisplay, doubleDays } = getAvgGrowthRate(cases)
    const estGrowthCases = getEstimatedGrowthCases(countrySelected.totalCases, growthRaw, futureDays as number)

    return <>
        <Section classContainer="info-section bg-gray-200">
            <p className="text-center">{spanMin} is {daysBehind} {s("day", daysBehind)} behind {spanMax}.</p>
            <p className="text-center">{CasesTerm} in {spanCountrySelect} grew by {casesGrowth.toFixed(0)}% since {pastTimeSelect}.</p>
            <p className="text-center">That's {casesAbsolute} new {casesTerm}.</p>
        </Section>
        <Section classContainer="info-section bg-gray-800 text-white">
            <p className="text-center">{spanCountrySelect} is growing at {growthDisplay.toFixed(0)}% per day on average.</p>
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

/** Renders a select component which a user can use to change data in the related section. */
function useSelector(terms: { [key: string]: string }, defaultTerm: string | number, classes?: string): [string | number, JSX.Element] {
    const [termkey, setTermKey] = React.useState(defaultTerm)
    const allClasses = Classes("px-1 pt-1 pb-2 rounded", classes)
    const select = <select defaultValue={defaultTerm} className={allClasses} onChange={e => setTermKey(e.currentTarget.value)}>
        {Object.entries(terms).map(([key, message]) => <option key={key} value={key}>{message}</option>)}
    </select>

    return [termkey, select]
}

/** Icons to be used in the distance separation illustration. */
const Separators: { [key: string]: { src: string, count: number } } = {
    "alligator": { src: "images/crocodile.svg", count: 1 },
    "baguettes": { src: "images/baguette.svg", count: 3 },
    "bananas": { src: "images/banana.svg", count: 10 },
}

/** Renders the distance separation data illustration section. */
function SeparationSection() {
    const keys = Object.keys(Separators)
    const keyRand = Math.floor(Math.random() * keys.length)

    const selectorObject = keys.reduce<{ [key: string]: string }>((obj, curr) => { obj[curr] = curr; return obj; }, {})
    const [key, selector] = useSelector(selectorObject, keys[keyRand], "text-black")

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

/** Renders the info button which can be toggled to show the attribution info required to the use the various icons. */
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