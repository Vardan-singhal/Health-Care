import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'


export default function PrivateRoute({ children, role }){
const { user } = useSelector(s => s.auth)
if (!user) return <Navigate to="/login" replace />
if (role && user.role !== role) return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} replace />
return children
}