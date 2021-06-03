import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import CloseIcon from "@material-ui/icons/Close";
import { differenceInMinutes, setMonth } from "date-fns";
import _ from "lodash";
import React from "react";
import connect from "react-redux/es/connect/connect";
import api from "../../api";
import { LocalStorageKeys } from "../../common/constants";
import { DARK_BLUE, LIGHT_BLUE } from "../../common/theme";
import BudgetCategoryCard from "../../DoughnutChart/BudgetCategoryCard";
import DoughnutBody from "../../DoughnutChart/DoughnutBody";
import BudgetCategorySection from "./BudgetCategorySection";
import SupportItemDialog from "./SupportItemDialog";
import {
  PLAN_ITEM_GROUPS_VIEW,
  REGISTRATION_GROUPS_VIEW,
} from "./SupportItemDialog";

import "react-calendar/dist/Calendar.css";
import TwelveMonthCalendar from "./TwelveMonthCalendar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import PlanItemCalendarDialog from "./PlanItemCalendarDialog";
import PlanItemDeleteDialog from "./PlanItemDeleteDialog";
import PlanItemEditView from "./PlanItemEditView";
import styles from "./BudgetDashboard.module.css";
import moment from "moment";

const PLAN_CATEGORIES = "planCategories";

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser,
  };
}
export function calculatePlanItemCost(planItem) {
  const amount =
    planItem.allDay !== null
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
  return amount;
}

export function calculateTotalCost(planItemGroup) {
  let allocated = 0;
  _.forEach(planItemGroup.planItems, (planItem) => {
    const amount = calculatePlanItemCost(planItem);

    allocated += amount;
  });
  return Math.round(allocated * 100) / 100;
}

export function calculateAllocated(planItemGroups) {
  let allocated = 0;
  _.forEach(planItemGroups, (planItemGroup) => {
    allocated += calculateTotalCost(planItemGroup);
  });

  return Math.round(allocated * 100) / 100;
}

export function planItemGroupToEvents(planItemGroup) {
  const events =
    planItemGroup.planItems &&
    planItemGroup.planItems.map((planItem) => {
      const { allDay, endDate, name, startDate } = planItem;
      return {
        allDay,
        start: new Date(startDate),
        end: new Date(endDate),
        title: name,
        planItem,
      };
    });
  return events === undefined ? [] : events;
}

const PLAN_ITEM_DIALOG_PAGES = {
  preview: 0,
  delete: 1,
  edit: 2,
};

function dateToString(date) {
  return moment(date).format("YYYY-MM-DD");
}

class BudgetDashboard extends React.Component {
  state = {
    supportGroups: [],
    planCategories: {},
    planDates: {},
    planName: null,
    planItemGroups: {},
    planItems: {},
    openSupports: false,
    activeCategory: null,
    birthYear: 1990,
    postcode: 3000,
    planId: null,
    planExpandId: null,
    registrationGroups: [],
    dialogPage: PLAN_ITEM_GROUPS_VIEW,
    showMonthView: false,
    monthViewDate: setMonth(new Date(), 1),
    planItemDialogPage: -1,
    selectedPlanItem: null,
    flag: false,
    planItemDates: [],
  };

