import { configureStore } from "@reduxjs/toolkit"
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist"
import { combineReducers } from "redux"
import type { WebStorage } from "redux-persist"

import adminDataReducer from "./slices/adminData"
import allFixturesDataReducer from "./slices/matchData"
import tabsReducer from "./slices/tabslice"

export const rootReducer = combineReducers({
  adminData: adminDataReducer,
  allFixturesData: allFixturesDataReducer,
  tabs: tabsReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export let persistor: ReturnType<typeof persistStore>

const createNoopStorage = (): WebStorage => ({
  getItem(_key: string) {
    return Promise.resolve(null)
  },
  setItem(_key: string, value: unknown) {
    return Promise.resolve(value)
  },
  removeItem(_key: string) {
    return Promise.resolve()
  },
})

const storage =
  typeof window !== "undefined"
    ? require("redux-persist/lib/storage").default
    : createNoopStorage()

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["adminData", "allFixturesData", "tabs"],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

if (typeof window !== "undefined") {
  persistor = persistStore(store)
}

export type AppDispatch = typeof store.dispatch