import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useDispatch, useSelector } from 'react-redux'
import { createAppointment } from '../features/appointmentsSlice'


export default function DoctorDetails(){
const { id } = useParams()
const [docData, setDocData] = useState(null)
const [time, setTime] = useState('')
const nav = useNavigate()
const dispatch = useDispatch()
const { user } = useSelector(s => s.auth)


useEffect(()=>{
async function load(){
const ref = doc(db, 'doctors', id)
const snap = await getDoc(ref)
if (snap.exists()) setDocData({ id: snap.id, ...snap.data() })
}
load()
}, [id])


const book = async () => {
if (!user) return nav('/login')
await dispatch(createAppointment({ userId: user.uid, doctorId: id, doctorName: docData.name, time }))
nav('/appointments')
}


if (!docData) return <div className="container mt-5">Loading...</div>


return (
<div className="container" style={{marginTop: '90px'}}>
<h3>{docData.name}</h3>
<div className="mb-2">{docData.Speciality} • {docData.hospital}</div>
<div className="mb-3 small text-muted">{docData.city}</div>
<hr />
<h5>Book an appointment</h5>
<div className="mb-3"><input type="datetime-local" className="form-control" value={time} onChange={e=>setTime(e.target.value)} /></div>
<button className="btn btn-primary" onClick={book}>Book</button>
</div>
)
}