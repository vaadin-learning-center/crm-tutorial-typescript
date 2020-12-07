import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import * as ContactEndpoint from '../generated/ServiceEndpoint';
import * as CompanyEndpoint from '../generated/CompanyEndpoint';

import type BackendCompany from '../generated/com/vaadin/tutorial/crm/backend/entity/Company';
import type BackendContact from '../generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import type Status from '../generated/com/vaadin/tutorial/crm/backend/entity/Contact/Status';
import type State from '../generated/com/vaadin/tutorial/crm/backend/entity/Company/State';
import type { RootState } from './index';

export interface Contact {
  id: number,
  company?: number;
  email: string;
  firstName: string;
  lastName: string;
  status?: Status;
}

export interface Company {
  id: number,
  description?: string;
  employees?: Array<number>;
  name: string;
  state?: State;
}

// Entities received from an endpoint have a data shape incompatible with the
// entity data in the Redux store.
//
// The main difference is in how references are represented. The data from
// endpoints includes all referenced entities inline, (i.e. all references are
// JS objects) whereas the Redux store format requires references to be simple
// IDs.
function contactToRedux(contact: BackendContact): Contact {
  return {
    ...contact,
    company: contact.company?.id
  };
}

export function contactToBackend(contact: Contact, resolveCompany: ((id: number) => Company | undefined) | undefined): BackendContact {
  const company = !!resolveCompany && !!contact.company && resolveCompany(contact.company);
  return {
    ...contact,
    company: !!company
      ? companyToBackend(company, undefined)
      : undefined
  };
}

function companyToRedux(company: BackendCompany): Company {
  return {
    ...company,
    employees: company.employees?.map(e => e.id)
  };
}

export function companyToBackend(company: Company, resolveEmployee: ((id: number) => Contact | undefined) | undefined): BackendCompany {
  return {
    ...company,
    employees: (!!resolveEmployee && company.employees)
      ? company.employees
          .map(employeeId => resolveEmployee(employeeId), undefined)
          .filter(e => e !== undefined)
          .map(e => contactToBackend(e!, undefined))
      : undefined
  };
}

const companiesAdapter = createEntityAdapter<Company>();
const contactsAdapter = createEntityAdapter<Contact>();

const initialState = {
  companies: companiesAdapter.getInitialState(),
  contacts: contactsAdapter.getInitialState(),
  statuses: [] as Status[],
  states: [] as State[],
};

// TODO: find a way to init the entity store once after each login
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
      return await ContactEndpoint.find('');
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
      return await ContactEndpoint.getContactStatuses();
    } else {
      return [];
    }
  }
);

export const saveContact = createAsyncThunk(
  'saveContact',
  async (contact: BackendContact) => {
    await ContactEndpoint.saveContact(contact);
    return ContactEndpoint.find('');
  }
);

export const deleteContact = createAsyncThunk(
  'deleteContact',
  async (contact: BackendContact) => {
    await ContactEndpoint.deleteContact(contact);
    return ContactEndpoint.find('');
  }
);

export const initCompanies = createAsyncThunk(
  'initCompanies',
  async (_: any, thunkAPI) => {
    const store = thunkAPI.getState() as RootState;
    if (store.auth.isLoggedIn) {
      return await CompanyEndpoint.findAllCompanies();
    } else {
      return [];
    }
  }
);

export const initStates = createAsyncThunk(
  'initStates',
  async (_: any, thunkAPI) => {
    const store = thunkAPI.getState() as RootState;
    if (store.auth.isLoggedIn) {
      return await CompanyEndpoint.getCompanyStates();
    } else {
      return [];
    }
  }
);

export const saveCompany = createAsyncThunk(
  'saveCompany',
  async (company: Company, thunkAPI) => {
    // await new Promise(resolve => setTimeout(resolve, 5000));
    const state = thunkAPI.getState() as typeof initialState;
    await CompanyEndpoint.saveCompany(companyToBackend(company,
      (id) => state.contacts.entities[id]));
    return CompanyEndpoint.findAllCompanies()
  }
);

