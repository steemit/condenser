import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface TransactionState {
  operations: any[];
  status: {
    key: string;
    error: boolean;
    busy: boolean;
  };
  errors: {
    bandwidthError: boolean;
    [key: string]: any;
  };
  show_confirm_modal?: boolean;
  confirmBroadcastOperation?: any;
  confirmErrorCallback?: (msg: string) => void;
  confirm?: any;
  warning?: any;
}

const initialState: TransactionState = {
  operations: [],
  status: {
    key: '',
    error: false,
    busy: false,
  },
  errors: {
    bandwidthError: false,
  },
};

function lastPart(value: string, sep: string): string {
  const parts = value.split(sep);
  return parts[parts.length - 1];
}

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    confirmOperation: (state, action: PayloadAction<{
      operation: any;
      confirm?: any;
      warning?: any;
      errorCallback?: (msg: string) => void;
    }>) => {
      const { operation, confirm, warning, errorCallback } = action.payload;
      state.show_confirm_modal = true;
      state.confirmBroadcastOperation = operation;
      state.confirmErrorCallback = errorCallback;
      state.confirm = confirm;
      state.warning = warning;
    },
    hideConfirm: (state) => {
      state.show_confirm_modal = false;
      state.confirmBroadcastOperation = undefined;
      state.confirm = undefined;
    },
    broadcastOperation: (state) => {
      // Saga handles this, no state change
    },
    error: (state, action: PayloadAction<{
      operations?: any[];
      error: Error;
      errorCallback: (msg: string) => void;
    }>) => {
      const { error, errorCallback } = action.payload;
      
      let msg: string;
      let key = error.toString().replace(/rethrow$/, '');

      if (/You may only post once every/.test(key)) {
        msg = 'You may only post once every five minutes.';
      } else if (/Your current vote on this comment is identical/.test(key)) {
        msg = 'Your current vote on this comment is identical to this vote.';
      } else if (/Please wait to transact, or power up STEEM/.test(key)) {
        try {
          const m = Array.from(key.matchAll(/(\d+) RC/g));
          const spv = 0.0005;
          const fudge = 1.1;
          const has_vests = parseInt(m[0][1], 10) / 1e6;
          const needs_vests = parseInt(m[1][1], 10) / 1e6;
          const sp = ((needs_vests - has_vests) * spv * fudge).toFixed(3);
          msg = `Bandwidth error: insufficient Resource Credits. Please wait to transact, or power up ${sp} STEEM.`;
        } catch (e) {
          console.error('bandwidth parse error', key);
          msg = 'Bandwidth error: ' + lastPart(key, ':');
        }
      } else if (/unknown key: /.test(key)) {
        msg = "Transaction failed: Steem account doesn't exist.";
      } else if (/missing required posting authority/.test(key)) {
        msg = lastPart(key, ':');
      } else if (/Cannot delete a comment with net positive/.test(key)) {
        msg = lastPart(key, ':');
      } else if (/current vote on this comment is identical/.test(key)) {
        msg = 'You already voted on this post.';
      } else if (/transaction tapos exception/.test(key)) {
        msg = 'Unable to complete transaction. Try again later. (Cause: ' + key + ')';
      } else {
        msg = 'Transaction broadcast error: ' + lastPart(key, ':');
        console.error('unhandled error:', key, 'msg:', error.message);
      }

      // Store error message
      if (!state.errors) {
        state.errors = {
          bandwidthError: false,
        };
      }
      state.errors[key] = msg;

      if (msg.includes('RC') || msg.includes('Bandwidth')) {
        state.errors.bandwidthError = true;
      }

      if (!errorCallback) {
        throw new Error(`PANIC: no error callback for '${key}'`);
      }
      errorCallback(msg);
    },
    deleteError: (state, action: PayloadAction<{ key: string }>) => {
      if (state.errors && state.errors[action.payload.key]) {
        delete state.errors[action.payload.key];
      }
    },
    dismissError: (state, action: PayloadAction<{ key: string }>) => {
      if (state.errors) {
        state.errors[action.payload.key] = false;
      }
    },
    set: (state, action: PayloadAction<{ key: string | string[]; value: any }>) => {
      const { key, value } = action.payload;
      const keys = Array.isArray(key) ? key : [key];
      
      let current: any = state;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current) || typeof current[k] !== 'object') {
          current[k] = {};
        }
        current = current[k];
      }
      current[keys[keys.length - 1]] = value;
    },
    remove: (state, action: PayloadAction<{ key: string | string[] }>) => {
      const { key } = action.payload;
      const keys = Array.isArray(key) ? key : [key];
      
      let current: any = state;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          return;
        }
        current = current[k];
      }
      delete current[keys[keys.length - 1]];
    },
  },
});

export const {
  confirmOperation,
  hideConfirm,
  broadcastOperation,
  error,
  deleteError,
  dismissError,
  set,
  remove,
} = transactionSlice.actions;

export default transactionSlice.reducer;
