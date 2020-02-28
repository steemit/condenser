export const AccessLocalStorage = accessFn => {
    try {
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
