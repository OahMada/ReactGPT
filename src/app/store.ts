// redux toolkit
import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit';

// redux persist
import { persistStore, persistReducer } from 'redux-persist'; // doc: https://blog.reactnativecoach.com/the-definitive-guide-to-redux-persist-84738167975
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

// reducers
import articleReducer from '../features/article/articleSlice';
import modalReducer from '../features/modal/modalSlice';

var rootPersistConfig = {
	key: 'root',
	storage,
	stateReconciler: autoMergeLevel2,
	whitelist: ['article'],
};

var articlePersistConfig = {
	key: 'article',
	storage: sessionStorage,
};

var rootReducer = combineReducers({
	article: persistReducer(articlePersistConfig, articleReducer),
	modal: modalReducer,
});

export var store = configureStore({
	reducer: persistReducer<ReturnType<typeof rootReducer>>(rootPersistConfig, rootReducer), //https://github.com/rt2zz/redux-persist/issues/1368
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
