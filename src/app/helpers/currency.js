
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
