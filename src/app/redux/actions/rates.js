import { RATES_GET_HISTORICAL } from '../constants/rates';

export function getHistoricalData(payload) {
    return { type: RATES_GET_HISTORICAL, payload };
}
