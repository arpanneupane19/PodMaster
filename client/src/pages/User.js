import React, { useState, useEffect } from "react";
import { Redirect, useParams, Link } from "react-router-dom";
import { LoggedInNavbar } from "../components/Navbar";
import axios from "axios";
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineComment,
  AiOutlineEdit,
} from "react-icons/ai";
import ClipLoader from "react-spinners/ClipLoader";

function User() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [invalidUser, setInvalidUser] = useState(false);
  const [userFollowers, setUserFollowers] = useState(null);
  const [userFollowing, setUserFollowing] = useState(null);
  const [userUsername, setUserUsername] = useState(null);
  const [userFullName, setUserFullName] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [podcasts, setPodcasts] = useState([{}]);
  const [loading, setLoading] = useState(true);

  const { username } = useParams();

  useEffect(() => {
    axios
      .get(`/api/user/${username}`, {
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
          if (response.data.userValid) {
            setUserFullName(response.data.fullName);
            setUserUsername(response.data.username);
            setUserFollowers(response.data.followers);
            setUserFollowing(response.data.following);
            setPodcasts(response.data.podcasts);
            setImgUrl(`/api/profile-picture/${response.data.username}`);
          } else {
            setInvalidUser(true);
          }
        }
      });
    setLoading(false);
  }, [username]);

  if (!localStorage.getItem("token") || !loggedIn) {
    return <Redirect to="/login" />;
  }

  if (invalidUser) {
    return <Redirect to="/user-does-not-exist" />;
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
        <div className="flex flex-col md:pt-28 pt-24 mx-8">
          <div className="flex flex-col">
            {/* User Profile Banner */}
            <div className="user-banner m-auto drop-shadow-xl p-4 rounded-xl bg-red-500 md:w-2/3 w-full mb-6">
              <div className="flex items-center justify-between text-white">
                <div className="mr-3">
                  <img
                    src={imgUrl}
                    alt="Profile"
                    className="rounded-full"
                    width="75"
                  />
                </div>
                <div className="text-center">
                  <p className="md:text-xl text-lg font-light">
                    {userFullName}
                  </p>
                  <span>@{userUsername}</span>
                </div>
                <div className="text-center">
                  <p className="font-light">{userFollowers} followers</p>
                  <p className="font-light">{userFollowing} following</p>
                </div>
              </div>
            </div>
            {/* User Podcasts */}
            <div>
              {podcasts.length > 0 ? (
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
                          <AiOutlineComment className="text-2xl cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>{userFullName} has no podcasts at the moment.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default User;
