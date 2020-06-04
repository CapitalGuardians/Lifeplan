import React from "react";
import BudgetCategorySection from "./BudgetCategorySection";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import { Button, CardActions, CardContent } from "@material-ui/core";
import _ from "lodash";
import CardHeader from "@material-ui/core/CardHeader";
import BudgetCategoryCard from "../../DoughnutChart/BudgetCategoryCard";
import api from "../../api";
import SupportItemDialog from "./SupportItemDialog";
import { DARK_BLUE, LIGHT_BLUE } from "../../common/theme";
import connect from "react-redux/es/connect/connect";
import { LocalStorageKeys } from "../../common/constants";
import EditIcon from "@material-ui/icons/Edit";
import PrintIcon from "@material-ui/icons/Print";
import { differenceInMinutes } from "date-fns";
import DoughnutBody from "../../DoughnutChart/DoughnutBody";

const PLAN_CATEGORIES = "planCategories";
export const SUPPORTS_LIST = 0;
export const SUPPORTS_SELECTION = 1;
export const EDIT_SUPPORT = 2;
export const ADD_SUPPORT = 3;
export const REGISTRATION_GROUP_SELECTION = 4;

// function printPage(planCategories) {
//   let w = window.open();
//
//   let html = ReactDOMServer.renderToStaticMarkup(
//     <Table>
//       <TableHead>
//         <TableRow>
//           <TableCell>Name</TableCell>
//           <TableCell>Unit Price</TableCell>
//           <TableCell>Quantity</TableCell>
//           <TableCell>Frequency</TableCell>
//           <TableCell>Total</TableCell>
//         </TableRow>
//       </TableHead>
//       <TableBody>
//         {_.map(planCategories, planCategory => {
//           return _.map(planCategory.planItemGroups, planItemGroup => {
//             let frequency = "Yearly";
//             if (planItemGroup.frequencyPerYear === 365) {
//               frequency = "Daily";
//             } else if (planItem.frequencyPerYear === 52) {
//               frequency = "Weekly";
//             } else if (planItem.frequencyPerYear === 12) {
//               frequency = "Monthly";
//             }
//             const total =
//               planItem.priceActual *
//               planItem.quantity *
//               planItem.frequencyPerYear;
//             return (
//               <TableRow key={planItem.id}>
//                 <TableCell>{planItem.name}</TableCell>
//                 <TableCell>${planItem.priceActual}</TableCell>
//                 <TableCell>{planItem.quantity}</TableCell>
//                 <TableCell>{frequency}</TableCell>
//                 <TableCell>${total}</TableCell>
//               </TableRow>
//             );
//           });
//         })}
//       </TableBody>
//     </Table>
//   );
//
//   w.document.write(html);
//   w.window.print();
//   w.document.close();
// }

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser
  };
}

export function calculateTotalCost(planItemGroup) {
  let allocated = 0;
  _.forEach(planItemGroup.planItems, planItem => {
    const amount = planItem.allDay
      ? Math.round(planItem.priceActual * 100) / 100
      : Math.round(
          ((planItem.priceActual *
            differenceInMinutes(
              new Date(planItem.endDate),
              new Date(planItem.startDate)
            )) /
            60) *
            100
        ) / 100;

    allocated += amount;
  });
  return Math.round(allocated * 100) / 100;
}

export function calculateAllocated(planItemGroups) {
  let allocated = 0;
  _.forEach(planItemGroups, planItemGroup => {
    allocated += calculateTotalCost(planItemGroup);
  });

  return Math.round(allocated * 100) / 100;
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
    registrationGroups: [],
    dialogPage: SUPPORTS_LIST
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
    // TODO: update for planItemGroups
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

  handleOpenSupports = supportCategoryId => {
    this.setState(
      { activeCategory: supportCategoryId, dialogPage: SUPPORTS_LIST },
      () => {
        this.setState({ openSupports: true });
      }
    );
  };

  handleAddSupports = supportCategoryId => {
    this.setState(
      {
        dialogPage: REGISTRATION_GROUP_SELECTION,
        activeCategory: supportCategoryId
      },
      () => {
        this.setState({ openSupports: true });
      }
    );
  };

  handleCloseSupports = () => {
    this.setState({ openSupports: false });
  };

  handleSetPlanItemGroups = planItemGroups => {
    this.setState({
      planCategories: {
        ...this.state.planCategories,
        [this.state.activeCategory]: {
          ...this.state.planCategories[this.state.activeCategory],
          planItemGroups: planItemGroups
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
      allocated += calculateAllocated(planCategory.planItemGroups);
    });
    return allocated.toFixed(2);
  };

  renderSummary = () => {
    let total = 0;
    let allocated = 0;
    _.map(this.state.planCategories, planCategory => {
      if (planCategory.budget !== 0) {
        total += parseFloat(planCategory.budget);

        allocated += calculateAllocated(planCategory.planItemGroups);
      }
    });
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
                <DoughnutBody allocated={allocated} total={total} />
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
              {/*<Button*/}
              {/*  onClick={() => printPage(this.state.planCategories)}*/}
              {/*  size="small"*/}
              {/*>*/}
              {/*  <PrintIcon />*/}
              {/*  Print Plan*/}
              {/*</Button>*/}
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
                  openSupports={() => this.handleOpenSupports(3)}
                  addSupports={() => this.handleAddSupports(3)}
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
                        allocated: calculateAllocated(
                          planCategory.planItemGroups
                        ),
                        totalColor: LIGHT_BLUE,
                        allocatedColor: DARK_BLUE
                      }}
                      openSupports={() =>
                        this.handleOpenSupports(supportCategory.id)
                      }
                      addSupports={() =>
                        this.handleAddSupports(supportCategory.id)
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
          <SupportItemDialog
            open={this.state.openSupports}
            supportCategory={this.findSupportCategory()}
            birthYear={birthYear}
            postcode={postcode}
            onClose={this.handleCloseSupports}
            planCategory={this.state.planCategories[this.state.activeCategory]}
            setPlanItemGroups={this.handleSetPlanItemGroups}
            openAddSupports={this.state.openAddSupports}
            registrationGroups={this.state.registrationGroups}
            page={this.state.dialogPage}
            setPage={page => this.setState({ dialogPage: page })}
          />
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(BudgetDashBoard);
