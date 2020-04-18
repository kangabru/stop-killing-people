import * as React from 'react';
import { Section } from "../common/util";
import './timeline.less';

/**
 * Renders a slider component which a user can use to change the upper date used by the app.
 * @param mostRecentDate - The highest date the timeline should use.
 * @param numberOfDays - The number of days the timeline should use before and up to the most recent date..
 * @returns The timeline component and the upper date selected.
 */
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

/** Returns a time in milliseconds from a given number of days. */
function getTime(days: number) { return days * 24 * 60 * 60 * 1000 }

export default useTimeline