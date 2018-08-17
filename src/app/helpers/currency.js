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
