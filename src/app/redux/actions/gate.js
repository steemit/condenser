import {
    GATE_SEND_MESSAGE,
    GATE_NOTIFY_GET_HISTORY,
    GATE_NOTIFY_GET_HISTORY_SUCCESS,
    GATE_NOTIFY_GET_HISTORY_ERROR,
} from 'src/app/redux/constants/gate';
import Schemas from 'src/app/redux/sagas/gate/api/schemas';
import { hydrateNotifies } from 'src/app/redux/sagas/gate/notifies';

export function notifyGetHistory({ skip = 0, limit = 10, types = 'all' }) {
    return {
        type: GATE_SEND_MESSAGE,
        payload: {
            method: 'notify.history',
            types: [
                GATE_NOTIFY_GET_HISTORY,
                GATE_NOTIFY_GET_HISTORY_SUCCESS,
                GATE_NOTIFY_GET_HISTORY_ERROR,
            ],
            data: { skip, limit, types },
            saga: hydrateNotifies,
            schema: Schemas.NOTIFY_ARRAY,
        },
        meta: { skip, limit, types },
    };
}
