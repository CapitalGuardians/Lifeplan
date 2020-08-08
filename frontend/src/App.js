import React, { useEffect } from "react";
import { Switch, Route } from "react-router-dom";
import Home from "./home/Home";
import BudgetEdit from "./budget/edit/BudgetEdit.js";
import "./App.css";
import NavBar from "./common/NavBar";
import BudgetDashboard from "./budget/dashboard/BudgetDashboard";
import SignIn from "./authentication/SignIn";
import SignUp from "./authentication/SignUp";
import { LocalStorageKeys } from "./common/constants";
import api from "./api";
import { connect } from "react-redux";
import { loadUser } from "./redux/reducers/auth";

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => ({
  loadUser: (user) => {
    dispatch(loadUser(user));
  },
});

async function fetchUser(loadUser) {
  const response = await api.Participants.currentUser();
  loadUser(response.data);
}

function App(props) {
  // 01/05/2020: reset localstorage
  useEffect(() => {
    const reset = localStorage.getItem("reset");
    if (reset == null || new Date(reset) < 1588326307865) {
      localStorage.clear();
      const today = new Date();
      localStorage.setItem("reset", today.toString());
    }
  });

  useEffect(() => {
    // redirect if 401
    api.set401Interceptor(handle401);
    // set access token
    const access = localStorage.getItem(LocalStorageKeys.ACCESS);
    if (access != null) {
      api.setAccess(access);

      fetchUser(props.loadUser);

      // await api.Participants.currentUser().then(response => {
      //   props.loadUser(response.data);
      // });
    }
  });

  function handle401() {
    localStorage.removeItem(LocalStorageKeys.ACCESS);
    localStorage.removeItem(LocalStorageKeys.REFRESH);
    props.history.push("/signin");
    props.loadUser(null);
  }

  return (
    <div>
      <nav>
        <NavBar />
      </nav>

      <main>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/budget/edit" component={BudgetEdit} />
          <Route path="/budget/dashboard" component={BudgetDashboard} />
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
        </Switch>
      </main>
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
