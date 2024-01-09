import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export var useAppDispatch: () => AppDispatch = useDispatch;
export var useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
