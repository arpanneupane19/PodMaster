import React from "react";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import UploadPodcast from "./pages/UploadPodcast";
import EditPodcast from "./pages/EditPodcast";
import Comment from "./pages/Comment";
import Comments from "./pages/Comments";
import Listen from "./pages/Listen";
import User from "./pages/User";
import Account from "./pages/Account";
import ChangePassword from "./pages/ChangePassword";
import ProfilePicture from "./pages/ProfilePicture";
import Forbidden from "./pages/403";
import NotFound from "./pages/404";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path={["/", "/home"]}>
          <Home />
        </Route>

        <Route exact path={["/register", "/sign-up"]}>
          <Register />
        </Route>

        <Route exact path={["/login", "/log-in"]}>
          <Login />
        </Route>

        <Route exact path="/logout">
          <Logout />
        </Route>

        <Route exact path="/forgot-password">
          <ForgotPassword />
        </Route>

        <Route exact path="/reset-password/:token">
          <ResetPassword />
        </Route>

        <Route exact path="/dashboard">
          <Dashboard />
        </Route>

        <Route exact path="/upload-podcast">
          <UploadPodcast />
        </Route>

        <Route exact path="/edit-podcast/:podcastId">
          <EditPodcast />
        </Route>

        <Route exact path="/comment/:podcastId">
          <Comment />
        </Route>

        <Route exact path="/comments/:podcastId">
          <Comments />
        </Route>

        <Route exact path="/listen">
          <Listen />
        </Route>

        <Route exact path="/user/:username">
          <User />
        </Route>

        <Route exact path="/account">
          <Account />
        </Route>

        <Route exact path="/change-password">
          <ChangePassword />
        </Route>

        <Route exact path="/update-profile-picture">
          <ProfilePicture />
        </Route>

        <Route exact path="/403-forbidden">
          <Forbidden />
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

export default App;
