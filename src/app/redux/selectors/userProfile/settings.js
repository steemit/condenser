import { createDeepEqualSelector, pageAccountSelector, statusSelector, globalSelector } from './../common';
import o2j from 'shared/clash/object2json';

// Settings selectors

export const settingsContentSelector = createDeepEqualSelector(
    [pageAccountSelector, statusSelector('settings'), globalSelector('UserKeys_wifShown')],
    (pageAccount, settingsStatus, wifShown) => {
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
            options: settingsStatus.get('options'),
            isFetching: settingsStatus.get('isFetching'),
            isChanging: settingsStatus.get('isChanging'),
        };
    }
);
