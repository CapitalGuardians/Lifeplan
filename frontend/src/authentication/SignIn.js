import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import { Grid } from "@material-ui/core";
import Api from "../api";
import AlertMessage from "../common/AlertMessage";
import { LocalStorageKeys } from "../common/constants";
import { loadUser } from "../redux/reducers/auth";
import connect from "react-redux/es/connect/connect";

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => ({
  loadUser: (user) => {
    dispatch(loadUser(user));
  },
});

const styles = (theme) => ({
  main: {
    width: "auto",
    display: "block",
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    [theme.breakpoints.up(400 + theme.spacing(3 * 2))]: {
      width: 400,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  paper: {
    marginTop: theme.spacing(10),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(
      3
    )}px`,
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  registerStl: {
    marginTop: theme.spacing(3),
    display: "flex",
    flexDirection: "row-reverse",
  },
  registerBtn: {
    marginTop: 0,
  },
  registerLabel: {
    marginTop: theme.spacing(1),
  },
  submitBtn: {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: theme.spacing(3),
  },
});

class SignIn extends React.Component {
  state = {
    email: "",
    password: "",
    remember: false,
    submitted: false,
    loggedIn: false,
    loggedInFailure: false,
    alertVariant: "",
    displayMessage: "",
  };

  handleInput = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  handleSubmit = (event) => {
    this.setState({ submitted: true });

    event.preventDefault();

    const { email, password } = this.state;

    const logInfo = {
      email,
      password,
    };

    Api.Auth.login(logInfo)
      .then((response) => {
        this.setState({
          loggedIn: true,
          displayMessage: "Login successful",
          alertVariant: "success",
        });
        localStorage.setItem(LocalStorageKeys.REFRESH, response.data.refresh);
        Api.setAccess(response.data.access);
        Api.Participants.currentUser().then((response) => {
          Api.Plans.list().then((plans) => {
            if (plans.data.length === 0) {
              this.props.history.replace("/budget/edit");
            } else {
              this.props.history.replace("/budget/dashboard");
            }
          });
          this.props.loadUser(response.data);
        });
      })
      .catch((err) => {
        this.setState({
          loggedInFailure: true,
          displayMessage: "Login Failed. Incorrect username or password",
          alertVariant: "error",
        });
      });

    // send email and password
  };

  render() {
    const { classes } = this.props;
    const email = "email";
    const pwd = "password";
    const margin_size = "normal";
    const remember = "remember";

    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component={"h1"} variant={"h5"}>
            Sign in
          </Typography>
          {this.state.loggedIn && (
            <AlertMessage
              messages={this.state.displayMessage}
              variant={this.state.alertVariant}
            />
          )}
          {this.state.loggedInFailure && (
            <AlertMessage
              messages={this.state.displayMessage}
              variant={this.state.alertVariant}
            />
          )}
          <form className={classes.form} onSubmit={this.handleSubmit}>
            <FormControl margin={margin_size} required fullWidth>
              <InputLabel htmlFor={email}>Email Address</InputLabel>
              <Input
                id={email}
                name={email}
                autoComplete={email}
                autoFocus
                onChange={(e) => this.handleInput(e)}
              />
            </FormControl>
            <FormControl margin={margin_size} required fullWidth>
              <InputLabel htmlFor={pwd} required>
                Password
              </InputLabel>
              <Input
                name={pwd}
                type={pwd}
                id={pwd}
                autoComplete="current-password"
                onChange={(e) => this.handleInput(e)}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  value={this.state.remember}
                  color="primary"
                  name={remember}
                  onChange={(e) => this.handleInput(e)}
                />
              }
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submitBtn}
            >
              Sign in
            </Button>
          </form>
        </Paper>
        <Grid className={classes.registerStl}>
          <Button
            type="button"
            color="secondary"
            className={classes.registerBtn}
            onClick={() => (window.location.href = "/signup")}
          >
            SignUp
          </Button>
          <Typography className={classes.registerLabel}>
            Don't have an account?
          </Typography>
        </Grid>
      </main>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SignIn));
