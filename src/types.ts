export const INDEX = { STATE: 0, COUNTRY: 1, LAT: 2, LNG: 3, DATE_START: 4 }

export type WorldData = {
    dates: Date[],
    countries: CountryData, // Cases by country
    cases: CaseData[], // All cases
}

export type CountryData = { [country: string]: CaseData[] }

export type CaseData = {
    state: string | undefined,
    country: string,
    lat: number,
    lng: number,
    cases: number[],
}