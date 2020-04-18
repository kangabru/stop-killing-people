import * as React from 'react';
import { Section } from "./common";
import './timeline.less';

function useTimeline(mostRecentDate: Date, numberOfDays: number): [JSX.Element, Date] {
    const [daysAgo, setDaysAgo] = React.useState(0)
    const change = (e: React.ChangeEvent<HTMLInputElement>) => setDaysAgo(numberOfDays - parseInt(e.currentTarget.value))

    const upperDate = new Date(mostRecentDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const upperIndex = numberOfDays - daysAgo

    const timeline = <Section classContainer="info-section slider-cont text-white text-center">
        <span className="block pb-4">Upper Date: {upperDate.toDateString()}</span>
        <input className="slider" type="range" min="0" max={numberOfDays} value={upperIndex} onChange={change} onInput={change} />
    </Section>
    return [timeline, upperDate]
}

export default useTimeline