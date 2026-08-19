import React from 'react'
import Dashboard_code from "./Dashbord-code";

function Dashboard() {
  const token = localStorage.getItem("adminToken");
  return (
    <div>

      {token ? (
        <Dashboard_code />
      ) : (
        <h1 className='text-2xl m-5'>YOU HAVE NOT PERMISSIONS</h1>
      )}



    </div>
  )
}

export default Dashboard

