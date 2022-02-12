import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { LoggedInNavbar } from "../components/Navbar";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

function UploadPodcast() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [podcastTitle, setPodcastTitle] = useState("");
  const [podcastDescription, setPodcastDescription] = useState("");
  const [podcastFile, setPodcastFile] = useState(null);
  const [podcastUploaded, setPodcastUploaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/upload-podcast", {
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

  const uploadPodcast = (event) => {
    event.preventDefault();

    const data = new FormData();
    data.append("podcastFile", podcastFile);
    data.append("podcastTitle", podcastTitle);
    data.append("podcastDescription", podcastDescription);

    axios
      .post("/api/upload-podcast", data, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((response) => {
        if (response.data.message !== "Verification successful.") {
          setLoggedIn(false);
          localStorage.removeItem("token");
        }

        if (response.data.message === "Verification successful.") {
          if (response.data.podcastUploaded) {
            setPodcastUploaded(true);
          }
        }
      });
  };

  if (podcastUploaded) {
    return <Redirect to="/dashboard" />;
  }

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
          <div className="form w-full md:w-2/3">
            <div className="tracking-wider mb-10">
              <h1 className="md:text-3xl text-2xl mb-2">Upload Podcast</h1>
            </div>
            <form onSubmit={uploadPodcast} encType="multipart/form-data">
              <input
                type="text"
                min="4"
                max="50"
                placeholder="Podcast Title"
                name="podcastTitle"
                id="podcastTitle"
                onChange={(e) => setPodcastTitle(e.target.value)}
                value={podcastTitle}
                className="w-full p-4 border-b-2 focus:border-gray-100 outline-none tracking-wide mb-8"
                required
              />
              <textarea
                style={{ minHeight: "5em", maxHeight: "12em" }}
                minLength={4}
                maxLength={500}
                type="text"
                placeholder="Podcast Description"
                name="podcastDescription"
                id="podcastDescription"
                onChange={(e) => setPodcastDescription(e.target.value)}
                value={podcastDescription}
                className="w-full p-4 border-b-2 focus:border-gray-100 outline-none tracking-wide mb-8"
                required
              />
              <span>Podcast Audio File</span>
              <input
                type="file"
                placeholder="Podcast Audio File"
                id="podcastAudioFile"
                name="podcastAudioFile"
                onChange={(e) => setPodcastFile(e.target.files[0])}
                className="w-full p-4 border border-gray-100 bg-gray-100 rounded-xl focus:border-gray-100 focus:outline-none focus:bg-white tracking-wide mb-8"
                accept=".mp3"
                required
              />
              <button
                type="submit"
                className="p-4 bg-red-500 text-white rounded-xl"
              >
                Upload Podcast
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default UploadPodcast;
