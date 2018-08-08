import { GATE_SEND_MESSAGE } from 'src/app/redux/constants/gate';
import {
    NOTIFY_GET_HISTORY,
    NOTIFY_GET_HISTORY_SUCCESS,
    NOTIFY_GET_HISTORY_ERROR,
} from 'src/app/redux/constants/notifies';
import Schemas from 'src/app/redux/sagas/gate/api/schemas';
import { hydrateNotifies } from 'src/app/redux/sagas/actions/notifies';

export function getNotifyHistory({ skip = 0, limit = 10, types = 'all' }) {
    return {
        type: GATE_SEND_MESSAGE,
        payload: {
            method: 'notify.history',
            types: [
                NOTIFY_GET_HISTORY,
                NOTIFY_GET_HISTORY_SUCCESS,
                NOTIFY_GET_HISTORY_ERROR,
            ],
            data: { skip, limit, types },
            saga: hydrateNotifies,
            schema: Schemas.NOTIFY_ARRAY,
        },
        meta: { skip, limit, types },
    };
}
