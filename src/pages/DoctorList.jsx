import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import DoctorCard from "../components/DoctorCard";

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const snapshot = await getDocs(collection(db, "doctors"));
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDoctors(docs);
    };
    fetchDoctors();
  }, []);

  return (
    <div className="container my-5">
      <h3 className="mb-4">Available Doctors</h3>
      {doctors.length === 0 ? (
        <p>No doctors available yet.</p>
      ) : (
        <div className="row g-4">
          {doctors.map((doc) => (
            <div key={doc.id} className="col-md-6 col-lg-4">
              <DoctorCard doctor={doc} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
