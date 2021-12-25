import React from "react";
import { Redirect } from "react-router-dom";
function Logout() {
  localStorage.removeItem("token");
  return <Redirect to="/login" />;
}

export default Logout;
