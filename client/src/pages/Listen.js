import React, { useState, useEffect } from "react";
import { Redirect, Link } from "react-router-dom";
import { LoggedInNavbar } from "../components/Navbar";
import axios from "axios";
import { AiOutlineHeart, AiFillHeart, AiOutlineComment } from "react-icons/ai";
import ClipLoader from "react-spinners/ClipLoader";

function Listen() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [podcasts, setPodcasts] = useState([{}]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/listen", {
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
        }
      });
    setLoading(false);
  }, []);

  if (!localStorage.getItem("token") || !loggedIn) {
    return <Redirect to="/login" />;
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
              <h1 className="text-2xl mb-2 tracking-widest">Listen.</h1>
            </div>
            <div>
              {typeof podcasts !== "undefined" ? (
                podcasts.length > 0 ? (
                  podcasts.map((podcast, index) => (
                    <div className="md:flex md:justify-center">
                      <div
                        key={index}
                        className="podcast md:w-1/2 md:my-4 md:ml-1 md:mr-1 w-full my-2 p-6 shadow-xl rounded-xl bg-red-500 text-white"
                      >
                        <div className="flex flex-col">
                          <div className="flex justify-between">
                            <h3 className="flex font-bold text-xl mb-2">
                              {podcast.podcast_title}
                            </h3>
                            <div>
                              Uploaded by{" "}
                              <Link
                                className="underline underline-offset-1"
                                to={{
                                  pathname: `/user/${podcast.podcast_owner_username}`,
                                }}
                              >
                                {podcast.podcast_owner_username}
                              </Link>
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
                              <span>{podcast.comments} comment</span>
                            ) : (
                              <span>{podcast.comments} comments</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <AiOutlineHeart className="text-2xl cursor-pointer" />
                            <Link
                              to={{
                                pathname: `/comment/${podcast.podcast_id}`,
                              }}
                            >
                              <AiOutlineComment className="text-2xl cursor-pointer" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No podcasts yet. Be the first to upload!</p>
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

export default Listen;
