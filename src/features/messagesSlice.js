import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

export const fetchMessages = createAsyncThunk(
  "messages/fetch",
  async ({ threadId }) => {
    const cols = collection(db, "messages");
    const q = query(
      cols,
      where("threadId", "==", threadId),
      orderBy("time", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
);

export const sendMessage = createAsyncThunk(
  "messages/send",
  async (payload) => {
    const cols = collection(db, "messages");
    const ref = await addDoc(cols, payload);
    return { id: ref.id, ...payload };
  }
);

const slice = createSlice({
  name: "messages",
  initialState: { threads: [] },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMessages.fulfilled, (s, a) => {
      s.threads = a.payload;
    });
    b.addCase(sendMessage.fulfilled, (s, a) => {
      s.threads.push(a.payload);
    });
  },
});

export default slice.reducer;
