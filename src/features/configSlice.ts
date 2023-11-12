import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../app/store';

let initialConfigState = {
	APIKeyInEdit: false,
};

let configSlice = createSlice({
	name: 'config',
	initialState: initialConfigState,
	reducers: {
		toggleAPIKeyInEdit: (state) => {
			state.APIKeyInEdit = !state.APIKeyInEdit;
		},
	},
});

export var selectConfig = (state: RootState) => state.config;

export var { toggleAPIKeyInEdit } = configSlice.actions;

export default configSlice.reducer;
