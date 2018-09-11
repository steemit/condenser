import React from 'react';
import { getStoreState } from 'app/clientRender';

const CURRENCY_SIGNS = {
    'USD': '$_',
    'EUR': '€_',
    'RUB': '_₽',
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

    let amountString;

    if (!amount) {
        amountString = '0';
    } else {
        amountString = amount.toFixed(decimalsCount);
    }

    if (CURRENCY_SIGNS[currency]) {
        return CURRENCY_SIGNS[currency].replace('_', amountString);
    } else {
        return `${amountString} ${currency}`;
    }
}

export function getPayout(data) {
    const max = parseFloat(data.get('max_accepted_payout'));
    const isDeclined = max === 0;

    let isLimit = false;
    let gbgValue = 0;

    gbgValue += parseFloat(data.get('pending_payout_value')) || 0;

    if (!isDeclined) {
        gbgValue += parseFloat(data.get('total_payout_value')) || 0;
        gbgValue += parseFloat(data.get('curator_payout_value')) || 0;
    }

    if (gbgValue < 0) {
        gbgValue = 0;
    }

    if (max != null && gbgValue > max) {
        gbgValue = max;
        isLimit = true;
    }

    let stringValue;

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

        const rounding = state.data.settings.getIn(['basic', 'rounding'], 3);

        stringValue = formatCurrency(gbgValue * rate, currency, rounding);
    } else {
        stringValue = `${gbgValue.toFixed(3)} GBG`;
    }

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

    return (
        <span style={style}>
            {stringValue}
        </span>
    );
}
