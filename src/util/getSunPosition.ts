import type { DateTime } from 'luxon';
import { dateToJulian, equatorialToHorizontal, normalize, RAD } from './astronomy';

export interface SunPosition {
    azimuth: number;
    altitude: number;
    distance: number;  // in AU
}

export default function getSunPosition(date: DateTime, latitude: number, longitude: number): SunPosition {
    const jd = dateToJulian(date);
    const T = (jd - 2451545.0) / 36525;

    // Sun's orbital elements
    const L0 = normalize(280.46646 + 36000.76983 * T); // Mean longitude
    const M = normalize(357.52911 + 35999.05029 * T) * RAD; // Mean anomaly
    const e = 0.016708634 - 0.000042037 * T; // Eccentricity

    // Equation of center
    const C = (1.914602 - 0.004817 * T) * Math.sin(M)
        + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
        + 0.000289 * Math.sin(3 * M);

    const sunLon = (L0 + C) * RAD;
    const sunAnomaly = M + C * RAD;

    // Distance in AU
    const distance = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(sunAnomaly));

    // Convert to equatorial coordinates (sun's latitude is essentially 0)
    const obliquity = (23.439291 - 0.0130042 * T) * RAD;
    const rightAscension = Math.atan2(Math.cos(obliquity) * Math.sin(sunLon), Math.cos(sunLon));
    const declination = Math.asin(Math.sin(obliquity) * Math.sin(sunLon));

    const horizontal = equatorialToHorizontal({rightAscension, declination}, jd, latitude, longitude);

    return {
        ...horizontal,
        distance: Math.round(distance * 1000000) / 1000000 // AU with 6 decimal places
    };
}
