import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { LoggedInNavbar } from "../components/Navbar";
import axios from "axios";

function Dashboard() {
  const [loggedIn, setLoggedIn] = useState(true);
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

  if (!localStorage.getItem("token") || !loggedIn) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="font-sans antialiased bg-white">
      <LoggedInNavbar />
      <div className="flex flex-col md:pt-36 pt-24 mx-8">
        <div className="flex flex-col">
          <div className="mb-8 flex flex-col">
            <h1 className="text-2xl mb-2 tracking-widest">Dashboard</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
