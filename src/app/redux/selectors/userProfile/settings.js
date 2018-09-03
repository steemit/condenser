import {
    createDeepEqualSelector,
    pageAccountSelector,
    currentUserSelector,
    statusSelector,
    dataSelector,
    globalSelector,
} from './../common';
import { Map } from 'immutable';
import o2j from 'shared/clash/object2json';

// Settings selectors

const emptyMap = Map();

export const settingsContentSelector = createDeepEqualSelector(
    [
        pageAccountSelector,
        currentUserSelector,
        statusSelector('settings'),
        dataSelector('settings'),
        globalSelector('UserKeys_wifShown'),
    ],
    (pageAccount, currentUser, settingsStatus, settingsData, wifShown) => {
        const tempAccount = pageAccount.toJS();

        let metaData = tempAccount ? o2j.ifStringParseJSON(tempAccount.json_metadata) : {};
        if (typeof metaData === 'string') metaData = o2j.ifStringParseJSON(metaData); // issue #1237

        //fix https://github.com/GolosChain/tolstoy/issues/450
        if (
            typeof metaData === 'string' &&
            metaData.localeCompare("{created_at: 'GENESIS'}") == 0
        ) {
            metaData = {};
            metaData.created_at = 'GENESIS';
        }

        const profile = metaData && metaData.profile ? metaData.profile : {};

        return {
            account: pageAccount,
            metaData,
            profile,

            wifShown,
            privateKeys: currentUser.getIn(['private_keys'], emptyMap),
            options: settingsData,
            isFetching: settingsStatus.get('isFetching'),
            isChanging: settingsStatus.get('isChanging'),
        };
    }
);
