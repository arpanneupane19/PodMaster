import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [accountDoesNotExist, setAccountDoesNotExist] = useState(false);

  const login = (event) => {
    event.preventDefault();

    const user = {
      username: username,
      password: password,
    };

    axios.post("/api/login", { user }).then((response) => {
      if (response.data.message === "Verification successful!") {
        localStorage.setItem("token", response.data.token);
        setLoggedIn(true);
      }
      if (response.data.message === "Invalid password.") {
        setInvalidPassword(true);
        setAccountDoesNotExist(false);
        setPassword("");
      }
      if (response.data.message === "User does not exist.") {
        setAccountDoesNotExist(true);
        setInvalidPassword(false);
        setUsername("");
        setPassword("");
      }
    });
  };

  if (loggedIn || localStorage.getItem("token")) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="font-sans antialiased bg-white">
      <Navbar />
      <div className="flex flex-col justify-center items-center md:pt-36 pt-24 mx-6">
        <div className="form w-full md:w-1/2">
          <div className="tracking-wider mb-10">
            {invalidPassword || accountDoesNotExist ? (
              <h1 className="md:text-3xl text-2xl mb-2">Log In to PodMaster</h1>
            ) : (
              <h1 className="md:text-3xl text-2xl">Log In to PodMaster</h1>
            )}

            {invalidPassword ? (
              <>
                <span>Password is incorrect.</span>
                <br></br>
              </>
            ) : (
              <></>
            )}

            {accountDoesNotExist ? (
              <span>This account does not exist.</span>
            ) : (
              <></>
            )}
          </div>
          <form onSubmit={login}>
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
            <div className="flex flex-col mb-4">
              <span className="mb-1">
                Forgot your password? Click{" "}
                <Link
                  className="underline hover:no-underline"
                  to="/forgot-password"
                >
                  here
                </Link>{" "}
                to reset it.
              </span>
              <span>
                Don't have an account?{" "}
                <Link className="underline hover:no-underline" to="/register">
                  Sign up
                </Link>{" "}
                now.
              </span>
            </div>
            <button
              type="submit"
              className="p-4 bg-red-500 text-white rounded-xl"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
