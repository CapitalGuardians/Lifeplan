import React from "react";
import BudgetCategorySection from "./BudgetCategorySection";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import { Button, CardActions, CardContent } from "@material-ui/core";
import _ from "lodash";
import { Doughnut } from "react-chartjs-2";
import CardHeader from "@material-ui/core/CardHeader";
import BudgetCategoryCard from "../../DoughnutChart/Body/BudgetCategoryCard";
import api from "../../api";
import SupportItemSelector from "./SupportItemSelector";
import { DARK_BLUE, LIGHT_BLUE } from "../../common/theme";
import connect from "react-redux/es/connect/connect";
import { LocalStorageKeys } from "../../common/constants";
import EditIcon from "@material-ui/icons/Edit";
import PrintIcon from "@material-ui/icons/Print";
import ReactDOMServer from "react-dom/server";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableCell from "@material-ui/core/TableCell";

const PLAN_CATEGORIES = "planCategories";
export const OPEN_ADD_SUPPORTS = 1;

function printPage(planCategories) {
  let w = window.open();

  let html = ReactDOMServer.renderToStaticMarkup(
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Unit Price</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Frequency</TableCell>
          <TableCell>Total</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {_.map(planCategories, planCategory => {
          return _.map(planCategory.planItems, planItem => {
            let frequency = "Yearly";
            if (planItem.frequencyPerYear === 365) {
              frequency = "Daily";
            } else if (planItem.frequencyPerYear === 52) {
              frequency = "Weekly";
            } else if (planItem.frequencyPerYear === 12) {
              frequency = "Monthly";
            }
            const total =
              planItem.priceActual *
              planItem.quantity *
              planItem.frequencyPerYear;
            return (
              <TableRow key={planItem.id}>
                <TableCell>{planItem.name}</TableCell>
                <TableCell>${planItem.priceActual}</TableCell>
                <TableCell>{planItem.quantity}</TableCell>
                <TableCell>{frequency}</TableCell>
                <TableCell>${total}</TableCell>
              </TableRow>
            );
          });
        })}
      </TableBody>
    </Table>
  );

  w.document.write(html);
  w.window.print();
  w.document.close();
}

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser
  };
}

function calculateAllocated(planItems) {
  let allocated = 0;
  _.forEach(planItems, planItem => {
    const { quantity, priceActual, frequencyPerYear } = planItem;
    if (quantity && priceActual && frequencyPerYear) {
      allocated +=
        planItem.quantity * planItem.priceActual * planItem.frequencyPerYear;
    }
  });
  return allocated;
}

class BudgetDashBoard extends React.Component {
  state = {
    supportGroups: [],
    planCategories: {},
    openSupports: false,
    activeCategory: null,
    birthYear: 1990,
    postcode: 3000,
    planId: null,
    openAddSupports: 0,
    registrationGroups: []
  };

  async componentDidMount() {
    // call backend to load all plan groups and corresponding categories
    api.SupportGroups.all()
      .then(response => {
        this.setState({ supportGroups: [...response.data] }, this.loadState);
      })
      .catch(error => {
        console.log(error);
      });
    api.RegistrationGroups.list().then(response => {
      this.setState({ registrationGroups: response.data });
    });
  }

  componentDidUpdate(prevProps, prevState, snapShot) {
    if (
      this.props.currentUser == null &&
      this.state.planCategories !== prevState.planCategories
    ) {
      localStorage.setItem(
        PLAN_CATEGORIES,
        JSON.stringify(this.state.planCategories)
      );
    }
  }

  // load plan categories, birthYear and postcode either from backend if logged in else from local storage
  loadState = async () => {
    let planCategories = {};
    let birthYear = null;
    let postcode = null;
    if (localStorage.getItem(LocalStorageKeys.ACCESS) != null) {
      await api.Participants.currentUser().then(response => {
        birthYear = response.data.birthYear;
        postcode = response.data.postcode;
      });
      await api.Plans.list().then(async response => {
        if (response.data.length === 0) {
          window.location.href = "/budget/edit";
        } else {
          const plan = response.data[0];
          this.setState({ planId: plan.id });
          await Promise.all(
            _.map(plan.planCategories, async planCategory => {
              const response = await api.PlanItems.list(planCategory.id);
              planCategories[planCategory.supportCategory] = {
                ...planCategory,
                planItems: response.data
              };
            })
          );
        }
      });
      this.setState({
        planCategories,
        birthYear,
        postcode
      });
    } else {
      let cachedPlanCategories = localStorage.getItem(PLAN_CATEGORIES);
      const cachedBirthYear = localStorage.getItem("birthYear");
      const cachedPostcode = localStorage.getItem("postcode");
      if (
        cachedPostcode != null &&
        cachedBirthYear != null &&
        cachedPlanCategories != null
      ) {
        planCategories = JSON.parse(cachedPlanCategories);
        birthYear = parseInt(cachedBirthYear);
        postcode = parseInt(cachedPostcode);
        this.setState({
          planCategories,
          birthYear,
          postcode
        });
      } else {
        this.props.history.push("/budget/edit");
      }
    }
  };

  findSupportCategory = () => {
    let result = null;
    _.forEach(this.state.supportGroups, supportGroup => {
      _.forEach(supportGroup.supportCategories, supportCategory => {
        if (supportCategory.id === this.state.activeCategory) {
          result = supportCategory;
        }
      });
    });
    return result;
  };

  handleOpenSupports = (supportCategoryId, openAddSupports) => {
    this.setState(
      { activeCategory: supportCategoryId, openAddSupports: openAddSupports },
      () => {
        this.setState({ openSupports: true }, () => {
          this.setState({ openAddSupports: 0 });
        });
      }
    );
  };

