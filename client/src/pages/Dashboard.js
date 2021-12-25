import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { LoggedInNavbar } from "../components/Navbar";
import axios from "axios";

function Dashboard() {
  const [isLoggedIn, setLoggedIn] = useState(true);
  useEffect(() => {
    axios
      .get("/api/dashboard", {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((response) => {
        if (response.data.message !== "Verification successful.") {
          setLoggedIn(false);
          localStorage.removeItem("token");
        }
      });
  }, []);

  if (!localStorage.getItem("token") || !isLoggedIn) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="font-sans antialiased bg-white">
      <LoggedInNavbar />
      <h1>Dashboard</h1>
    </div>
  );
}

export default Dashboard;
