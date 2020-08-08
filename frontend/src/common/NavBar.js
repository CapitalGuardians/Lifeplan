import React from "react";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { NAV_BAR_HEIGHT } from "./theme";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import connect from "react-redux/es/connect/connect";
import { LocalStorageKeys } from "./constants";

const navBarStyles = makeStyles({
  navBar: {
    height: NAV_BAR_HEIGHT,
  },
  grow: {
    flexGrow: 1,
  },
});

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser,
  };
}

function NavBar(props) {
  function handleSignOut() {
    localStorage.removeItem(LocalStorageKeys.ACCESS);
    localStorage.removeItem(LocalStorageKeys.REFRESH);

    window.location.replace("/");
  }
  const classes = navBarStyles();
  return (
    <AppBar position="static">
      <Toolbar className={classes.navBar}>
        <Typography variant="h6" color="inherit">
          NDIS Financial Planner
        </Typography>
        <div className={classes.grow}>
          <Button href="/" color="inherit">
            Home
          </Button>
          {props.currentUser ? (
            <Button onClick={handleSignOut} color="inherit">
              Sign out
            </Button>
          ) : (
            <Button href="/signin" color="inherit">
              Sign In
            </Button>
          )}
        </div>
        {props.currentUser && (
          <Typography>Welcome, {props.currentUser.firstName}</Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default connect(mapStateToProps)(NavBar);
