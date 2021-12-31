import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import { LoggedInNavbar } from "../components/Navbar";

function ProfilePicture() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicResponse, setProfilePicResponse] = useState(null);

  useEffect(() => {
    axios
      .get("/api/update-profile-picture", {
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

  const updateProfilePicture = (event) => {
    event.preventDefault();
    setProfilePicResponse(null);
    const data = new FormData();
    data.append("file", profilePicture);
    axios
      .post("/api/update-profile-picture", data, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((response) => {
        if (response.data.message !== "Verification successful.") {
          setLoggedIn(false);
        }

        if (response.data.statusResponse !== "Image uploaded successfully!") {
          setProfilePicResponse("An error occurred. Please try again later.");
        } else {
          setProfilePicResponse(
            "Your profile picture has been uploaded successfully!"
          );
        }
      });
  };

  return (
    <div className="font-sans antialiased bg-white">
      <LoggedInNavbar />
      <div className="flex flex-col justify-center items-center md:pt-36 pt-24 mx-6">
        <div className="form md:w-3/4 w-full">
          <div className="tracking-wider mb-8">
            <h1 className="text-2xl tracking-widest mb-2">
              Update Profile Picture
            </h1>
            <p>{profilePicResponse}</p>
            {profilePicResponse ===
            "Your profile picture has been uploaded successfully!" ? (
              <a href="/account" className="text-blue-500">
                Back to my account
              </a>
            ) : (
              <></>
            )}
          </div>
          <form onSubmit={updateProfilePicture} encType="mutlipart/form-data">
            <div className="w-full flex justify-center items-center">
              <input
                type="file"
                placeholder="Profile Picture"
                id="file"
                name="file"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                className="w-full p-4 border border-gray-100 bg-gray-100 rounded-xl focus:border-gray-100 focus:outline-none focus:bg-white tracking-wide mb-4"
                accept="image/*"
                required
              />
            </div>
            <button
              type="submit"
              className="p-4 bg-red-500 text-white rounded-xl"
            >
              Update Profile Picture
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePicture;
