import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import ContactModel from '../../generated/com/vaadin/tutorial/crm/backend/entity/ContactModel';

import type Contact from '../../generated/com/vaadin/tutorial/crm/backend/entity/Contact'
import type { RootState } from '../../store';

export interface ContactsViewState {
  filter: string;
  selectedContactId?: Contact['id'];
}

export type ContactsViewRootState = RootState & {
  contactList: ContactsViewState
};

const initialState: ContactsViewState = {
  filter: '',
  selectedContactId: undefined
};

export const filteredContactsSelector = createSelector(
  (state: ContactsViewRootState) => state.contacts.contacts,
  (state: ContactsViewRootState) => state.contactList.filter,
  (contacts, filter) => {
    const lowercaseFilter = filter.toLowerCase();
    return contacts.filter(c =>
      c.firstName.toLowerCase().includes(lowercaseFilter)
      || c.lastName.toLowerCase().includes(lowercaseFilter));
  }
);

export const selectedContactSelector = createSelector(
  (state: ContactsViewRootState) => state.contacts.contacts,
  (state: ContactsViewRootState) => state.contactList.selectedContactId,
  (contacts, selectedContactId) => {
    return selectedContactId === 0
      ? ContactModel.createEmptyValue()
      : contacts.find(c => c.id === selectedContactId);
  }
);

const contactListSlice = createSlice({
  name: 'contacts-view',
  initialState,
  reducers: {
    addNewContact(state) {
      state.selectedContactId = 0;
    },
    setFilter(state, action: PayloadAction<string>) {
      state.filter = action.payload;
    },
    setSelectedContact(state, action: PayloadAction<Contact | undefined>) {
      state.selectedContactId = action.payload?.id;
    },
    clearSelection(state) {
      state.selectedContactId = undefined;
    },
  }
});

export const contactListReducer = contactListSlice.reducer;
export const { addNewContact, clearSelection, setSelectedContact, setFilter } = contactListSlice.actions;
