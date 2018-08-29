import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { Router, applyRouterMiddleware, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { useScroll } from 'react-router-scroll';
import RootRoute from 'app/RootRoute';
import rootReducer from 'app/redux/reducers';
import rootSaga from 'app/redux/sagas';
import Translator from 'app/Translator';

let store = null;

export function getStoreState() {
    if (!store || !process.env.BROWSER) {
        throw new Error('NO_STORE');
    }

    return store.getState();
}

export function dispatch(action) {
    store.dispatch(action);
}

export default function clientRender(initialState) {
    let monitor;
    let sagaMiddleware;
    let middleware;

    let sagaDev;

    if (process.env.NODE_ENV === 'development') {
        if (process.env.SAGA_MONITOR) {
            sagaDev = require('redux-saga-devtools');
            monitor = sagaDev.createSagaMonitor();
        }

        sagaMiddleware = createSagaMiddleware({ sagaMonitor: monitor });
        const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
        middleware = composeEnhancers(applyMiddleware(thunk, sagaMiddleware));
    } else {
        sagaMiddleware = createSagaMiddleware();
        middleware = applyMiddleware(thunk, sagaMiddleware);
    }

    store = createStore(rootReducer, initialState, middleware);
    sagaMiddleware.run(rootSaga);

    const history = syncHistoryWithStore(browserHistory, store);

    // Bump transaction (for live UI testing).. Put 0 in now (no effect),
    // to enable browser's autocomplete and help prevent typos.
    window.bump = parseInt(localStorage.getItem('bump') || 0);
    const scroll = useScroll((prevLocation, { location }) => {
        if (location.hash || location.action === 'POP') return false;
        return !prevLocation || prevLocation.location.pathname !== location.pathname;
    });

    if (process.env.BROWSER && process.env.NODE_ENV === 'development') {
        window.__store = store;
    }

    const Wrapper =
        process.env.NODE_ENV !== 'production' && localStorage['react.strict']
            ? React.StrictMode
            : React.Fragment;

    return render(
        <Wrapper>
            <Provider store={store}>
                <Translator>
                    <Router
                        routes={RootRoute}
                        history={history}
                        onError={onRouterError}
                        render={applyRouterMiddleware(scroll)}
                    />
                </Translator>
            </Provider>
            {monitor && sagaDev && <sagaDev.DockableSagaView monitor={monitor} />}
        </Wrapper>,
        document.getElementById('content')
    );
}

function onRouterError(error) {
    console.error('onRouterError', error);
}
