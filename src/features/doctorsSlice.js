import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../firebase";

export const fetchDoctors = createAsyncThunk(
  "doctors/fetch",
  async ({ q } = {}) => {
    // simple fetch all; q optional search string
    const cols = collection(db, "doctors");
    const snap = await getDocs(cols);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (q) {
      const ql = q.toLowerCase();
      return data.filter((d) =>
        [d.name, d.Speciality, d.hospital, d.city]
          .join(" ")
          .toLowerCase()
          .includes(ql)
      );
    }
    return data;
  }
);

const slice = createSlice({
  name: "doctors",
  initialState: { list: [], status: "idle", selected: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDoctors.pending, (s) => {
      s.status = "loading";
    });
    b.addCase(fetchDoctors.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.list = a.payload;
    });
    b.addCase(fetchDoctors.rejected, (s) => {
      s.status = "failed";
    });
  },
});

export default slice.reducer;
