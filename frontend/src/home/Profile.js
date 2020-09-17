import React from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel/index";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary/index";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails/index";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Grid from "@material-ui/core/Grid/index";
import Paper from "@material-ui/core/Paper/index";
import Typography from "@material-ui/core/Typography/index";
import withStyles from "@material-ui/core/styles/withStyles";
import ValidatedTextField from "../common/ValidatedTextField";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import api from "../api";
import Button from "@material-ui/core/Button/index";
import { Switch, FormLabel } from "@material-ui/core";
import AlertMessage from "../common/AlertMessage";
import _ from "lodash";
import connect from "react-redux/es/connect/connect";
import { LocalStorageKeys } from "../common/constants";

function dateToString(date) {
  return moment(date).format("DD-MM-YYYY");
}

const styles = {
  paper: {
    marginLeft: "auto",
    marginRight: "auto",
    padding: 16,
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
  },
  number: {
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
      "-webkit-appearance": "none",
      margin: 0,
    },
  },
  sectionTotalColor: {
    color: "grey",
  },
};

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser,
  };
}

let nameRegex = new RegExp(/^[a-zA-Z ]+$/);
let EmailRegex = new RegExp(
  /^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/
);

MomentUtils.prototype.getStartOfMonth = MomentUtils.prototype.startOfMonth;

class Profile extends React.Component {
  state = {
    participantId: "",
    firstName: "",
    lastName: "",
    email: "",
    joinedDate: "",
    status: false,
    showErrors: false,
    errors: {},
    saved: false,
    savedFailure: false,
    alertVariant: "",
    displayMessage: "",
  };

  componentDidMount() {
    api.SupportGroups.all()
      .then((response) => {
        this.loadState(response.data);
      })
      .catch((err) => console.log(err));
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.state.firstName !== prevState.firstName ||
      this.state.lastName !== prevState.lastName ||
      this.state.email !== prevState.email
    ) {
      const errors = this.validate();
      this.setState({ errors: errors });
    }
  }

  // handle first name input
  handleFirstNameChange = (input) => (e) => {
    if (nameRegex.test(e.target.value)) {
      this.setState({ [input]: e.target.value });
    }
  };

  // handle last name input
  handleLastNameChange = (input) => (e) => {
    if (nameRegex.test(e.target.value)) {
      this.setState({ [input]: e.target.value });
    }
  };

  // handle NDIS number input by limiting it to 9 numeric value
  handleEmailChange = (input) => (e) => {
    if (EmailRegex.test(e.target.value)) {
      this.setState({ [input]: e.target.value });
    }
  };

  loadState = async () => {
    let participantId;
    let firstName;
    let lastName;
    let email;
    let joinedDate;
    let status;
    const access = localStorage.getItem(LocalStorageKeys.ACCESS);
    if (access != null) {
      await api.Participants.currentUser().then((response) => {
        participantId = response.data.id;
        firstName = response.data.firstName;
        lastName = response.data.lastName;
        email = response.data.email;
        joinedDate = response.data.dateJoined;
        status = response.data.isActive;
      });
    } else {
      const cachedFirstName = localStorage.getItem("firstName");
      const cachedLastName = localStorage.getItem("lastName");
      const cachedEmail = localStorage.getItem("email");

      firstName = cachedFirstName ? cachedFirstName : "";
      lastName = cachedLastName ? cachedLastName : "";
      email = cachedEmail ? cachedEmail : "";
    }

    this.setState({
      participantId,
      firstName,
      lastName,
      email,
      joinedDate,
      status,
    });
  };

  handleSave = () => {
    const errors = this.validate();
    this.setState({
      saved: false,
      savedFailure: false,
    });
    if (Object.keys(errors).length === 0) {
      if (this.props.currentUser != null) {
        const body = {
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          email: this.state.email,
        };

        api.Participants.update(this.state.participantId, body)
          .then(() => {
            this.setState({
              saved: true,
              displayMessage: "Profile saved",
              alertVariant: "success",
            });
            this.props.history.push("/profile");
          })
          .catch((err) => {
            this.setState({
              savedFailure: true,
              displayMessage: "Profile saved failed.",
              alertVariant: "error",
            });
          });
      } else {
        localStorage.setItem("name", this.state.name);
      }
    } else {
      console.log(errors);
      this.setState({ errors: errors });
      this.setState({ showErrors: true });
    }
  };

  validate = () => {
    let errors = {};

    if (this.state.firstName == null || this.state.firstName == "") {
      errors.firstName = "Invalid First Name";
    }

    if (this.state.lastName == null || this.state.lastName == "") {
      errors.lastName = "Invalid Last Name";
    }

    if (this.state.email == null || this.state.email == "") {
      errors.email = "Invalid Email";
    }

    return errors;
  };

  profile = () => {
    const { classes } = this.props;
    const { errors, showErrors } = this.state;
    return (
      <Paper className={classes.paper}>
        <ExpansionPanel defaultExpanded>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Profile</Typography>
            {this.state.saved && (
              <AlertMessage
                messages={this.state.displayMessage}
                variant={this.state.alertVariant}
              />
            )}
            {this.state.savedFailure && (
              <AlertMessage
                messages={this.state.displayMessage}
                variant={this.state.alertVariant}
              />
            )}
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container alignItems="center" className={classes.paper}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <ValidatedTextField
                    className={classes.name}
                    required
                    fullWidth
                    label="First Name"
                    onChange={this.handleFirstNameChange("firstName")}
                    value={this.state.firstName}
                    type="text"
                    error={showErrors}
                    errortext={errors.firstName}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedTextField
                    className={classes.name}
                    required
                    fullWidth
                    label="Last Name"
                    onChange={this.handleLastNameChange("lastName")}
                    value={this.state.lastName}
                    type="text"
                    error={showErrors}
                    errortext={errors.lastName}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedTextField
                    className={classes.name}
                    required
                    fullWidth
                    label="Email"
                    onChange={this.handleEmailChange("email")}
                    value={this.state.email}
                    type="email"
                    error={showErrors}
                    errortext={errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedTextField
                    disabled
                    fullWidth
                    label="Joined Date"
                    type="text"
                    value={dateToString(this.state.joinedDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormLabel>Status</FormLabel>
                  <Switch checked={this.state.status} />
                </Grid>
                <Grid container justify="flex-end">
                  <Button
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    onClick={this.handleSave}
                  >
                    Save
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Paper>
    );
  };

  // render page
  render() {
    const { classes } = this.props;
    return (
      <Grid container className={classes.paper} justify="center">
        <Grid item xs={11} sm={8} md={6} lg={5}>
          {this.profile()}
        </Grid>
      </Grid>
    );
  }
}

export default connect(mapStateToProps)(withStyles(styles)(Profile));
