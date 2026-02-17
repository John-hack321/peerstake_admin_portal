// redux store setup imports
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { combineReducers } from 'redux';
import type { WebStorage } from 'redux-persist';

// Import your reducers
import adminDataReducer from "./slices/adminData"

// Root reducer
export const rootReducer = combineReducers({
    adminData: adminDataReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export let persistor: ReturnType<typeof persistStore>;

// Create storage wrapper that only works on client-side
const createNoopStorage = (): WebStorage => {
    return {
    getItem(_key: string) {
        return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
        return Promise.resolve(value);
    },
    removeItem(_key: string) {
        return Promise.resolve();
    },
    };
};

const storage = typeof window !== 'undefined' 
    ? require('redux-persist/lib/storage').default 
    : createNoopStorage();

// Persist config
const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['adminData',''],
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with middleware
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }),
});

// Create persistor
if (typeof window !== 'undefined') {
    persistor = persistStore(store);
}

export type AppDispatch = typeof store.dispatch;