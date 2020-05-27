import * as React from 'react';
import { render } from 'react-dom';
import Graph from './chart/chart';
import { GetCases, GetDeaths } from './common/data';
import { HashRouter as Router } from 'react-router-dom';
import './index.less';

import { WorldData } from './types';
import { Section, Classes } from './common/util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import * as Icons from "./common/icons";

render(<Home />, document.getElementById("root"))

/** Renders the main page components such as the header, graph, and footer. */
function Home() {
    const [worldCases, setWorldCases] = React.useState<WorldData>(null)
    const [worldDeaths, setWorldDeaths] = React.useState<WorldData>(null)
    React.useEffect(() => {
        GetCases().then((world: WorldData) => setWorldCases(world))
        GetDeaths().then((world: WorldData) => setWorldDeaths(world))
    }, [])

    const hasLoaded = !!worldCases && !!worldDeaths
    const isLoading = !hasLoaded

    return <div className="flex flex-col min-h-screen">
        <div className="-mb-40">
            <Section classContainer={Classes("bg-gray-900", hasLoaded && "pb-20")}>
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
        <Router>
            {isLoading ? <LoadingPage /> : <Graph {...{ worldCases, worldDeaths }} />}
        </Router>
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
    </div>
}

type LoadingStage = { icon: IconDefinition, message: string }

/**
 * Show a loading screen which updates an image and message every few seconds to indicate the state of loading.
 *
 * @remarks
 * If loading is slow or something while downloading data then this tell the user in a friendly way.
*/
function LoadingPage() {
    const LoadingIcon = { happy: Icons.faSmile, neutral: Icons.faMeh, sad: Icons.faFrownOpen, broken: Icons.faFrown }
    const [stage, setStage] = React.useState<LoadingStage>({ icon: LoadingIcon.happy, message: "Loading" })

    React.useEffect(() => {
        const stages: LoadingStage[] = [
            { icon: LoadingIcon.neutral, message: "Huh, this is taking a while." },
            { icon: LoadingIcon.sad, message: "Maybe the server has COVID-19 too." },
            { icon: LoadingIcon.broken, message: "Ok something broke, I'm sorry. Please refresh." },
        ]

        let currentTimeout: number = null
        const makeTimeout = (index: number) => {
            if (index >= 0 && index < stages.length)
                currentTimeout = setTimeout(() => {
                    setStage(stages[index])
                    makeTimeout(index + 1)
                }, 2000) as any as number
            else
                currentTimeout = null
        }

        makeTimeout(0)
        return () => currentTimeout && clearTimeout(currentTimeout)
    }, [])

    return <div className="flex justify-center items-center flex-1 text-gray-700">
        <div className="text-center my-10 pt-10">
            <FontAwesomeIcon icon={stage.icon} className="text-6xl" />
            <br />
            <div className="text-2xl mt-3">{stage.message}</div>
        </div>
    </div>
}