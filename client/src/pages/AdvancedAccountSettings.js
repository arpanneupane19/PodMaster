import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import { LoggedInNavbar } from "../components/Navbar";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

function AdvancedAccountSettings() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/advanced-account-settings", {
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
    setLoading(false);
  }, []);

  if (!localStorage.getItem("token") || !loggedIn) {
    return <Redirect to="/login" />;
  }

  const deactivateAccount = () => {};

  const deleteAccount = (event) => {
    event.preventDefault();
    axios
      .post("/api/delete-account", null, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((response) => {
        if (response.data.message === "Account has been deleted.") {
          setLoggedIn(false);
          localStorage.removeItem("token");
        }
      });
  };

  if (loading) {
    return (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <ClipLoader color="#EF4444" size={100} />
      </div>
    );
  } else {
    return (
      <div className="font-sans antialiased bg-white">
        <LoggedInNavbar />
        <div className="flex flex-col justify-center items-center md:pt-36 pt-24 mx-6">
          <div className="md:w-3/4 w-full">
            <div className="tracking-wider mb-6">
              <h1 className="text-2xl tracking-widest mb-2">
                Advanced Account Settings
              </h1>
            </div>
            <div className="flex flex-col">
              <div className="deactivation bg-red-500 p-5 rounded-xl mb-5">
                <h3 className="font-semibold underline text-white">
                  Account Deactivation
                </h3>
                <p className="mb-2 text-white">
                  When you deactivate your account, your account will not be
                  displayed to other users and your podcasts will not be shown
                  on the listen page. Once you log in again, your account will
                  be reactivated.
                </p>
                <button className="bg-white p-2 text-red-500 rounded-xl ">
                  Deactivate Account
                </button>
              </div>
              <div className="deactivation bg-red-500 p-5 rounded-xl">
                <h3 className="font-semibold underline text-white">
                  Account Deletion
                </h3>
                <p className="mb-2 text-white">
                  When you delete your account, your account will be completely
                  removed from the PodMaster app and your podcasts, likes,
                  followers, and comments will also be deleted. There is no way
                  to recover your account once you click the button below, so
                  proceed with caution.
                </p>
                <button
                  className="bg-white p-2 text-red-500 rounded-xl"
                  onClick={deleteAccount}
                >
                  Delete Account
                </button>
              </div>
            </div>
            <br></br>
            <Link to="/account" className="underline tracking-wide">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default AdvancedAccountSettings;
