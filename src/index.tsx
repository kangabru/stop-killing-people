import * as React from 'react';
import { render } from 'react-dom';
import Graph from './chart-controls';
import GetData from './data';
import './index.less';

import { WorldData } from './types';
import { Section } from './common';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub'
import { faFlushed } from '@fortawesome/free-solid-svg-icons/faFlushed'
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons/faLocationArrow'

library.add(faFlushed, faLocationArrow, faGithub)

GetData().then((world: WorldData) => {
    render(<Home world={world} />, document.getElementById("root"))
})

function Home(props: { world: WorldData }) {
    return <>
        <div className="-mb-40">
            <Section classContainer="bg-gray-900 pb-20">
                <h1 className="text-2xl md:text-4xl lg:text-6xl text-center font-extrabold text-white">
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
        <Section classContainer="bg-gray-900" classContent="flex flex-col sm:flex-row items-center justify-evenly">
            <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank" className="text-white text-center mb-5 sm:mb-0">
                <span className="font-semibold">Source:</span><br />
                <span className="text-blue-400">John Hopkins CSSE</span>
            </a>
            <a className="px-4 py-3 bg-white rounded text-lg font-semibold hover:bg-gray-200" href="https://github.com/kangabru/stop-killing-people">
                <FontAwesomeIcon icon={['fab', 'github']} />
                <span> View on GitHub</span>
            </a>
        </Section>
    </>
}