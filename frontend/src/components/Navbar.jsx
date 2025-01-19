import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-gray-100 py-4 px-8 flex justify-between items-center shadow-lg">
      <div className="text-2xl font-bold">To-Do List App</div>

      <div className="flex gap-6">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `text-lg font-semibold ${
              isActive ? "text-indigo-400 underline" : "text-gray-300"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/tasklist"
          className={({ isActive }) =>
            `text-lg font-semibold ${
              isActive ? "text-indigo-400 underline" : "text-gray-300"
            }`
          }
        >
          Task List
        </NavLink>
      </div>

      <button
        onClick={handleLogout}
        className="text-gray-300 hover:text-red-500 font-semibold transition"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
