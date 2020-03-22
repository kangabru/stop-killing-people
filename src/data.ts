const LOCAL = "data/cases.csv"
const CONFIRMED = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv"

const DATA_URL = process.env.NODE_ENV == 'production' ? CONFIRMED : LOCAL
export default DATA_URL