// redux toolkit
import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit';

// redux persist
import { persistStore, persistReducer, createTransform } from 'redux-persist'; // doc: https://blog.reactnativecoach.com/the-definitive-guide-to-redux-persist-84738167975
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

// compress
import { compress, decompress } from 'lz-string';

// reducers
import articleReducer from '../features/articleSlice';
import modalReducer from '../features/modalSlice';
import configReducer from '../features/configSlice';

var compressTransform = createTransform(
	(state) => compress(JSON.stringify(state)),
	(state) => JSON.parse(decompress(state))
);

var articlePersistConfig = {
	key: 'article',
	storage,
	stateReconciler: autoMergeLevel2,
	transforms: [compressTransform],
	blacklist: ['paragraphRemoveQueue', 'articleRemoveQueue'],
};

var configPersistConfig = {
	key: 'config',
	storage,
};

export var rootReducer = combineReducers({
	article: persistReducer<ReturnType<typeof articleReducer>>(articlePersistConfig, articleReducer), //https://github.com/rt2zz/redux-persist/issues/1368
	modal: modalReducer,
	config: persistReducer<ReturnType<typeof configReducer>>(configPersistConfig, configReducer),
});

export function setupStore(preloadedState?: Partial<RootState>) {
	return configureStore({
		reducer: rootReducer, //https://github.com/rt2zz/redux-persist/issues/1368
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: false,
			}),
		preloadedState,
	});
}

export var store = setupStore();

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
