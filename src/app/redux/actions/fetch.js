
export function fetchCurrentStateAction() {
    return {
        type: 'FETCH_STATE',
        payload: {
            pathname: location.pathname,
        },
    };
}
