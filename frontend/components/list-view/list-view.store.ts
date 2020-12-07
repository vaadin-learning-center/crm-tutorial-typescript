import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { contactToBackend } from "../../store/entities";
import ContactModel from '../../generated/com/vaadin/tutorial/crm/backend/entity/ContactModel';

import type { Contact } from '../../store/entities';
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
  (state: ContactsViewRootState) => state.entities.contacts,
  (state: ContactsViewRootState) => state.contactList.filter,
  (contacts, filter) => {
    const lowercaseFilter = filter.toLowerCase();
    return contacts.ids.filter(id =>
      contacts.entities[id]?.firstName.toLowerCase().includes(lowercaseFilter)
      || contacts.entities[id]?.lastName.toLowerCase().includes(lowercaseFilter))
      .map(id => contacts.entities[id]!);
  }
);

export const selectedContactSelector = createSelector(
  (state: ContactsViewRootState) => state.entities.contacts,
  (state: ContactsViewRootState) => state.entities.companies,
  (state: ContactsViewRootState) => state.contactList.selectedContactId,
  (contacts, companies, selectedContactId) => {
    if (selectedContactId === undefined) {
      return undefined;
    }
    return selectedContactId === 0
      ? ContactModel.createEmptyValue()
      : contactToBackend(contacts.entities[selectedContactId]!, (id) => companies.entities[id]);
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
