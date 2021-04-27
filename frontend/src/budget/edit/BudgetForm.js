import React from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel/index";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary/index";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails/index";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import InputAdornment from "@material-ui/core/InputAdornment/index";
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
import _, { isEmpty } from "lodash";
import connect from "react-redux/es/connect/connect";
import { LocalStorageKeys } from "../../common/constants";

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
  addNewButton: {
    marginTop: 16,
  },
  outerPaper: {
    margin: 24,
    marginLeft: "auto",
    marginRight: "auto",
    padding: 16,
  },
  buttonMargin: {
    marginTop: 10,
  },
};

//test
function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser,
  };
}

const PLAN_CATEGORIES = "planCategories";

let moneyRegex = new RegExp(/^-?\d*\.?\d{0,2}$/);
let postcodeRegex = new RegExp(/^\d{0,4}$/);
let nameRegex = new RegExp(/^[a-zA-Z ]+$/);
let NDISNumberRegex = new RegExp(/^\d{0,9}$/);
let BirthYearRegex = new RegExp(/^\d{0,4}$/);

const today = new Date();

// return date exactly a year from today's date
function getYearFromToday() {
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);
  return nextYear;
}

// processes a string to capitalise the first letter every word
function titleCase(str) {
  str = str.toLowerCase().split(" ");
  for (let i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
}

MomentUtils.prototype.getStartOfMonth = MomentUtils.prototype.startOfMonth;

class FormPersonalDetails extends React.Component {
  state = {
    supportGroups: [],
    name: "",
    ndisNumber: "",
    postcode: "",
    birthYear: "",
    startDate: null,
    endDate: null,
    planCategories: {},
    showErrors: false,
    errors: {},
    planId: null,
    allPlans: [],
    updatePlans: [],
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
      this.state.name !== prevState.name ||
      this.state.ndisNumber !== prevState.ndisNumber ||
      this.state.postcode !== prevState.postcode ||
      this.state.birthYear !== prevState.birthYear
    ) {
      const errors = this.validate();
      this.setState({ errors: errors });
    }
  }

  loadState = async (supportGroups) => {
    this.setState({ supportGroups: [...supportGroups] });
    let planCategories = {};
    let allPlans = [];
    let updatePlans = [];
    let participantId;
    let birthYear;
    let postcode;
    let name;
    let ndisNumber;
    let startDate;
    let endDate;
    const access = localStorage.getItem(LocalStorageKeys.ACCESS);
    if (access != null) {
      await api.Participants.currentUser().then((response) => {
        participantId = response.data.id;
        birthYear = response.data.birthYear;
        postcode = response.data.postcode;
        name = response.data.firstName + " " + response.data.lastName;
      });
      // TODO: refactor into reusable function
      await api.Plans.list().then((response) => {
        if (response.data.length === 0) {
          _.map(supportGroups, (supportGroup) => {
            _.map(supportGroup.supportCategories, (supportCategory) => {
              planCategories[supportCategory.id] = {
                budget: 0,
              };
            });
          });
          startDate = today;
          endDate = getYearFromToday();
        } else {
          const plans = response.data;
          _.map(plans, (plan, index) => {
            this.setState({ planId: plan.id });
            ndisNumber = plan.ndisNumber;
            startDate = new Date(plan.startDate);
            endDate = new Date(plan.endDate);
            allPlans[index] = {
              ...plan,
            };
            updatePlans[index] = {
              name: plan.name,
              ndisNumber: plan.ndisNumber,
              startDate: plan.startDate,
              endDate: plan.endDate,
              planCategories: plan.planCategories,
            };
            _.map(plan.planCategories, (planCategory) => {
              planCategories[planCategory.supportCategory] = {
                ...planCategory,
              };
            });
          });
        }
      });
    } else {
      let cachedPlanCategories = localStorage.getItem(PLAN_CATEGORIES);
      const cachedBirthYear = localStorage.getItem("birthYear");
      const cachedPostcode = localStorage.getItem("postcode");
      const cachedName = localStorage.getItem("name");
      const cachedNDISNumber = localStorage.getItem("ndisNumber");
      const cachedStartDate = localStorage.getItem("startdate");
      const cachedEndDate = localStorage.getItem("endDate");
      if (cachedPlanCategories === null) {
        _.map(supportGroups, (supportGroup) => {
          _.map(supportGroup.supportCategories, (supportCategory) => {
            planCategories[supportCategory.id] = {
              budget: 0,
              planItemGroups: [],
            };
          });
        });
      } else {
        planCategories = JSON.parse(cachedPlanCategories);
      }
      birthYear = cachedBirthYear ? parseInt(cachedBirthYear) : "";
      postcode = cachedPostcode ? parseInt(cachedPostcode) : "";
      name = cachedName ? cachedName : "";
      ndisNumber = cachedNDISNumber ? parseInt(cachedNDISNumber) : "";
      startDate = cachedStartDate ? new Date(cachedStartDate) : today;
      endDate = cachedEndDate ? new Date(cachedEndDate) : getYearFromToday();
    }

    this.setState({
      planCategories,
      birthYear,
      postcode,
      participantId,
      name,
      ndisNumber,
      startDate,
      endDate,
      allPlans,
      updatePlans,
    });
  };

  // handle money input
  handleChange = async (e, supportCategoryId, indexPlan, indexPlanCategory) => {
    // check if input string is the correct format for money
    if (e.target.value === "" || moneyRegex.test(e.target.value)) {
      // set new amount
      let new_amount;
      if (e.target.value === "") {
        new_amount = 0;
      } else {
        new_amount = parseFloat(e.target.value);
      }
      const updatePlans = this.state.updatePlans;
      const planCategories = this.state.updatePlans[indexPlan].planCategories;
      await this.setState({
        updatePlans: {
          ...updatePlans,
          [indexPlan]: {
            ...updatePlans[indexPlan],
            planCategories: {
              ...planCategories,
              [indexPlanCategory]: {
                ...planCategories[indexPlanCategory],
                budget: new_amount,
              },
            },
          },
        },
      });
    }
  };

  // handle money input
  handleChangeOffline = (e, supportCategoryId) => {
    // check if input string is the correct format for money
    if (moneyRegex.test(e.target.value)) {
      // set new amount
      let new_amount;
      if (e.target.value === "") {
        new_amount = 0;
      } else {
        new_amount = parseFloat(e.target.value);
      }
      const planCategories = this.state.planCategories;
      this.setState({
        planCategories: {
          ...planCategories,
          [supportCategoryId]: {
            ...planCategories[supportCategoryId],
            budget: new_amount,
          },
        },
      });
    }
  };

  // handle postcode input by limiting it to 4 digits (also works for year)
  handlePostCodeChange = (input) => (e) => {
    if (postcodeRegex.test(e.target.value)) {
      this.setState({ [input]: e.target.value });
    }
  };

  // handle offline Name
  handleOfflineNameChange = (input) => (e) => {
    if (e.target.value === "" || nameRegex.test(e.target.value)) {
      this.setState({ [input]: e.target.value });
    }
  };

  // handle offline NDIS NUmber
  handleOfflineNDISNumberChange = (input) => (e) => {
    if (e.target.value === "" || NDISNumberRegex.test(e.target.value)) {
      this.setState({ [input]: e.target.value });
    }
  };

  // handle offline birth year input
  handleOfflineBirthYearChange = (input) => (e) => {
    if (
      e.target.value === "" ||
      e.target.value === 0 ||
      BirthYearRegex.test(e.target.value)
    ) {
      this.setState({ [input]: e.target.value });
    }
  };

  // handle date change
  handleOfflineDateChange = (input) => async (e) => {
    let date = dateToString(new Date(dateToString(new Date(e))));
    await this.setState({ [input]: date });
  };

  // handle name input
  handleNameChange = (input, index) => async (e) => {
    if (e.target.value === "" || nameRegex.test(e.target.value)) {
      let updatePlans = [...this.state.updatePlans];
      let updatePlan = { ...updatePlans[index] };
      updatePlan[input] = e.target.value;
      updatePlans[index] = updatePlan;
      await this.setState({ updatePlans });
    }
  };

  // handle birth year input
  handleBirthYearChange = (input) => (e) => {
    if (
      e.target.value === "" ||
      e.target.value === 0 ||
      BirthYearRegex.test(e.target.value)
    ) {
      this.setState({ [input]: e.target.value });
    }
  };

  // handle NDIS number input by limiting it to 9 numeric value
  handleNDISNumberChange = (input, index) => async (e) => {
    if (e.target.value === "" || NDISNumberRegex.test(e.target.value)) {
      let updatePlans = [...this.state.updatePlans];
      let updatePlan = { ...updatePlans[index] };
      updatePlan[input] = e.target.value;
      updatePlans[index] = updatePlan;
      await this.setState({ updatePlans });
    }
  };

  // handle date input
  handleDateChange = (input, index) => async (e) => {
    let updatePlans = [...this.state.updatePlans];
    let updatePlan = { ...updatePlans[index] };
    updatePlan[input] = dateToString(new Date(dateToString(new Date(e))));
    updatePlans[index] = updatePlan;
    await this.setState({ updatePlans });
  };

  handleNext = (event, planId, index) => {
    event.preventDefault();
    const errors = this.validate();
    if (Object.keys(errors).length === 0) {
      if (this.props.currentUser != null) {
        const body = {
          name: this.state.updatePlans[index].name,
          ndisNumber: this.state.updatePlans[index].ndisNumber,
          startDate: this.state.updatePlans[index].startDate,
          endDate: this.state.updatePlans[index].endDate,
        };

        localStorage.setItem(
          "startDate",
          JSON.stringify(this.state.updatePlans[index].startDate)
        );
        localStorage.setItem(
          "endDate",
          JSON.stringify(this.state.updatePlans[index].endDate)
        );

        const categories = _.map(
          this.state.updatePlans[index].planCategories,
          (planCategory, supportCategory) => {
            return {
              ...planCategory,
              supportCategory: supportCategory,
              budget: planCategory.budget,
            };
          }
        );
        if (this.state.planId === null) {
          body.supportCategories = categories;
          api.Plans.create(body).then(() => {
            this.props.history.push("/budget/dashboard");
          });
        } else {
          const participantBody = {
            firstName: this.props.currentUser.firstName,
            lastName: this.props.currentUser.lastName,
            email: this.props.currentUser.email,
            postcode: this.state.postcode,
            birthYear: this.state.birthYear,
          };
          console.log("...id...");
          api.Participants.update(this.state.participantId, participantBody)
            .then(() => {
              body.planCategories = categories;
              api.Plans.update(planId, body).then(() => {
                this.props.history.push({
                  pathname: "/budget/dashboard",
                  state: planId,
                });
              });
            })
            .catch((err) => {});
        }
      } else {
        localStorage.setItem("postcode", this.state.postcode);
        localStorage.setItem("name", this.state.name);
        localStorage.setItem("ndisNumber", this.state.ndisNumber);
        localStorage.setItem("birthYear", this.state.birthYear);
        localStorage.setItem("startDate", this.state.startDate);
        localStorage.setItem("endDate", this.state.endDate);
        localStorage.setItem(
          PLAN_CATEGORIES,
          JSON.stringify(this.state.planCategories)
        );
        this.props.history.push("/budget/dashboard");
      }
    } else {
      console.log(errors);
      this.setState({ errors: errors });
      this.setState({ showErrors: true });
    }
  };

  handleNextOffline = () => {
    const errors = this.validate();
    if (Object.keys(errors).length === 0) {
      localStorage.setItem("name", this.state.name);
      localStorage.setItem("ndisNumber", this.state.ndisNumber);
      localStorage.setItem("postcode", this.state.postcode);
      localStorage.setItem("birthYear", this.state.birthYear);
      localStorage.setItem("startDate", this.state.startDate);
      localStorage.setItem("endDate", this.state.endDate);
      localStorage.setItem(
        PLAN_CATEGORIES,
        JSON.stringify(this.state.planCategories)
      );
      this.props.history.push("/budget/dashboard");
    } else {
      console.log(errors);
      this.setState({ errors: errors });
      this.setState({ showErrors: true });
    }
  };

  handleAddNew = () => {
    this.props.history.push("/budget/add");
  };

  validate = () => {
    let errors = {};

    if (
      this.state.postcode === null ||
      this.state.postcode.toString().length !== 4
    ) {
      //this.log.console("postcode is not filled");
      errors.postcode = "Invalid Postcode";
    }

    if (this.state.name === null || isEmpty(this.state.name)) {
      errors.name = "Please Input Name";
    }

    if (
      this.state.ndisNumber === null || this.state.ndisNumber !== undefined
        ? this.state.ndisNumber.toString().length !== 9
        : true
    ) {
      errors.ndisNumber = "Invalid NDIS Number";
    }

    if (
      this.state.birthYear === null ||
      this.state.birthYear.toString().length !== 4 ||
      this.state.birthYear > today.getFullYear()
    ) {
      errors.birthYear = "Invalid Birth Year";
    }

    // if(this.state.start_date === null){
    //  errors.start_date = "Invalid Start Date";
    //}

    // this.setState({
    //   ...this.state,
    //   ...errors
    // })
    return errors;
  };

  generateStateProperties = () => {
    for (let i in this.state.supportGroups) {
      let group = this.state.supportGroups[i];
      this.setState({ [group.name]: 0 });

      for (let j in group.supportCategories) {
        const category = group.supportCategories[j];
        this.setState({ [category.name]: "" });
      }
    }
  };

  renderPersonalDetailsForm = (planId) => {
    const { classes } = this.props;
    const { errors, showErrors } = this.state;
    return this.state.allPlans.map((plan, index) => {
      if (plan.id === planId) {
        return (
          <ExpansionPanel key={index}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Personal Details</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <ValidatedTextField
                    className={classes.name}
                    required
                    label="Name"
                    onChange={this.handleNameChange("name", index)}
                    value={this.state.updatePlans[index].name}
                    type="text"
                    error={showErrors}
                    errortext={errors.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedTextField
                    className={classes.number}
                    required
                    label="NDIS #"
                    onChange={this.handleNDISNumberChange("ndisNumber", index)}
                    value={this.state.updatePlans[index].ndisNumber}
                    helperText={"Used to determine NDIS Number"}
                    type="number"
                    error={showErrors}
                    errortext={errors.ndisNumber}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedTextField
                    className={classes.number}
                    required
                    label="Postcode"
                    onChange={this.handlePostCodeChange("postcode")}
                    value={this.state.postcode}
                    helperText={"Used to determine postcode"}
                    type="number"
                    error={showErrors}
                    errortext={errors.postcode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedTextField
                    className={classes.number}
                    required
                    label="Year of Birth"
                    onChange={this.handleBirthYearChange("birthYear")}
                    value={this.state.birthYear}
                    helperText={"Used to determine birth year"}
                    type="number"
                    error={showErrors}
                    errortext={errors.birthYear}
                  />
                </Grid>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <Grid item xs={12}>
                    <DatePicker
                      label="Plan Start Date"
                      value={this.state.updatePlans[index].startDate}
                      onChange={this.handleDateChange("startDate", index)}
                      leftArrowIcon={<ChevronLeft />}
                      rightArrowIcon={<ChevronRight />}
                      required
                      id="startDate"
                      name="startDate"
                      format="D MMMM Y"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DatePicker
                      margin="normal"
                      label="Plan End Date"
                      value={this.state.updatePlans[index].endDate}
                      onChange={this.handleDateChange("endDate", index)}
                      leftArrowIcon={<ChevronLeft />}
                      rightArrowIcon={<ChevronRight />}
                      required
                      format="D MMMM Y"
                    />
                  </Grid>
                </MuiPickersUtilsProvider>
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        );
      } else {
        return null;
      }
    });
  };

  renderPlanCategories = (planId) => {
    const { classes } = this.props;
    return this.state.supportGroups.map((group, index) => {
      return (
        <ExpansionPanel key={index}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{titleCase(group.name)}</Typography>
            <Typography
              variant="h6"
              className={this.props.sectionTotalColor}
              inline="true"
            >
              {" "}
              {/*&nbsp;|&nbsp;Total: ${this.state[group.name]}*/}
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={3}>
              {group.supportCategories.map((category, index) => {
                return this.state.allPlans.map((plan, index) => {
                  if (plan.id === planId) {
                    const indexPlan = index;
                    return plan.planCategories.map((planCategory, index) => {
                      const indexPlanCategory = index;
                      if (
                        planCategory.plan === planId &&
                        category.id === planCategory.supportCategory
                      ) {
                        return (
                          <Grid item xs={12} key={index}>
                            <Typography variant="body1">
                              {titleCase(category.name)}
                            </Typography>
                            <ValidatedTextField
                              className={classes.number}
                              onChange={(event) =>
                                this.handleChange(
                                  event,
                                  category.id,
                                  indexPlan,
                                  indexPlanCategory
                                )
                              }
                              value={
                                this.state.updatePlans[indexPlan]
                                  .planCategories[indexPlanCategory].budget ||
                                ""
                              }
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    $
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        );
                      }
                      return null;
                    });
                  }
                  return null;
                });
              })}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      );
    });
  };

  renderAddNew = () => {
    const { classes } = this.props;
    return (
      <div className={classes.addNewButton}>
        <Grid container justify="flex-start">
          <Button
            className={classes.button}
            color="primary"
            variant="contained"
            onClick={this.handleAddNew}
          >
            Add New Budget +
          </Button>
        </Grid>
      </div>
    );
  };

  renderPlan(planId, index) {
    const { classes } = this.props;
    return (
      <Paper className={classes.paper}>
        {this.renderPersonalDetailsForm(planId)}
        {this.renderPlanCategories(planId)}
        <Grid container justify="flex-end" className={classes.buttonMargin}>
          <Button
            className={classes.button}
            color="primary"
            variant="contained"
            onClick={(event) => this.handleNext(event, planId, index)}
          >
            Submit
          </Button>
        </Grid>
      </Paper>
    );
  }

  renderAllPlans() {
    // const { allPlans } = this.state;
    return this.state.allPlans.map((plan, index) => {
      return (
        <ExpansionPanel key={index} defaultExpanded={index === 0}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{plan.name}</Typography>
            <Grid container justify="flex-end">
              <Button
                color="primary"
                variant="contained"
                onClick={(event) => this.handleNext(event, plan.id, index)}
              >
                View
              </Button>
            </Grid>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            {this.renderPlan(plan.id, index)}
          </ExpansionPanelDetails>
        </ExpansionPanel>
      );
    });
  }

  renderOfflinePersonalDetailsForm = () => {
    const { classes } = this.props;
    const { errors, showErrors } = this.state;
    return (
      <ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Personal Details</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ValidatedTextField
                className={classes.name}
                required
                label="Name"
                onChange={this.handleOfflineNameChange("name")}
                value={this.state.name}
                type="text"
                error={showErrors}
                errortext={errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <ValidatedTextField
                className={classes.number}
                required
                label="NDIS #"
                onChange={this.handleOfflineNDISNumberChange("ndisNumber")}
                value={this.state.ndisNumber}
                helperText={"Used to determine NDIS Number"}
                type="number"
                error={showErrors}
                errortext={errors.ndisNumber}
              />
            </Grid>
            <Grid item xs={12}>
              <ValidatedTextField
                className={classes.number}
                required
                label="Postcode"
                onChange={this.handlePostCodeChange("postcode")}
                value={this.state.postcode}
                helperText={"Used to determine appropriate support item prices"}
                type="number"
                error={showErrors}
                errortext={errors.postcode}
              />
            </Grid>
            <Grid item xs={12}>
              <ValidatedTextField
                className={classes.number}
                required
                label="Year of Birth"
                onChange={this.handleOfflineBirthYearChange("birthYear")}
                value={this.state.birthYear}
                helperText={"Used to determine birth year"}
                type="number"
                error={showErrors}
                errortext={errors.birthYear}
              />
            </Grid>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <Grid item xs={12}>
                <DatePicker
                  label="Plan Start Date"
                  value={this.state.startDate}
                  onChange={this.handleOfflineDateChange("startDate")}
                  leftArrowIcon={<ChevronLeft />}
                  rightArrowIcon={<ChevronRight />}
                  required
                  id="startDate"
                  name="startDate"
                  format="D MMMM Y"
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  margin="normal"
                  label="Plan End Date"
                  value={this.state.endDate}
                  onChange={this.handleOfflineDateChange("endDate")}
                  leftArrowIcon={<ChevronLeft />}
                  rightArrowIcon={<ChevronRight />}
                  required
                  format="D MMMM Y"
                />
              </Grid>
            </MuiPickersUtilsProvider>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  renderOfflinePlanCategories = () => {
    // const { planCategories } = this.state;
    const { classes } = this.props;
    return this.state.supportGroups.map((group, index) => {
      return (
        <ExpansionPanel key={index}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{titleCase(group.name)}</Typography>
            <Typography
              variant="h6"
              className={this.props.sectionTotalColor}
              inline="true"
            >
              {" "}
              {/*&nbsp;|&nbsp;Total: ${this.state[group.name]}*/}
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={3}>
              {group.supportCategories.map((category, index) => {
                return (
                  <Grid item xs={12} key={index}>
                    <Typography variant="body1">
                      {titleCase(category.name)}
                    </Typography>
                    <ValidatedTextField
                      className={classes.number}
                      onChange={(event) =>
                        this.handleChangeOffline(event, category.id)
                      }
                      value={
                        this.state.planCategories[category.id]
                          ? this.state.planCategories[category.id].budget
                          : ""
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      );
    });
  };

  // render page
  render() {
    const { classes } = this.props;
    const access = localStorage.getItem(LocalStorageKeys.ACCESS);
    if (access === null) {
      return (
        <Paper className={classes.outerPaper}>
          {access === null ? this.renderOfflinePersonalDetailsForm() : ""}
          {access === null ? this.renderOfflinePlanCategories() : ""}
          <Grid container justify="flex-end" className={classes.buttonMargin}>
            <Button
              className={classes.button}
              color="primary"
              variant="contained"
              onClick={this.handleNextOffline}
            >
              Submit
            </Button>
          </Grid>
        </Paper>
      );
    } else {
      return (
        <Paper className={classes.outerPaper}>
          {this.renderAllPlans()}
          {this.renderAddNew()}
        </Paper>
      );
    }
  }
}

export default connect(mapStateToProps)(
  withStyles(styles)(FormPersonalDetails)
);
