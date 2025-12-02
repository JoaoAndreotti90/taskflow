import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar/Sidebar'
import './DefaultLayout.css'

export function DefaultLayout() {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-content">
        <Outlet /> 
      </div>
    </div>
  )
}