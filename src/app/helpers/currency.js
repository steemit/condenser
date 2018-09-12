import React from 'react';
import { getStoreState } from 'app/clientRender';

const CURRENCY_SIGNS = {
    USD: '$_',
    EUR: '€_',
    RUB: '_₽',
};

export function parseAmount(amount, balance, isFinal) {
    const amountFixed = amount.trim().replace(/\s+/, '');

    const amountValue = parseFloat(amountFixed);

    let error;

    const match = amountFixed.match(/\.(\d+)/);

    if (match && match[1].length > 3) {
        error = 'Можно использовать только 3 знака после запятой';
    } else if (!/^\d*(?:\.\d*)?$/.test(amountFixed)) {
        error = 'Неправильный формат';
    } else if (amountValue && amountValue > balance) {
        error = 'Недостаточно средств';
    } else if (amountFixed !== '' && amountValue === 0 && isFinal) {
        error = 'Введите сумму';
    }

    return {
        error,
        value: error ? null : amountValue,
    };
}

export function parseAmount2(amount, balance, isFinal, multiplier) {
    const amountFixed = amount.trim().replace(/\s+/, '');

    const amountValue = Math.round(parseFloat(amountFixed) * multiplier);

    let error;

    const match = amountFixed.match(/\.(\d+)/);

    if (match && match[1].length > 3) {
        error = 'Можно использовать только 3 знака после запятой';
    } else if (!/^\d*(?:\.\d*)?$/.test(amountFixed)) {
        error = 'Неправильный формат';
    } else if (amountValue && amountValue > balance) {
        error = 'Недостаточно средств';
    } else if (amountFixed !== '' && amountValue === 0 && isFinal) {
        error = 'Введите сумму';
    }

    return {
        error,
        value: error ? null : amountValue,
    };
}

export function formatCurrency(amount, currency, decimals) {
    let amountString;

    if (!amount) {
        amountString = '0';
    } else {
        if (decimals === 'short') {
            let value;
            let suffix = '';

            if (amount > 1000000000) {
                value = amount / 1000000000;
                suffix = 'B';
            } else if (amount > 1000000) {
                value = amount / 1000000;
                suffix = 'M';
            } else if (amount > 1000) {
                value = amount / 1000;
                suffix = 'K';
            } else {
                value = amount;
            }

            amountString = `${value.toFixed(value > 100 ? 0 : 1)}${suffix}`;
        } else {
            let decimalsCount;

            if (decimals === 'adaptive') {
                if (amount < 10 && !CURRENCY_SIGNS[currency]) {
                    decimalsCount = 3;
                } else if (amount < 100) {
                    decimalsCount = 2;
                } else if (amount < 1000) {
                    decimalsCount = 1;
                } else {
                    decimalsCount = 0;
                }
            } else if (decimals) {
                decimalsCount = decimals;
            } else {
                decimalsCount = CURRENCY_SIGNS[currency] ? 2 : 3;
            }

            amountString = amount.toFixed(decimalsCount);
        }
    }

    if (CURRENCY_SIGNS[currency]) {
        return CURRENCY_SIGNS[currency].replace('_', amountString);
    } else {
        return `${amountString} ${currency}`;
    }
}

export function renderValue(amount, decimals) {
    if (process.env.BROWSER) {
        const state = getStoreState();

        let currency = state.data.settings.getIn(['basic', 'currency'], 'GBG');
        let rate;

        if (currency !== 'GBG') {
            rate = state.global.getIn(['rates', 'GBG', currency]);
        }

        if (!rate) {
            currency = 'GBG';
            rate = 1;
        }

        let dec = decimals;

        if (dec == null) {
            dec = state.data.settings.getIn(['basic', 'rounding'], 3);
        }

        return formatCurrency(amount * rate, currency, dec);
    } else {
        return `${amount.toFixed(3)} GBG`;
    }
}

export function getPayout(data) {
    let params;

    if (data.toJS) {
        params = {
            max_accepted_payout: data.get('max_accepted_payout'),
            pending_payout_value: data.get('pending_payout_value'),
            total_payout_value: data.get('total_payout_value'),
            curator_payout_value: data.get('curator_payout_value'),
        };
    } else {
        params = data;
    }

    const max = parseFloat(params.max_accepted_payout);
    const isDeclined = max === 0;

    let isLimit = false;
    let gbgValue = 0;

    gbgValue += parseFloat(params.pending_payout_value) || 0;

    if (!isDeclined) {
        gbgValue += parseFloat(params.total_payout_value) || 0;
        gbgValue += parseFloat(params.curator_payout_value) || 0;
    }

    if (gbgValue < 0) {
        gbgValue = 0;
    }

    if (max != null && gbgValue > max) {
        gbgValue = max;
        isLimit = true;
    }

    const stringValue = renderValue(gbgValue);

    let style;

    if (isLimit || isDeclined) {
        style = {};

        if (isLimit) {
            style.opacity = 0.33;
        }

        if (isDeclined) {
            style.textDecoration = 'line-through';
        }
    }

    return <span style={style}>{stringValue}</span>;
}
