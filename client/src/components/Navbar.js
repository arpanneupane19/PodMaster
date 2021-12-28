import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";

export function Navbar() {
  return (
    <div className="flex flex-col z-[100] fixed w-full">
      <nav className="navbar bg-white flex flex-row justify-between items-center py-4 px-6 font-sans antialiased tracking-wider">
        <div className="branding md:text-2xl text-xl">
          <Link to="/" className="flex">
            <p>PodMaster</p>
          </Link>
        </div>
        <ul className="flex flex-center md:inline hidden md:text-lg text-base">
          <Link to="/login" className="mx-3 p-2">
            Login
          </Link>
          <Link
            to="/register"
            className="mx-3 bg-red-500 p-2 rounded-xl text-white hover:bg-red-600"
          >
            Register
          </Link>
        </ul>
      </nav>
    </div>
  );
}

export function LoggedInNavbar() {
  const [loggedOut, setLoggedOut] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedOut(true);
  };

  if (loggedOut) {
    return <Redirect to="/login" />;
  }
  return (
    <div className="flex flex-col z-[100] fixed w-full">
      <nav className="navbar bg-white flex flex-row justify-between items-center py-4 px-6 font-sans antialiased tracking-wider">
        <div className="branding md:text-2xl text-xl">
          <Link to="/dashboard" className="flex">
            <p>PodMaster</p>
          </Link>
        </div>
        <ul className="flex flex-center md:inline hidden md:text-lg text-base">
          <Link to="/dashboard" className="mx-3 p-2">
            Dashboard
          </Link>
          <Link to="/listen" className="mx-3 p-2">
            Listen
          </Link>
          <Link to="/upload-podcast" className="mx-3 p-2">
            Upload Podcast
          </Link>
          <Link to="/account" className="mx-3 p-2">
            Account
          </Link>
          <button
            className="mx-3 bg-red-500 p-2 rounded-xl text-white hover:bg-red-600"
            onClick={() => logout()}
          >
            Logout
          </button>
        </ul>
      </nav>
    </div>
  );
}
