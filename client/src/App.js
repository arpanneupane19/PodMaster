import React from "react";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import ChangePassword from "./pages/ChangePassword";
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

        <Route exact path="/dashboard">
          <Dashboard />
        </Route>

        <Route exact path="/account">
          <Account />
        </Route>

        <Route exact path="/change-password">
          <ChangePassword />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
