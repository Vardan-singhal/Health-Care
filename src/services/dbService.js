import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Get all doctors
export const getDoctors = async () => {
  const snapshot = await getDocs(collection(db, "doctors"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Add appointment
export const addAppointment = async (appointment) => {
  await addDoc(collection(db, "appointments"), appointment);
};

// Get appointments
export const getAppointments = async () => {
  const snapshot = await getDocs(collection(db, "appointments"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Delete appointment
export const deleteAppointment = async (id) => {
  await deleteDoc(doc(db, "appointments", id));
};
