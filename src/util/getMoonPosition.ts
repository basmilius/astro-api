import { DateTime } from 'luxon';
import { dateToJulian, type EquatorialCoords, equatorialToHorizontal, normalize, RAD } from './astronomy';

export type MoonPosition = {
    readonly azimuth: number;
    readonly altitude: number;
    readonly distance: number;
};

export default function getMoonPosition(date: DateTime, latitude: number, longitude: number): MoonPosition {
    const jd = dateToJulian(date);
    const T = (jd - 2451545.0) / 36525;

    // Moon's orbital elements
    const L0 = normalize(218.3164477 + 481267.88123421 * T);
    const M = normalize(134.9633964 + 477198.8675055 * T) * RAD;
    const F = normalize(93.2720950 + 483202.0175233 * T) * RAD;
    const D = normalize(297.8501921 + 445267.1114034 * T) * RAD;
    const Ms = normalize(357.5291092 + 35999.0502909 * T) * RAD;

    // Corrections
    const dL = 6.289 * Math.sin(M) + 1.274 * Math.sin(2 * D - M) + 0.658 * Math.sin(2 * D)
        + 0.214 * Math.sin(2 * M) - 0.186 * Math.sin(Ms) - 0.114 * Math.sin(2 * F);
    const dB = 5.128 * Math.sin(F) + 0.281 * Math.sin(M + F) + 0.278 * Math.sin(M - F) + 0.173 * Math.sin(2 * D - F);
    const dR = -20.905 * Math.cos(M) - 3.699 * Math.cos(2 * D - M) - 2.956 * Math.cos(2 * D) - 0.569 * Math.cos(2 * M);

    const moonLon = (L0 + dL) * RAD;
    const moonLat = dB * RAD;
    const distance = 385000.56 + dR * 1000;

    const coords = eclipticToEquatorial(moonLon, moonLat);
    const horizontal = equatorialToHorizontal(coords, jd, latitude, longitude);

    return {
        ...horizontal,
        distance: Math.round(distance)
    };
}

function eclipticToEquatorial(lon: number, lat: number): EquatorialCoords {
    const obliquity = 23.4393 * RAD;
    const sinLon = Math.sin(lon);
    const cosLon = Math.cos(lon);
    const sinLat = Math.sin(lat);
    const cosLat = Math.cos(lat);
    const sinObl = Math.sin(obliquity);
    const cosObl = Math.cos(obliquity);

    return {
        rightAscension: Math.atan2(sinLon * cosObl - Math.tan(lat) * sinObl, cosLon),
        declination: Math.asin(sinLat * cosObl + cosLat * sinObl * sinLon)
    };
}
