import React from "react";

const AdminDashboardPage = () => {
  return (
    <div className="container">
      <h2 className="admin-title">Admin Dashboard</h2>

      <div className="card">
        <p>Welcome Admin </p>
        <p>Manage your events here</p>
      </div>

      <button className="btn">Create Event</button>
    </div>
  );
};

export default AdminDashboardPage;
