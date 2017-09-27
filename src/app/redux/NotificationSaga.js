/**
 * Placeholder for calls to Yo to get notifications.
 * see https://github.com/steemit/yo/issues/10 for Yo json spec
 */

import {takeLatest, takeEvery} from 'redux-saga';
import {call, put, select, fork} from 'redux-saga/effects';
import {loadFollows, fetchFollowCount} from 'app/redux/FollowSaga';
import {getContent} from 'app/redux/SagaShared';
import GlobalReducer from './GlobalReducer';
import constants from './constants';
import {fromJS, Map} from 'immutable'
import {api} from 'steem';
