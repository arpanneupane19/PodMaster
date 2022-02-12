import React, { useState, useEffect } from "react";
import { Redirect, useParams, Link } from "react-router-dom";
import { LoggedInNavbar } from "../components/Navbar";
import axios from "axios";
import { FiTrash2 } from "react-icons/fi";
import ClipLoader from "react-spinners/ClipLoader";

function Comments() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [commentNotFound, setCommentNotFound] = useState(false);
  const [commentDeleted, setCommentDeleted] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [podcastTitle, setPodcastTitle] = useState("");
  const [podcastOwnerUsername, setPodcastOwnerUsername] = useState("");
  const [currentUserUsername, setCurrentUserUsername] = useState("");
  const [comments, setComments] = useState([{}]);

  const { podcastId } = useParams();

  useEffect(() => {
    axios
      .get(`/api/comments/${podcastId}`, {
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
            setCurrentUserUsername(response.data.currentUserUsername);
            setComments(response.data.comments);
          } else {
            setNotFound(true);
          }
        }
      });
    setLoading(false);
  }, [podcastId, commentDeleted]);

  const deleteComment = (id) => {
    axios
      .post(`/api/delete-comment/${id}`, id, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((response) => {
        if (response.data.commentExists) {
          if (response.data.commentOwnerValid) {
            if (response.data.commentDeleted) {
              setCommentDeleted(true);
            }
          } else {
            setForbidden(true);
          }
        } else {
          setCommentNotFound(true);
        }
      });
  };

  if (!localStorage.getItem("token") || !loggedIn) {
    return <Redirect to="/login" />;
  }

  if (notFound) {
    return <Redirect to="/podcast-not-found" />;
  }

  if (forbidden) {
    return <Redirect to="/403-forbidden" />;
  }

  if (commentNotFound) {
    return <Redirect to="/comment-not-found" />;
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
                Comments of {podcastTitle}
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
            <div>
              {typeof comments !== "undefined" ? (
                comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div
                      key={index}
                      className="comment w-full my-2 p-4 shadow-xl rounded-xl bg-red-500 text-white"
                    >
                      <div className="flex flex-col">
                        <div className="commenter-username">
                          {comment.commenter === currentUserUsername ? (
                            <div className="flex justify-between">
                              <div>
                                @
                                <Link
                                  className="underline tracking-wide"
                                  to={{
                                    pathname: `/user/${comment.commenter}`,
                                  }}
                                >
                                  {comment.commenter}
                                </Link>
                              </div>
                              <FiTrash2
                                onClick={() => deleteComment(comment.commentId)}
                                className="text-xl cursor-pointer ml-2"
                              />
                            </div>
                          ) : (
                            <>
                              @
                              <Link
                                className="underline tracking-wide"
                                to={{ pathname: `/user/${comment.commenter}` }}
                              >
                                {comment.commenter}
                              </Link>
                            </>
                          )}
                        </div>
                        <div className="comment-body">
                          <p>{comment.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No comments yet...</p>
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

export default Comments;
