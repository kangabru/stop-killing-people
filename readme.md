# Stop Killing People

A web app which visualises COVID-19 cases between two countries over time. It features:
- A timeline which can be used to scrub data back in time
- Interactive inputs to allow users to explore the data in various ways
- A fun social distancing illustration

This app is built using [React](https://reactjs.org/), [D3](https://d3js.org/), and [Tailwind CSS](https://tailwindcss.com/). Data provided by [John Hopkins CSSE](https://github.com/CSSEGISandData/COVID-19).

![Screenshot](https://raw.githubusercontent.com/kangabru/stop-killing-people/readme-assets/images/screenshot.png)

---

## Setup

Install: `$ npm install`

Add the following local data files if running locally:
- `data/confirmed.csv`
- `data/deaths.csv`

Tip: Up to date files can be found the `data` branch. Simply switch branches to `data` then back to `master` and the files should remain there.

---

## Usage

Develop: `$ npm run dev`

Release: `$ npm run build`