import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Placeholder for TransactionSlice
interface TransactionState {
  [key: string]: any;
}

const initialState: TransactionState = {};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {},
});

export default transactionSlice.reducer;

