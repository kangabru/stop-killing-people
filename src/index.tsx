import * as React from 'react';
import { render } from 'react-dom';
import Graph from './graph';
import { Section } from './common';

render(<Home />, document.getElementById("root"))

function Home() {
    return <>
        <Graph />
    </>
}