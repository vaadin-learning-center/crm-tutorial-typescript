import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as API from '../generated/ServiceEndpoint';

import type Company from '../generated/com/vaadin/tutorial/crm/backend/entity/Company';
import type Contact from '../generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import type Status from '../generated/com/vaadin/tutorial/crm/backend/entity/Contact/Status';
import type { RootState } from './index';

// Use a custom helper to avoid updating the contacts / companies state properties
// when the actual entities data has not changed, so that the `contacts.value` /
// `companies.value` state property remains the same JS instance, so that selectors
// that only check for shallow equality are not triggered again on the same data,
// so that there is no performance hit when an optimistic update to the
// `contacts.value` / `companies.value` property is successful, i.e. the actual
// data eventually received from the backend matches the data already present in the
// store.
import { updateEntityArrayInPlace } from '../utils/update-entity-in-place';

export interface ContactStore {
  companies: Company[];
  contacts: Contact[];
  statuses: Status[];
}

const initialState: ContactStore = {
  companies: [],
  contacts: [],
  statuses: [],
};

export const initCompanies = createAsyncThunk(
  'initCompanies',
  async (_: any, thunkAPI) => {
    const store = thunkAPI.getState() as RootState;
    if (store.auth.isLoggedIn) {
      return await API.findAllCompanies();
    } else {
      return [];
    }
  }
);

// TODO: find a way to init the contacts store once after each login
// NOTE: same for the list of companies and contact statuses
//
// Ideally, this action should fetch the backend data only once after each
// login:
//  - if the user is not logged in, it should be a no-op (does not matter
//    how many times it's dispatched)
//  - if the user is logged in, and this is the first time that this action
//    is dispatched after the user has logged in, it should fetch the data
//    from the backend
//  - if the user is logged in, but the backend data has been fetched already,
//    once, then this should be a no-op
//
// In the current impl. this action always fetches the backend data, and
// it's dispatched by every view that needs this data. That  leads to
// re-fetching the entire contact list on every navigation to any of such
// views.
export const initContacts = createAsyncThunk(
  'initContacts',
  async (_: any, thunkAPI) => {
    const store = thunkAPI.getState() as RootState;
    if (store.auth.isLoggedIn) {
      return await API.find('');
    } else {
      return [];
    }
  }
);

export const initStatuses = createAsyncThunk(
  'initStatuses',
  async (_: any, thunkAPI) => {
    const store = thunkAPI.getState() as RootState;
    if (store.auth.isLoggedIn) {
      return await API.getContactStatuses();
    } else {
      return [];
    }
  }
);

export const saveContact = createAsyncThunk(
  'saveContact',
  async (contact: Contact) => {
    await API.saveContact(contact);
    return API.find('');
  }
);

export const deleteContact = createAsyncThunk(
  'deleteContact',
  async (contact: Contact) => {
    await API.deleteContact(contact);
    return API.find('');
  }
);

const contactStoreSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
  },
  extraReducers: builder => {
    builder.addCase(initCompanies.fulfilled, (state, action) => {
      updateEntityArrayInPlace(state.companies, action.payload);
    });
    builder.addCase(initContacts.fulfilled, (state, action) => {
      updateEntityArrayInPlace(state.contacts, action.payload);
    });
    builder.addCase(initStatuses.fulfilled, (state, action) => {
      state.statuses = action.payload;
    });
    builder.addCase(saveContact.pending, (state, action) => {
      // optimistic UI update
      const contact = action.meta.arg;
      const idx = state.contacts.findIndex(c => c.id === contact.id);
      if (idx > -1) {
        state.contacts[idx] = contact;
      } else {
        state.contacts.push(contact);
      }
    });
    builder.addCase(saveContact.fulfilled, (state, action) => {
      updateEntityArrayInPlace(state.contacts, action.payload);
    });
    builder.addCase(deleteContact.pending, (state, action) => {
      // optimistic UI update
      const contact = action.meta.arg;
      const idx = state.contacts.findIndex(c => c.id === contact.id);
      if (idx > -1) {
        state.contacts.splice(idx, 1);
      }
    });
    builder.addCase(deleteContact.fulfilled, (state, action) => {
      updateEntityArrayInPlace(state.contacts, action.payload);
    });
  }
});

export const contactsReducer = contactStoreSlice.reducer;
