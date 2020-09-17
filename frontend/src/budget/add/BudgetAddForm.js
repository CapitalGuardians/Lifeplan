import React from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel/index";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary/index";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails/index";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Grid from "@material-ui/core/Grid/index";
import Paper from "@material-ui/core/Paper/index";
import Typography from "@material-ui/core/Typography/index";
import withStyles from "@material-ui/core/styles/withStyles";
import ValidatedTextField from "../../common/ValidatedTextField";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import { ChevronLeft, ChevronRight } from "@material-ui/icons";
import api from "../../api";
import Button from "@material-ui/core/Button/index";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import _ from "lodash";
import connect from "react-redux/es/connect/connect";

function dateToString(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
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
let NDISNumberRegex = new RegExp(/^\d{0,9}$/);

MomentUtils.prototype.getStartOfMonth = MomentUtils.prototype.startOfMonth;

class BudgetAddForm extends React.Component {
  state = {
    supportCategories: [],
    name: null,
    ndisNumber: null,
    supportCategory: null,
    budget: null,
    startDate: null,
    endDate: null,
    showErrors: false,
    errors: {},
  };

  componentDidMount() {
    api.SupportCategories.list().then((response) => {
      if (response.data.length !== 0) {
        this.state.supportCategories = response.data.map((category) => {
          return category;
        });
      }
    });
  }

  // handle name input
  handleNameChange = (input) => (e) => {
    if (nameRegex.test(e.target.value)) {
      this.setState({ [input]: e.target.value });
    }
  };

  // handle NDIS number input by limiting it to 9 numeric value
  handleNDISNumberChange = (input) => (e) => {
    if (NDISNumberRegex.test(e.target.value)) {
      this.setState({ [input]: e.target.value });
    }
  };

  // handle support category input
  handleSupportCategoryChange = (input) => (category) => {
    this.state.supportCategory = category.target.value;
  };

  // handle budget input
  handleBudgetChange = (input) => (budget) => {
    this.setState({ [input]: budget.target.value });
  };

  // handle start date input
  handleStartDateChange = (input) => (date) => {
    this.setState({ [input]: date.toDate() });
  };

  // handle date input
  handleEndDateChange = (input) => (date) => {
    this.setState({ [input]: date.toDate() });
  };

  handleAdd = () => {
    const errors = this.validate();
    if (Object.keys(errors).length === 0) {
      if (this.props.currentUser != null) {
        const body = {
          name: this.state.name,
          ndisNumber: this.state.ndisNumber,
          startDate: dateToString(this.state.startDate),
          endDate: dateToString(this.state.endDate),
          supportCategories: [
            {
              supportCategory: this.state.supportCategory,
              budget: this.state.budget,
            },
          ],
        };

        api.Plans.create(body).then(() => {
          window.location.href = "/budget/edit";
        });
      } else {
        localStorage.setItem("name", this.state.name);
        localStorage.setItem("ndisNumber", this.state.ndisNumber);
        localStorage.setItem("supportCategory", this.state.supportCategory);
        localStorage.setItem("budget", this.state.budget);
        localStorage.setItem("startDate", this.state.startDate);
        localStorage.setItem("endDate", this.state.endDate);
      }
    } else {
      console.log(errors);
      this.setState({ errors: errors });
      this.setState({ showErrors: true });
    }
  };

  validate = () => {
    let errors = {};

    if (this.state.name == null) {
      errors.name = "Invalid Name";
    }

    if (
      this.state.ndisNumber == null ||
      this.state.ndisNumber.toString().length !== 9
    ) {
      errors.ndisNumber = "Invalid NDIS Number";
    }

    if (this.state.budget == null || this.state.budget == 0) {
      errors.budget = "Invalid Budget";
    }

    if (this.state.startDate === null) {
      errors.startDate = "Invalid Start Date";
    }

    if (this.state.endDate === null) {
      errors.endDate = "Invalid End Date";
    }

    return errors;
  };

  renderPlanDetailsForm = () => {
    const { classes } = this.props;
    const { errors, showErrors } = this.state;
    return (
      <ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Plan Details</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ValidatedTextField
                label="Name"
                required
                fullWidth
                onChange={this.handleNameChange("name")}
                value={this.state.name}
                type="text"
                error={showErrors}
                errortext={errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <ValidatedTextField
                label="NDIS Number"
                required
                fullWidth
                onChange={this.handleNDISNumberChange("ndisNumber")}
                value={this.state.ndisNumber}
                type="number"
                error={showErrors}
                errortext={errors.ndisNumber}
              />
            </Grid>
            <Grid item xs={12}>
              <InputLabel htmlFor={"suportCategory"}>
                Support Category
              </InputLabel>
              <Select
                fullWidth
                onChange={this.handleSupportCategoryChange("suportCategory")}
                name="suportCategory"
                id="suportCategory"
              >
                {this.state.supportCategories.map((key) => (
                  <MenuItem value={key["id"]} key={key}>
                    {key["name"]}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <ValidatedTextField
                label="Budget"
                required
                fullWidth
                onChange={this.handleBudgetChange("budget")}
                value={this.state.budget}
                type="number"
                error={showErrors}
                errortext={errors.budget}
              />
            </Grid>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <Grid item xs={12}>
                <DatePicker
                  label="Plan Start Date"
                  value={this.state.startDate}
                  onChange={this.handleStartDateChange("startDate")}
                  leftArrowIcon={<ChevronLeft />}
                  rightArrowIcon={<ChevronRight />}
                  required
                  fullWidth
                  format="D MMMM Y"
                  error={showErrors}
                  errortext={errors.startDate}
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  margin="normal"
                  label="Plan End Date"
                  value={this.state.endDate}
                  onChange={this.handleEndDateChange("endDate")}
                  leftArrowIcon={<ChevronLeft />}
                  rightArrowIcon={<ChevronRight />}
                  required
                  fullWidth
                  format="D MMMM Y"
                  error={showErrors}
                  errortext={errors.endDate}
                />
              </Grid>
            </MuiPickersUtilsProvider>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  // render page
  render() {
    const { classes } = this.props;
    return (
      <Paper className={classes.paper}>
        {this.renderPlanDetailsForm()}
        <Grid container justify="flex-end">
          <Button
            className={classes.button}
            color="primary"
            variant="contained"
            onClick={this.handleAdd}
          >
            Add
          </Button>
        </Grid>
      </Paper>
    );
  }
}

export default connect(mapStateToProps)(withStyles(styles)(BudgetAddForm));
