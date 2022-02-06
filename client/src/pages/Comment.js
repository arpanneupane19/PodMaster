import React, { useState, useEffect } from "react";
import { Redirect, useParams, Link } from "react-router-dom";
import { LoggedInNavbar } from "../components/Navbar";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

function Comment() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [podcastTitle, setPodcastTitle] = useState("");
  const [podcastOwnerUsername, setPodcastOwnerUsername] = useState("");
  const [comment, setComment] = useState("");
  const [commented, setCommented] = useState(false);

  const { podcastId } = useParams();

  useEffect(() => {
    axios
      .get(`/api/comment/${podcastId}`, {
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
            setPodcastTitle(response.data.podcastTitle);
            setPodcastOwnerUsername(response.data.podcastOwnerUsername);
          } else {
            setNotFound(true);
          }
        }
      });
    setLoading(false);
  }, [podcastId]);

  if (!localStorage.getItem("token") || !loggedIn) {
    return <Redirect to="/login" />;
  }

  const uploadComment = (event) => {
    event.preventDefault();

    const data = {
      comment: comment.trim(),
    };

    axios
      .post(`/api/comment/${podcastId}`, data, {
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
            if (response.data.commentAdded) {
              setCommented(true);
            }
          } else {
            setNotFound(true);
          }
        }
      });
  };

  if (commented) {
    return <Redirect to={`/comments/${podcastId}`} />;
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
        <div className="flex flex-col justify-center items-center md:pt-36 pt-24 mx-6">
          <div className="form w-full md:w-2/3">
            <div className="tracking-wider mb-10">
              <h1 className="md:text-3xl text-2xl mb-2">
                Commenting on {podcastTitle}
              </h1>
              <span>
                Podcast by{" "}
                <Link
                  className="text-blue-500"
                  to={{ pathname: `/user/${podcastOwnerUsername}` }}
                >
                  @{podcastOwnerUsername}
                </Link>
              </span>
            </div>
            <form onSubmit={uploadComment}>
              <textarea
                style={{ minHeight: "5em", maxHeight: "12em" }}
                minLength={4}
                maxLength={150}
                type="text"
                placeholder="Type a comment..."
                name="podcastCommentForm"
                id="podcastCommentForm"
                onChange={(e) => setComment(e.target.value)}
                value={comment}
                className="w-full p-4 border-b-2 focus:border-gray-100 outline-none tracking-wide mb-8"
                required
              />
              <button
                type="submit"
                className="p-4 bg-red-500 text-white rounded-xl"
              >
                Upload Comment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Comment;
