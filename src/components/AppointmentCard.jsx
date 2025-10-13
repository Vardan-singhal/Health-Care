import React from 'react'


export default function AppointmentCard({ appt, onCancel }){
return (
<div className="card mb-2">
<div className="card-body d-flex justify-content-between align-items-center">
<div>
<div className="fw-bold">{appt.doctorName || appt.doctorId}</div>
<div className="text-muted small">{new Date(appt.time).toLocaleString()}</div>
</div>
<div>
<button className="btn btn-danger btn-sm" onClick={() => onCancel(appt.id)}>Cancel</button>
</div>
</div>
</div>
)
}