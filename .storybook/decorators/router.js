import React from 'react';
import { Router as ReactRouter, Route } from 'react-router';
import createMemoryHistory from 'react-router/lib/createMemoryHistory';

export const Router = story => (
    <ReactRouter history={createMemoryHistory('/')}>
        <Route path="/" component={() => story()} />
    </ReactRouter>
);
