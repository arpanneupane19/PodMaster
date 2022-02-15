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
  const [currentUserUsername, setCurrentUserUsername] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [podcasts, setPodcasts] = useState([{}]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);

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
            setCurrentUserUsername(response.data.currentUserUsername);
            if (response.data.currentUserFollowingUser) {
              setFollowing(true);
            } else {
              setFollowing(false);
            }
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

  const followAndUnfollow = (action) => {
    axios
      .post(
        `/api/${action}/user`,
        {
          userUsername,
        },
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
          if (response.data.userValid) {
            if (response.data.following) {
              setFollowing(true);
              setUserFollowers(userFollowers + 1);
            } else {
              setFollowing(false);
              setUserFollowers(userFollowers - 1);
            }
            if (response.data.error === "You cannot follow yourself.") {
              setForbidden(true);
            } else if (
              response.data.error === "Invalid action." ||
              response.data.error === "Cannot do that."
            ) {
              setNotFound(true);
            }
          } else {
            setNotFound(true);
          }
        }
      });
  };

  const likeAndUnlikePodcast = (action, podcastId) => {
    axios
      .post(
        `/api/${action}/podcast`,
        {
          podcastId,
        },
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
          if (response.data.podcastValid) {
            if (response.data.liked) {
              setPodcasts(
                podcasts.map((podcast) =>
                  podcast.podcast_id === podcastId
                    ? {
                        ...podcast,
                        likes: podcast.likes + 1,
                        currentUserLikedPodcast: true,
                      }
                    : podcast
                )
              );
            } else {
              setPodcasts(
                podcasts.map((podcast) =>
                  podcast.podcast_id === podcastId
                    ? {
                        ...podcast,
                        likes: podcast.likes - 1,
                        currentUserLikedPodcast: false,
                      }
                    : podcast
                )
              );
            }
            if (
              response.data.error === "Invalid action." ||
              response.data.error === "Cannot do that."
            ) {
              setNotFound(true);
            }
          } else {
            setNotFound(true);
          }
        }
      });
  };

  if (notFound) {
    return <Redirect to="/user-does-not-exist" />;
  }

  if (forbidden) {
    return <Redirect to="/403-forbidden" />;
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
                <div className="text-center flex flex-col">
                  <p className="md:text-xl text-lg font-light">
                    {userFullName}
                  </p>
                  <span className="mb-2">@{userUsername}</span>
                  {currentUserUsername === userUsername ? (
                    <></>
                  ) : following ? (
                    <div
                      onClick={() => followAndUnfollow("unfollow")}
                      className="cursor-pointer text-red-500 bg-white border-2 border-red-500 p-1 rounded-xl"
                    >
                      Unfollow
                    </div>
                  ) : (
                    <div
                      onClick={() => followAndUnfollow("follow")}
                      className="cursor-pointer text-white border-2 border-white p-1 rounded-xl"
                    >
                      Follow
                    </div>
                  )}
                </div>
                <div className="text-center">
                  {userFollowers === 1 ? (
                    <p className="font-light text-right">
                      {userFollowers} follower
                    </p>
                  ) : (
                    <p className="font-light text-right">
                      {userFollowers} followers
                    </p>
                  )}
                  <p className="font-light text-right">
                    {userFollowing} following
                  </p>
                </div>
              </div>
            </div>
            {/* User Podcasts */}
            <div>
              <div className="md:flex md:justify-center">
                {podcasts.length > 0 ? (
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
                          {podcast.currentUserLikedPodcast ? (
                            <AiFillHeart
                              onClick={() =>
                                likeAndUnlikePodcast(
                                  "unlike",
                                  podcast.podcast_id
                                )
                              }
                              className="text-2xl cursor-pointer"
                            />
                          ) : (
                            <AiOutlineHeart
                              onClick={() =>
                                likeAndUnlikePodcast("like", podcast.podcast_id)
                              }
                              className="text-2xl cursor-pointer"
                            />
                          )}
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
                  <div className="text-center">
                    {currentUserUsername === userUsername ? (
                      <p className="text-center">
                        You don't have any podcasts at the moment.
                      </p>
                    ) : (
                      <p className="text-center">
                        {userFullName} doesn't have any podcasts at the moment.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default User;
