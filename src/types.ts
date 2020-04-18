/** The CSV column indexes to used when parsing the downloaded data. */
export const INDEX = { STATE: 0, COUNTRY: 1, LAT: 2, LNG: 3, DATE_START: 4 }

/** Represents all cases information for all countries provided by the data set. */
export type WorldData = {
    description: string, // I.e. deaths or cases
    dates: Date[], // Dates matching the cases arrays
    countries: CountryIndex, // Cases by country
    cases: Case[], // All cases
}

export type CountryIndex = { [country: string]: Country }
export type CaseIndex = { [state: string]: Case }

/** Represents all case information for a given country including states if application. */
export type Country = {
    name: string,
    lat: number,
    lng: number,
    totalCases: number, // The last value of <dailyCases>
    caseIndex?: CaseIndex, // Represents cases for individual states/geographic areas
    dailyCases: number[], // Number of total cases for each date
}

/** Represents all case information for a given place such as a country or state. */
export type Case = {
    state: string | undefined,
    country: string,
    lat: number,
    lng: number,
    totalCases: number, // The last value of <dailyCases>
    dailyCases: number[], // Number of total cases for each date
}