  handleCloseSupports = () => {
    this.setState({ openSupports: false });
  };

  handleSetPlanItems = planItems => {
    this.setState({
      planCategories: {
        ...this.state.planCategories,
        [this.state.activeCategory]: {
          ...this.state.planCategories[this.state.activeCategory],
          planItems: planItems
        }
      }
    });
    if (this.props.currentUser) {
      // todo: call backend to save changes
    }
  };

  calculateCoreAllocated = () => {
    let allocated = 0;
    let core = this.state.supportGroups.find(obj => {
      return obj.name === "Core";
    });
    _.forEach(core.supportCategories, supportCategory => {
      const planCategory = this.state.planCategories[supportCategory.id];
      allocated += calculateAllocated(planCategory.planItems);
    });
    return allocated;
  };

  renderSummary = () => {
    let total = 0;
    let allocated = 0;
    _.map(this.state.planCategories, planCategory => {
      if (planCategory.budget !== 0) {
        total += parseFloat(planCategory.budget);

        allocated += calculateAllocated(planCategory.planItems);
      }
    });
    const available = total - allocated;
    return (
      <Card>
        <CardHeader title="Budget Summary" />
        <CardContent>
          <Grid container>
            <Grid item xs={12} sm={8} md={6} lg={4}>
              {total === 0 ? (
                <div>
                  No budgets allocated to any category! Please edit your plan.
                </div>
              ) : (
                <Doughnut
                  legend={{
                    // display:false,
                    position: "right",
                    onClick: () => {}
                  }}
                  data={{
                    labels: [
                      `Allocated: $${allocated}`,
                      `Available: $${available}`
                    ],
                    datasets: [
                      {
                        data: available >= 0 ? [allocated, available] : [1, 0],
                        backgroundColor:
                          available >= 0
                            ? [DARK_BLUE, LIGHT_BLUE]
                            : ["red", LIGHT_BLUE]
                      }
                    ]
                  }}
                  options={{
                    tooltips: { enabled: false }
                  }}
                />
              )}
            </Grid>
          </Grid>
        </CardContent>
        <CardActions disableSpacing>
          <Grid container justify="flex-end">
            <Grid item>
              <Button
                onClick={() => (window.location.href = "/budget/edit")}
                size="small"
              >
                <EditIcon />
                Edit Plan
              </Button>
              <Button
                onClick={() => printPage(this.state.planCategories)}
                size="small"
              >
                <PrintIcon />
                Print Plan
              </Button>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    );
  };

  renderPlanCategories = () => {
    return _.map(this.state.supportGroups, supportGroup => {
      if (supportGroup.id === 1) {
        let coreBudget = 0;

        _.forEach(supportGroup.supportCategories, supportCategory => {
          const planCategory = this.state.planCategories[supportCategory.id];
          coreBudget += parseFloat(planCategory.budget);
        });
        if (coreBudget > 0) {
          return (
            <BudgetCategorySection
              sectionName={supportGroup.name}
              key={supportGroup.id}
            >
              <Grid key={"1"} item xs={12} sm={6} md={4} lg={3}>
                <BudgetCategoryCard
                  {...{
                    category: "Core supports",
                    total: coreBudget,
                    allocated: this.calculateCoreAllocated(),
                    totalColor: LIGHT_BLUE,
                    allocatedColor: DARK_BLUE
                  }}
                  openSupports={openAddSupports =>
                    this.handleOpenSupports(3, openAddSupports)
                  }
                />
              </Grid>
            </BudgetCategorySection>
          );
        } else {
          return;
        }
      }

      let renderedPlanCategories = [];
      _.forEach(supportGroup.supportCategories, supportCategory => {
        const planCategory = this.state.planCategories[supportCategory.id];
        if (planCategory.budget > 0) {
          renderedPlanCategories.push(planCategory);
        }
      });
      if (renderedPlanCategories.length !== 0) {
        return (
          <BudgetCategorySection
            sectionName={supportGroup.name}
            key={supportGroup.id}
          >
            {_.map(supportGroup.supportCategories, supportCategory => {
              const planCategory = this.state.planCategories[
                supportCategory.id
              ];
              if (planCategory.budget > 0) {
                return (
                  <Grid
                    key={supportCategory.id}
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                  >
                    <BudgetCategoryCard
                      {...{
                        category: supportCategory.name,
                        total: parseFloat(planCategory.budget),
                        allocated: calculateAllocated(planCategory.planItems),
                        totalColor: LIGHT_BLUE,
                        allocatedColor: DARK_BLUE
                      }}
                      openSupports={openAddSupports =>
                        this.handleOpenSupports(
                          supportCategory.id,
                          openAddSupports
                        )
                      }
                    />
                  </Grid>
                );
              }
            })}
          </BudgetCategorySection>
        );
      }
    });
  };

  render() {
    const { planCategories, birthYear, postcode } = this.state;

    return (
      <div className="root">
        <Grid container justify="center">
          {this.state.planCategories !== {} && (
            <Grid item xs={12} md={11} xl={10}>
              {this.renderSummary()}
              {Object.keys(planCategories).length !== 0 &&
                this.renderPlanCategories()}
            </Grid>
          )}
        </Grid>
        {this.state.openSupports && (
          <SupportItemSelector
            open={this.state.openSupports}
            supportCategory={this.findSupportCategory()}
            birthYear={birthYear}
            postcode={postcode}
            onClose={this.handleCloseSupports}
            planCategory={this.state.planCategories[this.state.activeCategory]}
            setPlanItems={this.handleSetPlanItems}
            openAddSupports={this.state.openAddSupports}
            registrationGroups={this.state.registrationGroups}
          />
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(BudgetDashBoard);
