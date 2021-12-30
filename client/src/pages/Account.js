import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import { LoggedInNavbar } from "../components/Navbar";
import axios from "axios";

function Dashboard() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [accountUpdated, setAccountUpdated] = useState(false);

  useEffect(() => {
    axios
      .get("/api/account", {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((response) => {
        if (response.data.message !== "Verification successful.") {
          setLoggedIn(false);
          localStorage.removeItem("token");
        } else {
          if (
            response.data.userData.firstName &&
            response.data.userData.lastName &&
            response.data.userData.username &&
            response.data.userData.email
          ) {
            setFirstName(response.data.userData.firstName);
            setLastName(response.data.userData.lastName);
            setUsername(response.data.userData.username);
            setEmail(response.data.userData.email);
            setImgUrl(
              `/api/profile-picture/${response.data.userData.username}`
            );
          }
        }
      });
  }, []);

  const updateAccount = (event) => {
    event.preventDefault();

    setAccountUpdated(false);
    setAlreadyExists(false);

    const data = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
    };

    axios
      .post(
        "/api/account",
        { data },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((response) => {
        if (response.data.message !== "Verification successful.") {
          setLoggedIn(false);
        }

        if (response.data.accountUpdated) {
          setAccountUpdated(true);
        }

        if (!response.data.accountUpdated) {
          if (
            response.data.error === "Username or email belongs to another user."
          ) {
            setAlreadyExists(true);
          }
        }
      });
  };

  if (!localStorage.getItem("token") || !loggedIn) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="font-sans antialiased bg-white">
      <LoggedInNavbar />
      <div className="flex flex-col justify-center items-center md:pt-36 pt-24 mx-6">
        <div className="form md:w-3/4 w-full">
          <div className="tracking-wider mb-6">
            <h1 className="text-2xl tracking-widest mb-2">My Account</h1>
            <img
              src={imgUrl}
              alt="Profile"
              className="rounded-full mt-4 mb-4"
              width="100"
            />
            {alreadyExists ? (
              <>
                <span>
                  Username or email already exists. Please choose a different
                  one.
                </span>
              </>
            ) : (
              <></>
            )}

            {accountUpdated ? (
              <>
                <span>Your account has successfully been updated!</span>
              </>
            ) : (
              <></>
            )}
          </div>
          <form onSubmit={updateAccount}>
            <div className="w-full flex justify-center items-center">
              <input
                type="text"
                min="4"
                max="20"
                placeholder="First Name"
                name="username"
                id="username"
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
                className="w-1/2 mr-1 p-4 border-b-2 focus:border-gray-100 outline-none tracking-wide mb-4"
                required
              />
              <input
                type="text"
                min="4"
                max="30"
                placeholder="Last Name"
                name="username"
                id="username"
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
                className="w-1/2 ml-1 p-4 border-b-2 focus:border-gray-100 outline-none tracking-wide mb-4"
                required
              />
            </div>
            <input
              type="text"
              min="4"
              max="20"
              placeholder="Username"
              name="username"
              id="username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              className="w-full p-4 border-b-2 focus:border-gray-100 outline-none tracking-wide mb-4"
              required
            />
            <input
              type="email"
              min="7"
              max="320"
              placeholder="Email"
              name="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="w-full p-4 border-b-2 focus:border-gray-100 outline-none tracking-wide mb-8"
              required
            />
            <div className="flex flex-col items-start mb-4">
              <span>
                Want to update your profile picture? Click{" "}
                <Link
                  to="/update-profile-picture"
                  className="underline hover:no-underline"
                >
                  here
                </Link>
                .
              </span>
              <span>
                Want to change your password? Click{" "}
                <Link
                  className="underline hover:no-underline"
                  to="/change-password"
                >
                  here
                </Link>
                .
              </span>
            </div>
            <button
              type="submit"
              className="p-4 bg-red-500 text-white rounded-xl"
            >
              Update Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
