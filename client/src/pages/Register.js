import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const register = (event) => {
    event.preventDefault();

    const user = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      password: password,
    };

    axios.post("/api/register", { user }).then((response) => {
      if (response.data.message === "User has been created!") {
        setAccountCreated(true);
      }

      if (response.data.message === "Username or email already exists.") {
        setAlreadyExists(true);
        setFirstName("");
        setLastName("");
        setUsername("");
        setEmail("");
        setPassword("");
      }
    });
  };

  if (accountCreated) {
    return <Redirect to="/login" />;
  }

  if (localStorage.getItem("token")) {
    return <Redirect to="/dashboard" />;
  }
  return (
    <div className="font-sans antialiased bg-white">
      <Navbar />
      <div className="flex flex-col justify-center items-center md:pt-36 pt-24 mx-6">
        <div className="form w-full md:w-1/2">
          <div className="tracking-wider mb-10">
            {alreadyExists ? (
              <>
                <h1 className="md:text-3xl text-2xl mb-2">Register for Free</h1>
                <span>Username or email already exists.</span>
              </>
            ) : (
              <h1 className="md:text-3xl text-2xl">Register for Free</h1>
            )}
          </div>
          <form onSubmit={register}>
            <div className="w-full flex justify-center items-center">
              <input
                type="text"
                min="4"
                max="20"
                placeholder="First Name"
                name="first-name"
                id="first-name"
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
                name="last-name"
                id="last-name"
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
              className="w-full p-4 border-b-2 focus:border-gray-100 outline-none tracking-wide mb-4"
              required
            />
            <input
              type="password"
              min="8"
              placeholder="Password"
              name="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full p-4 border-b-2 focus:border-gray-100 outline-none tracking-wide mb-4"
              required
            />
            <div className="flex flex-col items-start mb-4">
              <span>
                Already have an account?{" "}
                <Link className="underline hover:no-underline" to="/login">
                  Log in
                </Link>
                .
              </span>
            </div>
            <button
              type="submit"
              className="p-4 bg-red-500 text-white rounded-xl"
            >
              Create New Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
