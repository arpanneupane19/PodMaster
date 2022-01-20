import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { LoggedInNavbar } from "../components/Navbar";
import axios from "axios";
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineComment,
  AiOutlineEdit,
} from "react-icons/ai";

function Dashboard() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [podcasts, setPodcasts] = useState([{}]);

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
        }
      });
  }, []);

  if (!localStorage.getItem("token") || !loggedIn) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="font-sans antialiased bg-white">
      <LoggedInNavbar />
      <div className="flex flex-col md:pt-36 pt-24 mx-8">
        <div className="flex flex-col">
          <div className="mb-8 flex flex-col">
            <h1 className="text-2xl mb-2 tracking-widest">DASHBOARD</h1>
          </div>
          <p className="text-xl mb-2 tracking-widest">My Podcasts</p>
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
                          <AiOutlineEdit className="text-2xl cursor-pointer" />
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
                          <AiOutlineComment className="text-2xl cursor-pointer" />
                        </div>
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

export default Dashboard;
