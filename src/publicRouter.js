import * as React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const useAuth = () => {
  const checkLogin = localStorage.getItem('admiCN')
  if (checkLogin) {
    return true
  } else {
    return false
  }
}

const PublicRoute = () => {
  const checkLogin = useAuth()
  return checkLogin ? <Navigate to="/" /> : <Outlet />
}
export default PublicRoute
