export const AccessLocalStorage = accessFn => {
    try {
        const key = '__some_random_key_you_are_not_going_to_use__';
        localStorage.setItem(key, key);
        localStorage.removeItem(key);
        accessFn();
    } catch (e) {
        console.log(
            'Unable to access localStorage with function:',
            accessFn,
            'Error is:',
            e
        );
        return false;
    }
};
