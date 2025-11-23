import { put, takeEvery, select } from 'redux-saga/effects';
import { fromJS, Set, List } from 'immutable';
import { getDynamicGlobalProperties } from 'app/utils/steemApi';
import * as globalActions from 'app/redux/GlobalReducer';

export const globalWatches = [takeEvery(globalActions.GET_DGP, getDGP)];

export function* getDGP() {
    let dgp = yield select(state => state.global.get('dgp'));
    if (!dgp) {
        dgp = yield getDynamicGlobalProperties();
        yield put(globalActions.setDGP(dgp));
        yield put(
            globalActions.setVestsPerSteem(
                dgp.total_vesting_shares.split(' ')[0] /
                    dgp.total_vesting_fund_steem.split(' ')[0]
            )
        );
    }
}
