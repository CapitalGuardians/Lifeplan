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
  submitBtn: {
    marginLeft: "7%",
    marginRight: "7%",
    width: "36%",
    marginTop: theme.spacing(3),
  },
});

class SignUp extends React.Component {
  state = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    postcode: "",
    birthYear: "",
    accept: false,
    submitted: false,
    submittedSuccess: true,
    alertMessage: "Oops",
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

    const {
      email,
      password,
      firstName,
      lastName,
      postcode,
      birthYear,
    } = this.state;

    const Reginfo = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      postcode: postcode,
      birthYear: birthYear,
    };

    Api.Auth.register(Reginfo)
      .then((response) => {
        const token = response.data.tokens;
        Api.setAccess(token.access);
        localStorage.setItem(LocalStorageKeys.REFRESH, token.refresh);
        this.props.history.replace("/");
        Api.Participants.currentUser().then((response) => {
          this.props.loadUser(response.data);
        });
      })
      .catch((err) => {
        this.setState({ submittedSuccess: false });
        if (err.response != null) {
          let keys = Object.keys(err.response.data);
          let receivedMessage = err.response.data[keys[0]].toString();
          console.log(receivedMessage);

          this.setState({
            alertMessage: receivedMessage,
          });
        } else {
          this.setState({
            alertMessage: "Sign up failed. Server failures have occured.",
          });
        }
      });

    // send email and password
  };

  render() {
    const { classes } = this.props;
    const email = "email";
    const pwd = "password";
    const marginSize = "normal";
    const firstName = "firstName";
    const lastName = "lastName";
    const postCode = "postcode";
    const birthYear = "birthYear";
    const accept = "accept";
    const alertVariant = "warning";

    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          {!this.state.submittedSuccess && (
            <AlertMessage
              messages={this.state.alertMessage}
              variant={alertVariant}
            />
          )}
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component={"h1"} variant={"h5"}>
            Sign Up
          </Typography>

          <form className={classes.form} onSubmit={this.handleSubmit}>
            <FormControl margin={marginSize} required fullWidth>
              <InputLabel htmlFor={email}>Email Address</InputLabel>
              <Input
                id={email}
                name={email}
                autoComplete={email}
                autoFocus
                onChange={(e) => this.handleInput(e)}
              />
            </FormControl>
            <FormControl margin={marginSize} required fullWidth>
              <InputLabel htmlFor={pwd} required fullWidth>
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
            <FormControl margin={marginSize} required fullWidth>
              <InputLabel htmlFor={firstName}>First Name</InputLabel>
              <Input
                id={firstName}
                name={firstName}
                autoComplete="name"
                onChange={(e) => this.handleInput(e)}
              />
            </FormControl>
            <FormControl margin={marginSize} required fullWidth>
              <InputLabel htmlFor={lastName}>Last Name</InputLabel>
              <Input
                id={lastName}
                name={lastName}
                autoComplete="family-name"
                onChange={(e) => this.handleInput(e)}
              />
            </FormControl>
            <FormControl margin={marginSize} required fullWidth>
              <InputLabel htmlFor={postCode}>Postcode</InputLabel>
              <Input
                id={postCode}
                name={postCode}
                autoComplete="postal-code"
                onChange={(e) => this.handleInput(e)}
              />
            </FormControl>
            <FormControl margin={marginSize} required fullWidth>
              <InputLabel htmlFor={birthYear}>Year of Birth</InputLabel>
              <Input
                id={birthYear}
                name={birthYear}
                autoComplete="bday-year"
                onChange={(e) => this.handleInput(e)}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  value={this.state.accept}
                  name={accept}
                  color="primary"
                  onChange={(e) => this.handleInput(e)}
                />
              }
              label="Click to accept our Terms & Conditions"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submitBtn}
            >
              Sign Up
            </Button>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              className={classes.submitBtn}
              onClick={() => (window.location.href = "/signin")}
            >
              Cancel
            </Button>
          </form>
        </Paper>
      </main>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SignUp));
