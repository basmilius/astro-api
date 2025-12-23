import type { DateTime } from 'luxon';

export type SunTimes = {
    readonly sunrise: DateTime;
    readonly sunset: DateTime;
    readonly solarNoon: DateTime;
    readonly dawn: DateTime;
    readonly dusk: DateTime;
    readonly nauticalDawn: DateTime;
    readonly nauticalDusk: DateTime;
    readonly astronomicalDawn: DateTime;
    readonly astronomicalDusk: DateTime;
    readonly goldenHourStart: DateTime;
    readonly goldenHourEnd: DateTime;
};

export default function (date: DateTime, latitude: number, longitude: number): SunTimes {
    const rad = Math.PI / 180;
    const dayOfYear = date.ordinal;

    // Solar declination
    const declination = -23.45 * Math.cos(rad * (360 / 365) * (dayOfYear + 10));

    // Equation of time (in minutes)
    const b = (360 / 365) * (dayOfYear - 81);
    const equationOfTime = 9.87 * Math.sin(2 * b * rad) - 7.53 * Math.cos(b * rad) - 1.5 * Math.sin(b * rad);

    // Solar noon (in hours, local solar time)
    const solarNoonMinutes = 720 - (longitude * 4) - equationOfTime;

    // Hour angle for sunrise/sunset
    const cosHourAngle = (Math.sin(-0.833 * rad) - Math.sin(latitude * rad) * Math.sin(declination * rad)) / (Math.cos(latitude * rad) * Math.cos(declination * rad));

    // Clamp for polar regions
    const clampedCos = Math.max(-1, Math.min(1, cosHourAngle));
    const hourAngle = Math.acos(clampedCos) / rad;

    const sunriseMinutes = solarNoonMinutes - (hourAngle * 4);
    const sunsetMinutes = solarNoonMinutes + (hourAngle * 4);

    // Civil twilight (sun 6° below horizon)
    const cosDawn = (Math.sin(-6 * rad) - Math.sin(latitude * rad) * Math.sin(declination * rad)) / (Math.cos(latitude * rad) * Math.cos(declination * rad));
    const dawnAngle = Math.acos(Math.max(-1, Math.min(1, cosDawn))) / rad;
    const dawnMinutes = solarNoonMinutes - (dawnAngle * 4);
    const duskMinutes = solarNoonMinutes + (dawnAngle * 4);

    // Nautical twilight (sun 12° below horizon)
    const cosNautical = (Math.sin(-12 * rad) - Math.sin(latitude * rad) * Math.sin(declination * rad)) / (Math.cos(latitude * rad) * Math.cos(declination * rad));
    const nauticalAngle = Math.acos(Math.max(-1, Math.min(1, cosNautical))) / rad;
    const nauticalDawnMinutes = solarNoonMinutes - (nauticalAngle * 4);
    const nauticalDuskMinutes = solarNoonMinutes + (nauticalAngle * 4);

    // Astronomical twilight (sun 18° below horizon)
    const cosAstronomical = (Math.sin(-18 * rad) - Math.sin(latitude * rad) * Math.sin(declination * rad)) / (Math.cos(latitude * rad) * Math.cos(declination * rad));
    const astronomicalAngle = Math.acos(Math.max(-1, Math.min(1, cosAstronomical))) / rad;
    const astronomicalDawnMinutes = solarNoonMinutes - (astronomicalAngle * 4);
    const astronomicalDuskMinutes = solarNoonMinutes + (astronomicalAngle * 4);

    // Golden hour (sun 6° above horizon)
    const cosGolden = (Math.sin(6 * rad) - Math.sin(latitude * rad) * Math.sin(declination * rad)) / (Math.cos(latitude * rad) * Math.cos(declination * rad));
    const goldenAngle = Math.acos(Math.max(-1, Math.min(1, cosGolden))) / rad;
    const goldenHourStartMinutes = sunsetMinutes - ((sunsetMinutes - solarNoonMinutes) - (goldenAngle * 4));
    const goldenHourEndMinutes = sunriseMinutes + ((solarNoonMinutes - sunriseMinutes) - (goldenAngle * 4));

    return {
        sunrise: minutesToDateTime(date, sunriseMinutes),
        sunset: minutesToDateTime(date, sunsetMinutes),
        solarNoon: minutesToDateTime(date, solarNoonMinutes),
        dawn: minutesToDateTime(date, dawnMinutes),
        dusk: minutesToDateTime(date, duskMinutes),
        nauticalDawn: minutesToDateTime(date, nauticalDawnMinutes),
        nauticalDusk: minutesToDateTime(date, nauticalDuskMinutes),
        astronomicalDawn: minutesToDateTime(date, astronomicalDawnMinutes),
        astronomicalDusk: minutesToDateTime(date, astronomicalDuskMinutes),
        goldenHourStart: minutesToDateTime(date, goldenHourStartMinutes),
        goldenHourEnd: minutesToDateTime(date, goldenHourEndMinutes)
    };
}

function minutesToDateTime(date: DateTime, minutes: number): DateTime {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    return date.startOf('day').plus({hours, minutes: mins});
}
