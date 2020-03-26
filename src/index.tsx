import * as React from 'react';
import { render } from 'react-dom';
import Graph from './chart-controls';
import GetData from './data';
import './index.less';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { WorldData } from './types';
import { Section } from './common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(fas)

GetData().then((world: WorldData) => {
    render(<Home world={world} />, document.getElementById("root"))
})

function Home(props: { world: WorldData }) {
    return <>
        <div className="-mb-40">
            <Section classContainer="bg-gray-900 pb-20">
                <h1 className="text-6xl text-center font-extrabold text-white">
                    <FontAwesomeIcon icon="flushed" />
                    <span> Stop Killing People!</span>
                </h1>
                <h2 className="text-lg text-center text-white">An interactive COVID-19 growth visualisation.</h2>
            </Section>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 1 1 2" preserveAspectRatio="none" className="w-full h-10 -mb-5 fill-current text-gray-900">
                <path d="M 0 2 Q 0.5 0 1 2 L 1 0 L 0 0 Z"></path>
            </svg>
        </div>
        {Graph(props.world)}
        <Section classContainer="bg-gray-200">
            {"You're {5} days behind {Italy}"}!
            <br />
            {"{Australia} experiencing exponential growth"}
            <br />
            {"In the last {5} days {Australia} {200} new cases. This is greater than the total amount {Australia} since the pandemic began."}
            <br />
            {"{Australia}'s case growth is {95%} similar to {Italy's}."}
            <br />
            {"If {50%} of {Australia} got infected and {3%} die, then {Australia} is facing up to {1,000,000} deaths."}!
            <br />
            {"If {50%} of {Australia} got infected, and {3%} die, then {Australia} is facing up to {1,000,000} deaths."}!
        </Section>
        <Section classContainer="bg-gray-900 text-white">
            Kangabru
        </Section>
    </>
}