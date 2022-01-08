import React from "react";
import { Navbar } from "../components/Navbar";
import { Link, Redirect } from "react-router-dom";

function Home() {
  if (localStorage.getItem("token")) {
    return <Redirect to="/dashboard" />;
  }
  return (
    <div className="font-sans antialiased bg-white">
      <Navbar />
      <div className="flex flex-col justify-center items-center md:pt-36 pt-24">
        <div className="text-center tracking-widest mb-12">
          <h1 className="md:text-4xl text-2xl mb-2">
            The Ultimate Podcasting Platform
          </h1>
          <span className="text-gray-600">
            Promote, listen, and create podcasts!
          </span>
        </div>
        <div className="flex flex-col mb-10">
          <Link
            to="/register"
            className="p-4 bg-red-500 rounded-xl tracking-wide text-white text-center font-semibold cursor-pointer hover:bg-red-600"
          >
            GET STARTED FOR FREE
          </Link>
          <span className="mt-4 text-sm text-center">
            Already have an account?{" "}
            <Link to="/login" className="underline hover:no-underline">
              Log in
            </Link>
            .
          </span>
        </div>
      </div>
    </div>
  );
}

export default Home;
