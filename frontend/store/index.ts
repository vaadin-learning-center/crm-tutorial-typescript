import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { authReducer } from './auth';
import { contactsReducer } from './contacts';
import { contactListReducer } from './contact-list';

const rootReducer = combineReducers({
  auth: authReducer,
  contacts: contactsReducer,
  contactList: contactListReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
});
