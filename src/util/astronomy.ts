import type { DateTime } from 'luxon';

export const RAD = Math.PI / 180;
export const DEG = 180 / Math.PI;

export function normalize(degrees: number): number {
    return ((degrees % 360) + 360) % 360;
}

export function dateToJulian(date: DateTime): number {
    const utc = date.toUTC();
    const y = utc.year;
    const m = utc.month;
    const d = utc.day + (utc.hour + utc.minute / 60 + utc.second / 3600) / 24;

    const a = Math.floor((14 - m) / 12);
    const y2 = y + 4800 - a;
    const m2 = m + 12 * a - 3;

    return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

export function getGMST(jd: number): number {
    const T = (jd - 2451545.0) / 36525;
    const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
    return normalize(gmst);
}

export function equatorialToHorizontal(coords: EquatorialCoords, jd: number, latitude: number, longitude: number): HorizontalCoords {
    const lst = (getGMST(jd) + longitude) * RAD;
    const hourAngle = lst - coords.rightAscension;

    const latRad = latitude * RAD;
    const sinLat = Math.sin(latRad);
    const cosLat = Math.cos(latRad);
    const sinDec = Math.sin(coords.declination);
    const cosDec = Math.cos(coords.declination);
    const cosHA = Math.cos(hourAngle);
    const sinHA = Math.sin(hourAngle);

    const altitude = Math.asin(sinLat * sinDec + cosLat * cosDec * cosHA) * DEG;
    const azimuth = normalize(Math.atan2(sinHA, cosHA * sinLat - Math.tan(coords.declination) * cosLat) * DEG + 180);

    return {
        azimuth: Math.round(azimuth * 100) / 100,
        altitude: Math.round(altitude * 100) / 100
    };
}

export type EquatorialCoords = {
    readonly rightAscension: number;
    readonly declination: number;
};

export type HorizontalCoords = {
    readonly azimuth: number;
    readonly altitude: number;
};
