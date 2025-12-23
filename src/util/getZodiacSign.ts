import { DateTime } from 'luxon';

export type ZodiacSignName =
    | 'aquarius'
    | 'aries'
    | 'cancer'
    | 'capricorn'
    | 'gemini'
    | 'leo'
    | 'libra'
    | 'pisces'
    | 'sagittarius'
    | 'scorpio'
    | 'taurus'
    | 'virgo';

export interface ZodiacSignInfo {
    sign: ZodiacSignName;
    startDate: DateTime;
    endDate: DateTime;
}

interface ZodiacPeriod {
    sign: ZodiacSignName;
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
}

const ZODIAC_PERIODS: ZodiacPeriod[] = [
    {sign: 'aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19},
    {sign: 'taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20},
    {sign: 'gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20},
    {sign: 'cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22},
    {sign: 'leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22},
    {sign: 'virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22},
    {sign: 'libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22},
    {sign: 'scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21},
    {sign: 'sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21},
    {sign: 'capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19},
    {sign: 'aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18},
    {sign: 'pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20}
];

export default function getZodiacSign(date: DateTime): ZodiacSignInfo {
    const year = date.year;

    for (const period of ZODIAC_PERIODS) {
        const startYear = period.startMonth > period.endMonth && date.month <= period.endMonth
            ? year - 1
            : year;
        const endYear = period.startMonth > period.endMonth && date.month >= period.startMonth
            ? year + 1
            : year;

        const startDate = DateTime.fromObject({year: startYear, month: period.startMonth, day: period.startDay});
        const endDate = DateTime.fromObject({year: endYear, month: period.endMonth, day: period.endDay});

        if (date >= startDate && date <= endDate) {
            return {
                sign: period.sign,
                startDate,
                endDate
            };
        }
    }

    // Fallback (should never reach here)
    const pisces = ZODIAC_PERIODS[11];
    return {
        sign: 'pisces',
        startDate: DateTime.fromObject({year, month: pisces.startMonth, day: pisces.startDay}),
        endDate: DateTime.fromObject({year, month: pisces.endMonth, day: pisces.endDay})
    };
}
