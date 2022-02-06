import React, { useState, useEffect } from "react";
import { Redirect, Link } from "react-router-dom";
import { LoggedInNavbar } from "../components/Navbar";
import axios from "axios";
import { AiOutlineHeart, AiFillHeart, AiOutlineComment } from "react-icons/ai";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import ClipLoader from "react-spinners/ClipLoader";

function Dashboard() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [podcasts, setPodcasts] = useState([{}]);
  const [currentUserUsername, setCurrentUserUsername] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [deleted, setDeleted] = useState(false);

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

        if (response.data.message === "Verification successful.") {
          setPodcasts(response.data.podcasts);
          setCurrentUserUsername(response.data.currentUserUsername);
        }
      });
    setLoading(false);
  }, [deleted]);

  if (!localStorage.getItem("token") || !loggedIn) {
    return <Redirect to="/login" />;
  }

  const deletePodcast = (id) => {
    axios
      .post(
        `/api/delete-podcast/${id}`,
        { id },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((response) => {
        if (response.data.message !== "Verification successful.") {
          setLoggedIn(false);
          localStorage.removeItem("token");
        }
        if (response.data.message === "Verification successful.") {
          if (response.data.podcastExists) {
            if (response.data.podcastOwnerValid) {
              if (response.data.podcastDeleted) {
                setDeleted(true);
              }
            } else {
              setForbidden(true);
            }
          }
        } else {
          setNotFound(true);
        }
      });
  };

  if (forbidden) {
    return <Redirect to="/403-forbidden" />;
  }
  if (notFound) {
    return <Redirect to="/podcast-not-found" />;
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
        <div className="flex flex-col md:pt-36 pt-24 mx-8">
          <div className="flex flex-col">
            <div className="mb-8 flex flex-col">
              <h1 className="text-2xl mb-2 tracking-widest">My Podcasts</h1>
              <span className="tracking-wider">
                View my{" "}
                <Link
                  className="underline underline-offset-1 text-blue-500"
                  to={{ pathname: `/user/${currentUserUsername}` }}
                >
                  profile
                </Link>
              </span>
            </div>
            <div className="md:flex md:justify-center">
              {typeof podcasts !== "undefined" ? (
                podcasts.length > 0 ? (
                  podcasts.map((podcast, index) => (
                    <div
                      key={index}
                      className="podcast md:w-1/2 md:my-4 md:ml-1 md:mr-1 w-full my-2 p-6 shadow-xl rounded-xl bg-red-500 text-white"
                    >
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <h3 className="flex font-bold text-xl mb-2">
                            {podcast.podcast_title}
                          </h3>
                          <div className="flex flex-row">
                            <Link
                              to={{
                                pathname: `/edit-podcast/${podcast.podcast_id}`,
                              }}
                            >
                              <FiEdit3 className="text-xl cursor-pointer mr-2" />
                            </Link>
                            <FiTrash2
                              onClick={() => deletePodcast(podcast.podcast_id)}
                              className="text-xl cursor-pointer ml-2"
                            />
                          </div>
                        </div>
                        <div className="h-24 overflow-auto mb-2">
                          {podcast.podcast_description}
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          {podcast.likes === 1 ? (
                            <span>{podcast.likes} like</span>
                          ) : (
                            <span>{podcast.likes} likes</span>
                          )}
                          {podcast.comments === 1 ? (
                            <Link
                              to={{
                                pathname: `/comments/${podcast.podcast_id}`,
                              }}
                            >
                              {podcast.comments} comment
                            </Link>
                          ) : (
                            <Link
                              to={{
                                pathname: `/comments/${podcast.podcast_id}`,
                              }}
                            >
                              {podcast.comments} comments
                            </Link>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <AiOutlineHeart className="text-2xl cursor-pointer" />
                          <Link
                            to={{ pathname: `/comment/${podcast.podcast_id}` }}
                          >
                            <AiOutlineComment className="text-2xl cursor-pointer" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>You have no podcasts at the moment.</p>
                )
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
