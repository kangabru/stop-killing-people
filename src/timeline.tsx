import * as React from 'react';
import { Section } from "./common";
import './timeline.less';

function useTimeline(mostRecentDate: Date, numberOfDays: number): [JSX.Element, Date] {
    const [daysAgo, setDaysAgo] = React.useState(0)
    const change = (e: React.ChangeEvent<HTMLInputElement>) => setDaysAgo(numberOfDays - parseInt(e.currentTarget.value))

    // Add half to day so that the current date is included in date comparisons
    const upperDate = new Date(mostRecentDate.getTime() - getTime(daysAgo) + getTime(0.5));
    const upperIndex = numberOfDays - daysAgo

    const timeline = <Section classContainer="info-section slider-cont text-white text-center">
        <div className="pb-4">
            <span>Go back in time! It looked like this on:</span>
            <br />
            <span>{upperDate.toDateString()}</span>
        </div>
        <input className="slider" type="range" min="0" max={numberOfDays} value={upperIndex} onChange={change} onInput={change} />
    </Section>
    return [timeline, upperDate]
}

function getTime(days: number) { return days * 24 * 60 * 60 * 1000 }

export default useTimeline