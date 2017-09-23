var store = false

export const setStore = (theStore) => {
    if(!store) {
        store = theStore;
        window.theStore = theStore
    } else {
        throw Error("Routes.setStore - store has already been set.")
    }
}

export const routeProfile = (userName) => {
        return '/@' + ((userName)? userName : store.getState().user.getIn(['current', 'username']))
}

export default {
    profile: routeProfile
}
