export const INDEX = { STATE: 0, COUNTRY: 1, LAT: 2, LNG: 3, DATE_START: 4 }

export type WorldData = {
    description: string, // Deaths or cases
    dates: Date[], // Array of dates matches the case in CaseData
    countries: CountryIndex, // Cases by country
    cases: Case[], // All cases
}

export type CountryIndex = { [country: string]: Country }
export type CaseIndex = { [state: string]: Case }

export type Country = {
    name: string,
    lat: number,
    lng: number,
    totalCases: number,
    caseIndex: CaseIndex,
    dailyCases: number[],
}

export type Case = {
    state: string | undefined,
    country: string,
    lat: number,
    lng: number,
    totalCases: number,
    dailyCases: number[], // Number of cases for each date
}