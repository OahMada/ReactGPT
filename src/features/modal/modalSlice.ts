import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModifiedObj, articleStatus } from '../../types';

interface elementPositionDimension {
	left: number;
	top: number;
}

interface ModalProperties {
	dimension: elementPositionDimension;
	color: string;
	indexInArticle: number;
}

export interface ModalType extends ModalProperties {
	title: string;
	content: string;
	showModal: boolean;
}

interface payloadType extends ModalProperties {
	modifiedObj: ModifiedObj;
	articleStatus: articleStatus;
}

let initialState: ModalType = {
	title: '',
	content: '',
	dimension: { left: 0, top: 0 },
	color: '',
	showModal: false,
	indexInArticle: 0, // used to find the right element in adjustmentObjectArr to update its content
};

let modalSlice = createSlice({
	name: 'modal',
	initialState,
	reducers: {
		updateModalContent: (state, action: PayloadAction<payloadType>) => {
			let status = action.payload.articleStatus;
			let { added, addedValue, removed, removedValue } = action.payload.modifiedObj;
			if (added && removed) {
				if (status === 'modifying') {
					state.title = 'Replace With: ';
				} else if (status === 'reviving') {
					state.title = 'Replaced From: ';
				}
				state.content = addedValue!;
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
			state.indexInArticle = action.payload.indexInArticle;
		},
		showModal: (state) => {
			state.showModal = true;
		},
		hideModal: (state) => {
			state.showModal = false;
		},
	},
});

export var { updateModalContent, showModal, hideModal } = modalSlice.actions;

export default modalSlice.reducer;

/**
 * [
    {
        "value": "A voiced consonant (or sound) means that it uses the vocal cords"
    },
    {
        "value": ",",
        "added": true
    },
    {
        "value": " "
    },
    {
        "value": "producing",
        "added": true,
        "removed": true
    },
    {
        "value": " "
    },
    {
        "removedValue": "they produce ",
        "removed": true
    },
    {
        "value": "a vibration or humming sound in the throat when "
    },
    {
        "addedValue": "pronounced",
        "added": true,
        "removedValue": "they are said",
        "removed": true
    },
    {
        "value": ". "
    },
    {
        "addedValue": "Placing",
        "added": true,
        "removedValue": "Put",
        "removed": true
    },
    {
        "value": " your finger on your throat and "
    },
    {
        "addedValue": "pronouncing",
        "added": true,
        "removedValue": "then",
        "removed": true
    },
    {
        "value": " "
    },
    {
        "removedValue": "pronounce ",
        "removed": true
    },
    {
        "value": "the letter L"
    },
    {
        "addedValue": ",",
        "added": true,
        "removedValue": ".",
        "removed": true
    },
    {
        "value": " "
    },
    {
        "addedValue": "you",
        "added": true,
        "removedValue": "You",
        "removed": true
    },
    {
        "value": " will notice a slight vibration in your "
    },
    {
        "removedValue": "neck / ",
        "removed": true
    },
    {
        "value": "throat. "
    },
    {
        "addedValue": "This",
        "added": true,
        "removedValue": "That",
        "removed": true
    },
    {
        "value": " is because it is a voiced sound."
    }
]
 */
