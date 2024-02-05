import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ModifiedObj, paragraphStatus } from '../types';
import { RootState } from '../redux/store';

interface elementPositionDimension {
	left: number;
	top: number;
}

interface ModalProperties {
	dimension: elementPositionDimension;
	color: string;
	indexInParagraph: number;
	paragraphStatus: paragraphStatus;
	paragraphId: string;
}

export interface ModalType extends ModalProperties {
	title: string;
	content: string;
	displayModal: boolean;
}

interface payloadType extends ModalProperties {
	modifiedObj: ModifiedObj;
}

let initialState: ModalType = {
	title: '',
	content: '',
	dimension: { left: 0, top: 0 },
	color: '',
	displayModal: false,
	indexInParagraph: 0, // used to find the right element in adjustmentObjectArr to update its content
	paragraphId: '',
	paragraphStatus: null,
};

let modalSlice = createSlice({
	name: 'modal',
	initialState,
	reducers: {
		updateModalContent: (state, action: PayloadAction<payloadType>) => {
			let status = action.payload.paragraphStatus;
			let { added, addedValue, removed, removedValue } = action.payload.modifiedObj;
			if (added && removed) {
				state.title = 'Original Value: ';
				if (status === 'modifying') {
					state.content = removedValue!;
				} else if (status === 'reviving') {
					state.content = addedValue!;
				}
			}
			if (added && !removed) {
				if (status === 'modifying') {
					state.title = 'Add: ';
				} else if (status === 'reviving') {
					state.title = 'Removed: ';
				}
				state.content = addedValue!;
			}
			if (removed && !added) {
				if (status === 'modifying') {
					state.title = 'Remove: ';
				} else if (status === 'reviving') {
					state.title = 'Added: ';
				}
				state.content = removedValue!;
			}

			state.dimension = action.payload.dimension;
			state.color = action.payload.color;
			state.indexInParagraph = action.payload.indexInParagraph;
			state.paragraphStatus = status;
			state.paragraphId = action.payload.paragraphId;
		},
		showModal: (state) => {
			state.displayModal = true;
		},
		hideModal: (state) => {
			state.displayModal = false;
		},
	},
});

export var selectModal = (state: RootState) => state.modal;

export var { updateModalContent, showModal, hideModal } = modalSlice.actions;

export default modalSlice.reducer;
