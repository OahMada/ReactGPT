import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import articleReducer from '../features/article/articleSlice';
import modalReducer from '../features/modal/modalSlice';

export var store = configureStore({
	reducer: { article: articleReducer, modal: modalReducer },
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
