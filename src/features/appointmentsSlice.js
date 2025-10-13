import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export const fetchAppointments = createAsyncThunk(
  "appointments/fetch",
  async (userId) => {
    const cols = collection(db, "appointments");
    const q = query(cols, where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
);

export const createAppointment = createAsyncThunk(
  "appointments/create",
  async (payload) => {
    const cols = collection(db, "appointments");
    const ref = await addDoc(cols, payload);
    return { id: ref.id, ...payload };
  }
);

export const cancelAppointment = createAsyncThunk(
  "appointments/cancel",
  async (id) => {
    await deleteDoc(doc(db, "appointments", id));
    return id;
  }
);

const slice = createSlice({
  name: "appointments",
  initialState: { list: [], status: "idle" },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAppointments.fulfilled, (s, a) => {
      s.list = a.payload;
    });
    b.addCase(createAppointment.fulfilled, (s, a) => {
      s.list.push(a.payload);
    });
    b.addCase(cancelAppointment.fulfilled, (s, a) => {
      s.list = s.list.filter((x) => x.id !== a.payload);
    });
  },
});

export default slice.reducer;
