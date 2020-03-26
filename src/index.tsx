import * as React from 'react';
import { render } from 'react-dom';
import Graph from './chart-controls';
import GetData from './data';
import './index.less';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faGithub, faGithubAlt } from '@fortawesome/free-brands-svg-icons'
import { faFlushed, faLocationArrow } from '@fortawesome/free-solid-svg-icons'
import { WorldData } from './types';
import { Section } from './common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(faFlushed, faLocationArrow, faGithub, faGithubAlt)

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
        <Section classContainer="bg-gray-900" classContent="flex justify-center">
            <a className="px-4 py-3 bg-white rounded text-lg font-semibold hover:bg-gray-200" href="https://github.com/kangabru/stop-killing-people">
                <FontAwesomeIcon icon={['fab', 'github']} />
                <span> View on GitHub</span>
            </a>
        </Section>
    </>
}