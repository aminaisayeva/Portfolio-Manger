import React from 'react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <ul>
        <li className="active">Dashboard</li>
        <li>Charts</li>
        <li>Statics</li>
        <li>Products</li>
        <li>Articles</li>
        <li>Reports</li>
      </ul>
      <div className="user-profile">
        <img src="https://via.placeholder.com/40" alt="Avatar" />
        <span>Jonathan Doe</span>
      </div>
    </aside>
  );
}