  async componentDidMount() {
    // call backend to load all plan groups and corresponding categories
    api.SupportGroups.all()
      .then((response) => {
        this.setState({ supportGroups: [...response.data] }, this.loadState);
      })
      .catch((error) => {
        console.log(error);
      });
    api.RegistrationGroups.list().then((response) => {
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
    let planDates = {};
    let planName = null;
    // let planItemGroups = {};
    // let planItems = {};
    let birthYear = null;
    let postcode = null;
    let flag = false;
    let planItemDates = [];

    // TODO: update for planItemGroups
    if (localStorage.getItem(LocalStorageKeys.ACCESS) != null) {
      await api.Participants.currentUser().then((response) => {
        birthYear = response.data.birthYear;
        postcode = response.data.postcode;
      });
      await api.Plans.list().then(async (response) => {
        if (response.data.length === 0) {
          window.location.href = "/budget/edit";
        } else {
          const plans = response.data;
          if (this.props.location.state === undefined) {
            // for (var i = 0; i < 1; i++) {
            var i = 0;
            this.state.planId = plans[i].id;
            for (var ind = 0; ind < plans.length; ind++) {
              planDates[plans[ind].id] = {
                startDate: plans[ind].startDate,
                endDate: plans[ind].endDate,
              };
            }
            planName = plans[i].name;
            localStorage.setItem("startDate", plans[i].startDate);
            localStorage.setItem("endDate", plans[i].endDate);

            _.map(plans[i].planCategories, async (planCategory) => {
              api.PlanItemGroups.list(planCategory.plan, planCategory.id).then(
                (responsePlanItemGroup) => {
                  let planItemGroups = [];
                  // let indexPlanItemGroup = 0;
                  if (responsePlanItemGroup.data.length !== 0) {
                    planItemGroups = responsePlanItemGroup.data.map(
                      (planItemGroup, index) => {
                        if (planCategory.id === planItemGroup.planCategory) {
                          api.PlanItems.list(
                            planCategory.plan,
                            planCategory.id,
                            planItemGroup.id
                          ).then((responsePlanItem) => {
                            let planItems = [];
                            // let indexPlanItem = 0;
                            if (responsePlanItem.data.length !== 0) {
                              planItems = responsePlanItem.data.map(
                                (planItem, index) => {
                                  if (
                                    planItemGroup.id === planItem.planItemGroup
                                  ) {
                                    planItemDates.push(planItem.startDate);
                                    planItems[index] = {
                                      ...planItem,
                                    };
                                    // index2++;
                                    return {
                                      ...planItem,
                                    };
                                  }
                                  return {};
                                }
                              );
                              planItemGroups[index] = {
                                ...planItemGroup,
                                planItems: planItems || [],
                              };
                              // index++;
                            }
                          });
                          return {
                            ...planItemGroup,
                          };
                        }
                        return {};
                      }
                    );
                    // if (plans[i].id === planCategory.plan) {
                    planCategories[planCategory.supportCategory] = {
                      ...planCategory,
                      planItemGroups: planItemGroups || [],
                    };
                    // }
                  }
                }
              );
              planCategories[planCategory.supportCategory] = {
                ...planCategory,
                planItemGroups: [],
              };
            });
            // }
          } else {
            await Promise.all(
              _.map(plans, async (plan) => {
                this.state.planId = plan.id;
                planDates[plan.id] = {
                  startDate: plan.startDate,
                  endDate: plan.endDate,
                };
                if (this.props.location.state === plan.id) {
                  planName = plan.name;
                  _.map(plan.planCategories, async (planCategory) => {
                    api.PlanItemGroups.list(
                      planCategory.plan,
                      planCategory.id
                    ).then((responsePlanItemGroup) => {
                      let planItemGroups = [];
                      // let indexPlanItemGroup = 0;
                      if (responsePlanItemGroup.data.length !== 0) {
                        planItemGroups = responsePlanItemGroup.data.map(
                          (planItemGroup, index) => {
                            if (
                              planCategory.id === planItemGroup.planCategory
                            ) {
                              api.PlanItems.list(
                                planCategory.plan,
                                planCategory.id,
                                planItemGroup.id
                              ).then((responsePlanItem) => {
                                let planItems = [];
                                // let indexPlanItem = 0;
                                if (responsePlanItem.data.length !== 0) {
                                  planItems = responsePlanItem.data.map(
                                    (planItem, index) => {
                                      if (
                                        planItemGroup.id ===
                                        planItem.planItemGroup
                                      ) {
                                        planItemDates.push(planItem.startDate);
                                        planItems[index] = {
                                          ...planItem,
                                        };
                                        // index2++;
                                        return {
                                          ...planItem,
                                        };
                                      }
                                      return {};
                                    }
                                  );
                                  planItemGroups[index] = {
                                    ...planItemGroup,
                                    planItems: planItems || [],
                                  };
                                  // index++;
                                }
                              });
                              return {
                                ...planItemGroup,
                              };
                            }
                            return {};
                          }
                        );
                        if (plan.id === planCategory.plan) {
                          planCategories[planCategory.supportCategory] = {
                            ...planCategory,
                            planItemGroups: planItemGroups || [],
                          };
                        }
                      }
                    });
                    planCategories[planCategory.supportCategory] = {
                      ...planCategory,
                      planItemGroups: [],
                    };
                  });
                }
              })
            );
          }
        }
      });
      flag = true;
      this.setState({
        planDates,
        planName,
        planCategories,
        birthYear,
        postcode,
        flag,
        planItemDates,
      });
    } else {
      let cachedPlanCategories = localStorage.getItem(PLAN_CATEGORIES);
      const cachedName = localStorage.getItem("name");
      const cachedBirthYear = localStorage.getItem("birthYear");
      const cachedPostcode = localStorage.getItem("postcode");
      const cachedStartDate = localStorage.getItem("startDate");
      const cachedEndDate = localStorage.getItem("endDate");
      if (
        cachedPostcode != null &&
        cachedBirthYear != null &&
        cachedStartDate != null &&
        cachedEndDate != null &&
        cachedPlanCategories != null
      ) {
        planCategories = JSON.parse(cachedPlanCategories);
        birthYear = parseInt(cachedBirthYear);
        postcode = parseInt(cachedPostcode);
        planDates[0] = {
          startDate: dateToString(cachedStartDate),
          endDate: dateToString(cachedEndDate),
        };
        planName = cachedName;
        flag = true;
        this.setState({
          planCategories,
          birthYear,
          postcode,
          planDates,
          planName,
          flag,
        });
      } else {
        this.props.history.push("/budget/edit");
      }
    }
    this.updateState();
  };

  updateState() {
    setInterval(() => {
      this.setState({ planCategories: this.state.planCategories });
    }, 2000);
  }

  findSupportCategory = () => {
    let result = null;
    _.forEach(this.state.supportGroups, (supportGroup) => {
      _.forEach(supportGroup.supportCategories, (supportCategory) => {
        if (supportCategory.id === this.state.activeCategory) {
          result = supportCategory;
        }
      });
    });
    return result;
  };

  editPlanPage = async (planId) => {
    let planExpandId = planId;
    await this.setState({ planExpandId: planId });
    this.props.history.push({
      pathname: "/budget/edit",
      state: planExpandId, // your data array of objects
    });
  };

  handleOpenSupports = (supportCategoryId) => {
    this.setState(
      { activeCategory: supportCategoryId, dialogPage: PLAN_ITEM_GROUPS_VIEW },
      () => {
        this.setState({ openSupports: true });
      }
    );
  };

  handleAddSupports = (supportCategoryId) => {
    this.setState(
      {
        dialogPage: REGISTRATION_GROUPS_VIEW,
        activeCategory: supportCategoryId,
      },
      () => {
        this.setState({ openSupports: true });
      }
    );
  };

  handleCloseSupports = () => {
    this.setState({ openSupports: false });
  };

  handleEditPlanItemGroups = (planCategory, planItemGroups) => {
    this.setState(
      {
        planCategories: {
          ...this.state.planCategories,
          [planCategory]: {
            ...this.state.planCategories[planCategory],
            planItemGroups: planItemGroups,
          },
        },
      },
      () => {
        this.setState({ selectedPlanItem: null, planItemDialogPage: -1 });
      }
    );
    if (planItemGroups.length !== 0 || planItemGroups.length !== undefined) {
      for (let i = 0; i < planItemGroups.length; i++) {
        if (
          planItemGroups[i].planCategory !== undefined &&
          planItemGroups[i].id !== undefined
        ) {
          let planId = 0;
          let planCategoryId = planItemGroups[i].planCategory;
          let planItemGroupId = planItemGroups[i].id;
          // const data = {
          //   name: planItemGroups[i].name,
          // };
          // api.PlanItemGroups.update(planId, planCategoryId, planItemGroupId, data).then((response) => {
          // let planItemGroupId = response.data.id;
          if (planItemGroups[i].planItems !== undefined) {
            if (
              planItemGroups[i].planItems.length !== 0 ||
              planItemGroups[i].planItems.length !== undefined
            ) {
              for (let j = 0; j < planItemGroups[i].planItems.length; j++) {
                let planItemId = planItemGroups[i].planItems[j].id;
                const planItemData = {
                  name: planItemGroups[i].planItems[j].name,
                  priceActual: planItemGroups[i].planItems[j].priceActual,
                  startDate: dateToString(
                    planItemGroups[i].planItems[j].startDate
                  ),
                  endDate: dateToString(planItemGroups[i].planItems[j].endDate),
                  allDay: planItemGroups[i].planItems[j].allDay,
                };

                api.PlanItems.update(
                  planId,
                  planCategoryId,
                  planItemGroupId,
                  planItemId,
                  planItemData
                ).then((response) => {
                  // onEditPlanItemGroups([planItemGroup, ...planItemGroups]);
                });
              }
            }
          }
          // });
        }
      }
    }
  };

  handleDeletePlanItem = () => {
    const planItem = this.state.selectedPlanItem;
    let planCategory = 0;
    let editedPlanItemGroups;
    let supportCategory;
    for (const [key, value] of Object.entries(this.state.planCategories)) {
      for (let i = 0; i < value.planItemGroups.length; i++) {
        if (value.planItemGroups[i].planItems.includes(planItem)) {
          const planItemGroup = value.planItemGroups[i];
          if (planItemGroup.id === planItem.planItemGroup) {
            planCategory = planItemGroup.planCategory;
          }
          const editedPlanItemGroup = {
            ...planItemGroup,
            planItems: _.difference(planItemGroup.planItems, [planItem]),
          };
          editedPlanItemGroups = _.difference(value.planItemGroups, [
            planItemGroup,
          ]);
          editedPlanItemGroups.push(editedPlanItemGroup);
          supportCategory = key;

          break;
        }
      }
      if (supportCategory != null) {
        break;
      }
    }

    api.PlanItems.delete(
      0,
      planCategory,
      planItem.planItemGroup,
      planItem.id
    ).then((response) => {
      console.log(response);
    });

    this.handleEditPlanItemGroups(supportCategory, editedPlanItemGroups);
  };

  handleEditPlanItem = (editedPlanItem) => {
    const planItem = this.state.selectedPlanItem;
    let editedPlanItemGroups;
    let supportCategory;
    for (const [key, value] of Object.entries(this.state.planCategories)) {
      for (let i = 0; i < value.planItemGroups.length; i++) {
        if (value.planItemGroups[i].planItems.includes(planItem)) {
          const planItemGroup = value.planItemGroups[i];

          const editedPlanItemGroup = {
            ...planItemGroup,
            planItems: planItemGroup.planItems.map((pI) => {
              if (pI === planItem) {
                return editedPlanItem;
              } else {
                return pI;
              }
            }),
          };
          editedPlanItemGroups = _.difference(value.planItemGroups, [
            planItemGroup,
          ]);
          editedPlanItemGroups.push(editedPlanItemGroup);
          supportCategory = key;

          break;
        }
      }
      if (supportCategory != null) {
        break;
      }
    }

    this.handleEditPlanItemGroups(supportCategory, editedPlanItemGroups);
  };

  handleSetMonthView = (date) => {
    this.setState({ monthViewDate: date }, () =>
      this.setState({ showMonthView: true })
    );
  };

  handleCloseDialog = () => {
    this.setState({ planItemDialogPage: -1 });
  };

  handleSelectEvent = (info) => {
    this.setState({
      selectedPlanItem: info.event.extendedProps.planItem,
      planItemDialogPage: PLAN_ITEM_DIALOG_PAGES.preview,
    });
  };

  handleClickDelete = () => {
    this.setState({ planItemDialogPage: PLAN_ITEM_DIALOG_PAGES.delete });
  };

  handleClickEdit = () => {
    this.setState({ planItemDialogPage: PLAN_ITEM_DIALOG_PAGES.edit });
  };

  calculateCoreAllocated = () => {
    let allocated = 0;
    let core = this.state.supportGroups.find((obj) => {
      return obj.name === "Core";
    });
    _.forEach(core.supportCategories, (supportCategory) => {
      const planCategory = this.state.planCategories[supportCategory.id];
      allocated += calculateAllocated(planCategory.planItemGroups);
    });
    return allocated.toFixed(2);
  };

  renderSummary = () => {
    let total = 0;
    let allocated = 0;
    let events = [];
    Object.values(this.state.planCategories).forEach((planCategories) => {
      planCategories.planItemGroups.forEach((planItemGroup) => {
        events = events.concat(planItemGroupToEvents(planItemGroup));
      });
    });
    _.map(this.state.planCategories, (planCategory) => {
      if (planCategory.budget !== 0) {
        total += parseFloat(planCategory.budget);

        allocated += calculateAllocated(planCategory.planItemGroups);
      }
    });
    return (
      <div>
        {this.state.selectedPlanItem != null &&
          ((this.state.planItemDialogPage ===
            PLAN_ITEM_DIALOG_PAGES.preview && (
            <PlanItemCalendarDialog
              open={
                this.state.planItemDialogPage ===
                  PLAN_ITEM_DIALOG_PAGES.preview &&
                this.state.selectedPlanItem != null
              }
              planItem={this.state.selectedPlanItem}
              onClose={this.handleCloseDialog}
              onDelete={this.handleClickDelete}
              onEdit={this.handleClickEdit}
            />
          )) ||
            (this.state.planItemDialogPage ===
              PLAN_ITEM_DIALOG_PAGES.delete && (
              <PlanItemDeleteDialog
                open={
                  this.state.planItemDialogPage ===
                    PLAN_ITEM_DIALOG_PAGES.delete &&
                  this.state.selectedPlanItem != null
                }
                onClose={this.handleCloseDialog}
                onDelete={this.handleDeletePlanItem}
              />
            )) ||
            (this.state.planItemDialogPage === PLAN_ITEM_DIALOG_PAGES.edit && (
              <Dialog
                open={
                  this.state.planItemDialogPage ===
                    PLAN_ITEM_DIALOG_PAGES.edit &&
                  this.state.selectedPlanItem != null
                }
              >
                <PlanItemEditView
                  planItem={this.state.selectedPlanItem}
                  onSave={this.handleEditPlanItem}
                  back={this.handleCloseDialog}
                />
              </Dialog>
            )))}
        {this.state.showMonthView === true && (
          <Dialog
            open={this.state.showMonthView === true}
            onClose={() => this.setState({ showMonthView: false })}
          >
            <DialogTitle classes={{ root: styles.dialogTitle }}>
              <IconButton
                aria-label="close"
                className={styles.closeButton}
                onClick={() => this.setState({ showMonthView: false })}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <FullCalendar
                plugins={[dayGridPlugin]}
                defaultDate={this.state.monthViewDate}
                fixedWeekCount={false}
                height="parent"
                events={this.events()}
                eventClick={this.handleSelectEvent}
              />
            </DialogContent>
          </Dialog>
        )}

        <Card>
          <CardHeader title={this.state.planName + ": Budget Summary"} />
          <CardContent>
            <Grid container justify="center">
              <Grid item>
                {total === 0 ? (
                  <div>
                    No budgets allocated to any category! Please edit your plan.
                  </div>
                ) : (
                  <Grid item>
                    <DoughnutBody
                      allocated={parseFloat(allocated.toFixed(2))}
                      total={total}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </CardContent>
          <CardActions disableSpacing>
            <Grid container justify="flex-end">
              <Grid item>
                <Button
                  onClick={(e) =>
                    this.props.location.state === undefined
                      ? this.editPlanPage(this.state.planId)
                      : this.editPlanPage(this.props.location.state)
                  }
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
      </div>
    );
  };

  renderPlanCategories = () => {
    return _.map(this.state.supportGroups, (supportGroup) => {
      // if (supportGroup.id === 1) {
      //   let coreBudget = 0;

      //   _.forEach(supportGroup.supportCategories, (supportCategory) => {
      //     const planCategory = this.state.planCategories[supportCategory.id];
      //     if (planCategory != null) {
      //       coreBudget += parseFloat(planCategory.budget);
      //     }
      //   });
      //   if (coreBudget > 0) {
      //     return (
      //       <BudgetCategorySection
      //         sectionName={supportGroup.name}
      //         key={supportGroup.id}
      //       >
      //         <Grid key={"1"} item xs={12} sm={6} md={4} lg={3}>
      //           <BudgetCategoryCard
      //             {...{
      //               category: "Core supports",
      //               total: coreBudget,
      //               allocated: this.calculateCoreAllocated(),
      //               totalColor: LIGHT_BLUE,
      //               allocatedColor: DARK_BLUE,
      //             }}
      //             openSupports={() => this.handleOpenSupports(3)}
      //             addSupports={() => this.handleAddSupports(3)}
      //           />
      //         </Grid>
      //       </BudgetCategorySection>
      //     );
      //   } else {
      //     return;
      //   }
      // }

      let renderedPlanCategories = [];
      _.forEach(supportGroup.supportCategories, (supportCategory) => {
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
            {_.map(supportGroup.supportCategories, (supportCategory) => {
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
                        allocatedColor: DARK_BLUE,
                      }}
                      openSupports={() =>
                        this.handleOpenSupports(supportCategory.id)
                      }
                      // addSupports={() =>
                      //   this.handleAddSupports(supportCategory.id)
                      // }
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

  events = () => {
    const events = [];
    for (const planCategory of Object.values(this.state.planCategories)) {
      planCategory.planItemGroups.forEach((planItemGroup) => {
        const toAdd = planItemGroupToEvents(planItemGroup);
        events.push(...toAdd);
      });
    }

    return events;
  };

  render() {
    const {
      planDates,
      planCategories,
      supportGroups,
      birthYear,
      postcode,
      flag,
      planItemDates,
    } = this.state;
    return (
      <div className="root">
        {flag ? (
          <Grid container justify="center">
            <Grid container justify="center">
              {this.state.planCategories !== {} && (
                <Grid item xs={12} md={11} xl={10}>
                  {this.renderSummary()}

                  {Object.keys(planCategories).length !== 0 &&
                    this.renderPlanCategories()}

                  <TwelveMonthCalendar
                    supportGroups={supportGroups}
                    planCategories={planCategories}
                    planDates={planDates}
                    planItemDates={planItemDates}
                    onClick={this.handleSetMonthView}
                  />
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
                planCategory={
                  this.state.planCategories[this.state.activeCategory]
                }
                onEditPlanItemGroups={this.handleEditPlanItemGroups}
                openAddSupports={this.state.openAddSupports}
                registrationGroups={this.state.registrationGroups}
                page={this.state.dialogPage}
                setPage={(page) => this.setState({ dialogPage: page })}
                addSupports={() =>
                  this.handleAddSupports(this.state.activeCategory)
                }
              />
            )}
          </Grid>
        ) : (
          <></>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps)(BudgetDashboard);
