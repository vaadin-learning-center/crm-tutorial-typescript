import { combineReducers, configureStore } from '@reduxjs/toolkit';
// @ts-ignore
import dynostore, { dynamicReducers }  from '@redux-dynostore/core'
import { authReducer } from './auth';
import { contactsReducer } from './contacts';

const rootReducer = combineReducers({
  auth: authReducer,
  contacts: contactsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  enhancers: [dynostore(dynamicReducers())]
});
