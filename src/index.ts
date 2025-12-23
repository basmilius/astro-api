import { createWorker, json, queryDate, queryPosition } from '@basmilius/worker';
import { getMoonPhase, getMoonPosition, getSunPosition, getSunTimes, getZodiacSign } from '@/util';

export default createWorker({
    '/moon': moonPhase,
    '/moon/position': moonPosition,
    '/sun': sunTimes,
    '/sun/position': sunPosition,
    '/zodiac': zodiacSign
});

async function moonPhase(req: Request): Promise<Response> {
    const date = queryDate(req);
    const info = getMoonPhase(date);

    return json({
        data: {
            phase: info.phase,
            start_date: info.startDate,
            end_date: info.endDate,
            moon_age: info.moonAge,
            illumination: info.illumination,
            next_phase: info.nextPhase,
            next_phase_date: info.nextPhaseDate
        },
        success: true
    });
}

async function moonPosition(req: Request): Promise<Response> {
    const date = queryDate(req);
    const position = queryPosition(req);
    const info = getMoonPosition(date, position.latitude, position.longitude);

    return json({
        data: {
            azimuth: info.azimuth,
            altitude: info.altitude,
            distance: info.distance
        },
        success: true
    });
}

async function sunPosition(req: Request): Promise<Response> {
    const date = queryDate(req);
    const position = queryPosition(req);
    const info = getSunPosition(date, position.latitude, position.longitude);

    return json({
        data: {
            azimuth: info.azimuth,
            altitude: info.altitude,
            distance: info.distance
        },
        success: true
    });
}

async function sunTimes(req: Request): Promise<Response> {
    const date = queryDate(req);
    const position = queryPosition(req);
    const info = getSunTimes(date, position.latitude, position.longitude);

    return json({
        data: {
            sunrise: info.sunrise,
            sunset: info.sunset,
            solar_noon: info.solarNoon,
            dawn: info.dawn,
            dusk: info.dusk,
            nautical_dawn: info.nauticalDawn,
            nautical_dusk: info.nauticalDusk,
            astronomical_dawn: info.astronomicalDawn,
            astronomical_dusk: info.astronomicalDusk,
            golden_hour_start: info.goldenHourStart,
            golden_hour_end: info.goldenHourEnd
        },
        success: true
    });
}

async function zodiacSign(req: Request): Promise<Response> {
    const date = queryDate(req);
    const info = getZodiacSign(date);

    return json({
        data: {
            sign: info.sign,
            start_date: info.startDate,
            end_date: info.endDate
        },
        success: true
    });
}
