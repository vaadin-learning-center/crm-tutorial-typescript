import { combineReducers, configureStore } from '@reduxjs/toolkit';
// @ts-ignore
import dynostore, { dynamicReducers }  from '@redux-dynostore/core'
import { authReducer } from './auth';
import { entitiesReducer } from './entities';

const rootReducer = combineReducers({
  auth: authReducer,
  entities: entitiesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  enhancers: [dynostore(dynamicReducers())]
});
