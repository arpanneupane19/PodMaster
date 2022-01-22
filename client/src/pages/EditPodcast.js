import React, { useState, useEffect } from "react";
import { Redirect, useParams } from "react-router-dom";
import { LoggedInNavbar } from "../components/Navbar";
import axios from "axios";

function EditPodcast() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [podcastTitle, setPodcastTitle] = useState("");
  const [podcastDescription, setPodcastDescription] = useState("");
  const [podcastUpdated, setPodcastUpdated] = useState(false);

  const { podcastId } = useParams();

  useEffect(() => {
    axios
      .get(`/api/edit-podcast/${podcastId}`, {
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
          if (response.data.podcastExists) {
            if (response.data.podcastOwnerValid) {
              setPodcastTitle(response.data.podcastTitle);
              setPodcastDescription(response.data.podcastDescription);
            } else {
              setForbidden(true);
            }
          } else {
            setNotFound(true);
          }
        }
      });
  }, [podcastId]);

  if (!localStorage.getItem("token") || !loggedIn) {
    return <Redirect to="/login" />;
  }

  if (notFound) {
    return <Redirect to="/podcast-not-found" />;
  }
  if (forbidden) {
    return <Redirect to="/403-forbidden" />;
  }

  const updatePodcast = (event) => {
    event.preventDefault();

    const data = {
      podcastTitle: podcastTitle,
      podcastDescription: podcastDescription,
    };

    axios
      .post(`/api/edit-podcast/${podcastId}`, data, {
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
          if (response.data.podcastExists) {
            if (response.data.podcastOwnerValid) {
              if (response.data.podcastUpdated) {
                setPodcastUpdated(true);
              }
            } else {
              setForbidden(true);
            }
          } else {
            setNotFound(true);
          }
        }
      });
  };

  if (podcastUpdated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="font-sans antialiased bg-white">
      <LoggedInNavbar />
      <div className="flex flex-col justify-center items-center md:pt-36 pt-24 mx-6">
        <div className="form w-full md:w-2/3">
          <div className="tracking-wider mb-10">
            <h1 className="md:text-3xl text-2xl mb-2">Edit Podcast</h1>
          </div>
          <form onSubmit={updatePodcast}>
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
            <button
              type="submit"
              className="p-4 bg-red-500 text-white rounded-xl"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPodcast;
