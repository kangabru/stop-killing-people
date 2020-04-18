export const enum PastDays { yesterday = 1, days3 = 2, week = 7, weeks2 = 14, month = 30 }
export const enum FutureDays { tomorrow = 1, days3 = 3, week = 7, weeks2 = 14, month = 30 }

type Cases = number[]

export function getCasesDataSinceDate(cases: Cases, days: PastDays): { casesAbsolute: number, casesGrowth: number } {
    const casesNow = cases.slice(-1)[0]
    const casesThen = cases.slice(-1 - days)[0]
    const absolute = casesNow - casesThen
    const multiple = 100 * (casesNow / casesThen - 1)
    return { casesAbsolute: absolute, casesGrowth: multiple }
}

export function getAvgGrowthRate(cases: Cases, days = 3): { growthRaw: number, growthDisplay: number, doubleDays: number } {
    const avgCases = cases.slice(-1 - days, cases.length)

    let sum = 0, count = 0
    for (let i = 1; i < avgCases.length; i++) {
        const curr = avgCases[i], last = avgCases[i - 1]
        const growth = curr / last
        sum += growth
        count += 1
    }

    const growthRaw = sum / count
    const growthDisplay = 100 * (growthRaw - 1)
    let doubleDays = growthRaw > 1 ? Math.ceil(Math.log(2) / Math.log(growthRaw)) : null
    return { growthRaw, growthDisplay, doubleDays }
}

export function getEstimatedGrowthCases(totalCases: number, growthRate: number, days: FutureDays): number {
    const estCases = Math.floor(totalCases * Math.pow(growthRate, days))
    return Math.floor(GetSignificantFigures(estCases, 2))
}

function GetSignificantFigures(value: number, sigFigs: number) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
    const valueDecimal = value / magnitude
    const sigFigMult = Math.pow(10, Math.max(0, sigFigs - 1))
    const valueDecimalRound = Math.round(valueDecimal * sigFigMult) / sigFigMult
    const valueRound = valueDecimalRound * magnitude
    return valueRound
}