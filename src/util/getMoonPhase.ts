import { DateTime } from 'luxon';

export type MoonPhaseName =
    | 'new_moon'
    | 'waxing_crescent'
    | 'first_quarter'
    | 'waxing_gibbous'
    | 'full_moon'
    | 'waning_gibbous'
    | 'last_quarter'
    | 'waning_crescent';

export interface MoonPhaseInfo {
    readonly phase: MoonPhaseName;
    readonly startDate: DateTime;
    readonly endDate: DateTime;
    readonly moonAge: number;
    readonly illumination: number;
    readonly nextPhase: MoonPhaseName;
    readonly nextPhaseDate: DateTime;
}

// Average lunar cycle in days
const SYNODIC_MONTH = 29.530588853;

// Known new moon reference: January 6, 2000 at 18:14 UTC
const KNOWN_NEW_MOON = DateTime.fromISO('2000-01-06T18:14:00Z');

const PHASE_BOUNDARIES: { name: MoonPhaseName; start: number; end: number }[] = [
    {name: 'new_moon', start: 0, end: 0.0625},
    {name: 'waxing_crescent', start: 0.0625, end: 0.25},
    {name: 'first_quarter', start: 0.25, end: 0.3125},
    {name: 'waxing_gibbous', start: 0.3125, end: 0.5},
    {name: 'full_moon', start: 0.5, end: 0.5625},
    {name: 'waning_gibbous', start: 0.5625, end: 0.75},
    {name: 'last_quarter', start: 0.75, end: 0.8125},
    {name: 'waning_crescent', start: 0.8125, end: 1.0}
];

function getMoonAge(date: DateTime): number {
    const daysSince = date.diff(KNOWN_NEW_MOON, 'days').days;
    return ((daysSince % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
}

function calculateIllumination(phase: number): number {
    // Illumination follows a cosine curve
    return Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);
}

function getPhaseFromFraction(phaseFraction: number): { phase: MoonPhaseName; index: number } {
    const normalizedPhase = phaseFraction >= 1 ? phaseFraction - 1 : phaseFraction;

    for (let i = 0; i < PHASE_BOUNDARIES.length; i++) {
        const p = PHASE_BOUNDARIES[i];
        if (normalizedPhase >= p.start && normalizedPhase < p.end) {
            return {phase: p.name, index: i};
        }
    }

    // Fallback for edge case (exactly 1.0)
    return {phase: 'new_moon', index: 0};
}

export default function getMoonPhase(date: DateTime): MoonPhaseInfo {
    const age = getMoonAge(date);
    const phaseFraction = age / SYNODIC_MONTH;

    const {phase, index} = getPhaseFromFraction(phaseFraction);
    const currentBoundary = PHASE_BOUNDARIES[index];

    // Calculate start and end dates
    const daysFromPhaseStart = (phaseFraction - currentBoundary.start) * SYNODIC_MONTH;
    const daysToPhaseEnd = (currentBoundary.end - phaseFraction) * SYNODIC_MONTH;

    const startDate = date.minus({days: daysFromPhaseStart});
    const endDate = date.plus({days: daysToPhaseEnd});

    // Next phase
    const nextIndex = (index + 1) % PHASE_BOUNDARIES.length;
    const nextPhase = PHASE_BOUNDARIES[nextIndex].name;

    return {
        phase,
        startDate: startDate.startOf('day'),
        endDate: endDate.startOf('day'),
        moonAge: Math.round(age * 10) / 10,
        illumination: calculateIllumination(phaseFraction),
        nextPhase,
        nextPhaseDate: endDate.startOf('day')
    };
}
