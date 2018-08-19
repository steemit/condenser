import { createSelectorCreator, defaultMemoize } from 'reselect';
import isEqual from 'react-fast-compare';

// Create a "selector creator" that uses react-fast-compare instead of '==='
// More info you can find in: https://github.com/reduxjs/reselect#api
export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

// export const routerSelector = state => state.router;
export const globalSelector = type => state => state.global.get(type);
export const statusSelector = type => state => state.status[type];
export const entitiesSelector = type => state => state.entities[type];
export const uiSelector = type => state => state.ui[type];

// Router selectors

export const routerParamSelector = name => (state, props) => props.params[name];

// Entities selectors

// Возвращает сущности определенного типа (type) в виде массива.
export const entitiesArraySelector = type =>
    createDeepEqualSelector([entitiesSelector(type)], entities => entities.toList());

// Возвращает конкретную сушность по указанному типу (type) сущности и её id
export const entitySelector = (type, id) =>
    createDeepEqualSelector([entitiesSelector(type)], entities => entities[id]);

// Users selectors

export const pageAccountSelector = createDeepEqualSelector(
    [globalSelector('accounts'), routerParamSelector('accountName')],
    (accounts, userName) => accounts.get(userName)
);
