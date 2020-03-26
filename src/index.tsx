import * as React from 'react';
import { render } from 'react-dom';
import Graph from './graph';
import GetData from './data';
import './index.less';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { WorldData } from './types';

library.add(fas)

GetData().then((world: WorldData) => {
    render(<Home world={world} />, document.getElementById("root"))
})

function Home(props: { world: WorldData }) {
    return <>
        {Graph(props.world)}
    </>
}