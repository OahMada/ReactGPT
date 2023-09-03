import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import session from 'redux-persist/lib/storage/session'; // defaults to localStorage for web

import articleReducer from '../features/article/articleSlice';
import modalReducer from '../features/modal/modalSlice';

var persistConfig = {
	key: 'root',
	storage: session,
};

var rootReducer = combineReducers({
	article: persistReducer(persistConfig, articleReducer),
	modal: modalReducer,
});

export var store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
