import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getUsers } from '../api';

const initialState = {
  status: 'idle',
  error: null,
  list: [],
};

export const getContacts = createAsyncThunk(
  '@@contacts/get',
  async (_, err) => {
    try {
      const data = JSON.parse(localStorage.getItem('contacts'));
      if (data) return data;

      const defaultValues = await getUsers();
      const newValues = defaultValues.map(item => ({
        ...item,
        isLiked: false,
      }));

      localStorage.setItem('contacts', JSON.stringify(newValues));

      return JSON.parse(localStorage.getItem('contacts'));
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return err.rejectWithValue(message);
    }
  }
);

const contactsSlice = createSlice({
  name: '@@contacts',
  initialState,
  reducers: {
    likeContact: (state, action) => {
      state.list[action.payload.id - 1] = action.payload;

      localStorage.setItem('contacts', JSON.stringify(state.list));
    },
    updateContact: (state, action) => {
      const isLiked = state.list[action.payload.id - 1].isLiked;
      const newContact = { ...action.payload, isLiked };
      state.list[action.payload.id - 1] = newContact;

      localStorage.setItem('contacts', JSON.stringify(state.list));
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getContacts.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getContacts.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.payload || action.meta.error;
      })
      .addCase(getContacts.fulfilled, (state, action) => {
        state.status = 'received';
        state.list = action.payload;
      });
  },
});

export const contactsReducer = contactsSlice.reducer;

export const { likeContact, updateContact } = contactsSlice.actions;

// Selects

export const selectContacts = state => ({
  status: state.contacts.status,
  error: state.contacts.error,
  list: state.contacts.list,
});

export const selectSearch = (state, { search = '' }) => {
  return state.contacts.list.filter(contact =>
    contact.firstName.toLowerCase().includes(search.toLowerCase())
  );
};

export const selectFilter = (list = [], value) => {
  switch (value) {
    case 'sortA-Z': {
      list.sort((a, b) => {
        const nameA = a.firstName.toLowerCase();
        const nameB = b.firstName.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      return list;
    }
    case 'sortZ-A': {
      list.sort((a, b) => {
        const nameA = a.firstName.toLowerCase();
        const nameB = b.firstName.toLowerCase();
        if (nameA < nameB) return 1;
        if (nameA > nameB) return -1;
        return 0;
      });

      return list;
    }
    case 'liked': {
      return list.filter(todo => todo.isLiked);
    }
    default: {
      return list;
    }
  }
};