export const deleteCompany = createAsyncThunk(
  'deleteCompany',
  async (company: Company, thunkAPI) => {
    const state = thunkAPI.getState() as typeof initialState;
    await CompanyEndpoint.deleteCompany(companyToBackend(company,
      (id) => state.contacts.entities[id]));
    return CompanyEndpoint.findAllCompanies();
  }
);

function receiveContacts(state: typeof initialState, contacts: BackendContact[]) {
  // Prepare a list of all (unique) companies referenced by
  // the given list of contacts, in the MST snapshot format
  // (i.e. all entity references are replaced by their IDs).
  const companies = contacts.reduce(
    (map, contact: BackendContact) => {
      if (contact.company) {
        map.set(contact.company.id, companyToRedux(contact.company));
      }
      return map;
    },
    new Map<BackendCompany['id'], Company>()
  );

  const companiesUpdate = [];
  for (const [id, changes] of companies.entries()) {
    companiesUpdate.push({ id, changes });
  }
  companiesAdapter.updateMany(state.companies, companiesUpdate);

  // Convert the given list of contacts into the MST snapshot format
  // (i.e. all entity references are replaced by their IDs).
  const contactsSnap = contacts.map(contactToRedux);
  contactsAdapter.setAll(state.contacts, contactsSnap);
}

function receiveCompanies(state: typeof initialState, companies: BackendCompany[]) {
  // Prepare a list of all (unique) contacts referenced by
  // the given list of companies, in the MST snapshot format
  // (i.e. all entity references are replaced by their IDs).
  const contacts = companies.reduce(
    (map, company: BackendCompany) => {
      if (company.employees) {
        return company.employees.reduce((map, contact: BackendContact) => {
          map.set(contact.id, contactToRedux(contact));
          return map;
        }, map);
      }
      return map;
    },
    new Map<BackendContact['id'], Contact>()
  );
  const contactsUpdate = [];
  for (const [id, changes] of contacts.entries()) {
    contactsUpdate.push({ id, changes });
  }
  contactsAdapter.updateMany(state.contacts, contactsUpdate);

  // Convert the given list of companies into the MST snapshot format
  // (i.e. all entity references are replaced by their IDs).
  const companiesSnap = companies.map(companyToRedux);
  companiesAdapter.setAll(state.companies, companiesSnap);
}

const entityStoreSlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
  },
  extraReducers: builder => {
    builder.addCase(initContacts.fulfilled, (state, action) => {
      receiveContacts(state, action.payload);
    });
    builder.addCase(initStatuses.fulfilled, (state, action) => {
      state.statuses = action.payload;
    });
    builder.addCase(saveContact.pending, (state, action) => {
      contactsAdapter.upsertOne(state.contacts, contactToRedux(action.meta.arg));
    });
    builder.addCase(saveContact.fulfilled, (state, action) => {
      receiveContacts(state, action.payload);
    });
    builder.addCase(deleteContact.pending, (state, action) => {
      contactsAdapter.removeOne(state.contacts, action.meta.arg.id);
    });
    builder.addCase(deleteContact.fulfilled, (state, action) => {
      receiveContacts(state, action.payload);
    });
    builder.addCase(initCompanies.fulfilled, (state, action) => {
      receiveCompanies(state, action.payload);
    });
    builder.addCase(initStates.fulfilled, (state, action) => {
      state.states = action.payload;
    });
    builder.addCase(saveCompany.pending, (state, action) => {
      companiesAdapter.upsertOne(state.companies, action.meta.arg);
    });
    builder.addCase(saveCompany.fulfilled, (state, action) => {
      receiveCompanies(state, action.payload);
    });
    builder.addCase(deleteCompany.pending, (state, action) => {
      companiesAdapter.removeOne(state.companies, action.meta.arg.id);
    });
    builder.addCase(deleteCompany.fulfilled, (state, action) => {
      receiveCompanies(state, action.payload);
    });
  }
});

export const entitiesReducer = entityStoreSlice.reducer;
export const { selectAll: selectAllContacts } = contactsAdapter.getSelectors();
export const { selectAll: selectAllCompanies } = companiesAdapter.getSelectors();