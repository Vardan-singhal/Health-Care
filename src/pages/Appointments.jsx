import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAppointments, cancelAppointment } from '../features/appointmentsSlice'
import AppointmentCard from '../components/AppointmentCard'


export default function Appointments(){
const dispatch = useDispatch()
const { user } = useSelector(s => s.auth)
const { list } = useSelector(s => s.appointments)


useEffect(()=>{ if(user) dispatch(fetchAppointments(user.uid)) }, [dispatch, user])


const onCancel = (id) => dispatch(cancelAppointment(id))


return (
<div className="container" style={{marginTop: '90px'}}>
<h3>Your Appointments</h3>
{list.length === 0 && <div className="alert alert-info">No appointments found.</div>}
{list.map(a => <AppointmentCard key={a.id} appt={a} onCancel={onCancel} />)}
</div>
)
}