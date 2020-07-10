import { Button, CardActions, CardContent, Dialog } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Grid from "@material-ui/core/Grid";
import EditIcon from "@material-ui/icons/Edit";
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
  PLAN_ITEM_EDIT_VIEW
} from "./SupportItemDialog";

import "react-calendar/dist/Calendar.css";
import TwelveMonthCalendar from "./TwelveMonthCalendar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import PlanItemCalendarDialog from "./PlanItemCalendarDialog";
import PlanItemDeleteDialog from "./PlanItemDeleteDialog";
import PlanItemEditView from "./PlanItemEditView";

const PLAN_CATEGORIES = "planCategories";

function mapStateToProps(state) {
  return {
    currentUser: state.auth.currentUser
  };
}
export function calculatePlanItemCost(planItem) {
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
  return amount;
}

export function calculateTotalCost(planItemGroup) {
  let allocated = 0;
  _.forEach(planItemGroup.planItems, planItem => {
    const amount = calculatePlanItemCost(planItem);

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

export function planItemGroupToEvents(planItemGroup) {
  const events = planItemGroup.planItems.map(planItem => {
    const { allDay, endDate, name, startDate } = planItem;
    return {
      allDay,
      start: new Date(startDate),
      end: new Date(endDate),
      title: name,
      planItem
    };
  });
  return events;
}

const PLAN_ITEM_DIALOG_PAGES = {
  preview: 0,
  delete: 1,
  edit: 2
};

class BudgetDashboard extends React.Component {
  state = {
    supportGroups: [],
    planCategories: {},
    openSupports: false,
    activeCategory: null,
    birthYear: 1990,
    postcode: 3000,
    planId: null,
    registrationGroups: [],
    dialogPage: PLAN_ITEM_GROUPS_VIEW,
    showTwelveMonthsCalendar: true,
    monthViewDate: setMonth(new Date(), 1),
    planItemDialogPage: -1,
    selectedPlanItem: null
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
      { activeCategory: supportCategoryId, dialogPage: PLAN_ITEM_GROUPS_VIEW },
      () => {
        this.setState({ openSupports: true });
      }
    );
  };

  handleAddSupports = supportCategoryId => {
    this.setState(
      {
        dialogPage: REGISTRATION_GROUPS_VIEW,
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

  handleEditPlanItemGroups = (planCategory, planItemGroups) => {
    if (this.props.currentUser) {
      // todo: call backend to save changes
    } else {
      this.setState(
        {
          planCategories: {
            ...this.state.planCategories,
            [planCategory]: {
              ...this.state.planCategories[planCategory],
              planItemGroups: planItemGroups
            }
          }
        },
        () => {
          this.setState({ selectedPlanItem: null, planItemDialogPage: -1 });
        }
      );
    }
  };

  handleDeletePlanItem = () => {
    const planItem = this.state.selectedPlanItem;
    let editedPlanItemGroups;
    let supportCategory;
    for (const [key, value] of Object.entries(this.state.planCategories)) {
      for (let i = 0; i < value.planItemGroups.length; i++) {
        if (value.planItemGroups[i].planItems.includes(planItem)) {
          const planItemGroup = value.planItemGroups[i];

          const editedPlanItemGroup = {
            ...planItemGroup,
            planItems: _.difference(planItemGroup.planItems, [planItem])
          };
          editedPlanItemGroups = _.difference(value.planItemGroups, [
            planItemGroup
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

  handleEditPlanItem = editedPlanItem => {
    const planItem = this.state.selectedPlanItem;
    let editedPlanItemGroups;
    let supportCategory;
    for (const [key, value] of Object.entries(this.state.planCategories)) {
      for (let i = 0; i < value.planItemGroups.length; i++) {
        if (value.planItemGroups[i].planItems.includes(planItem)) {
          const planItemGroup = value.planItemGroups[i];

          const editedPlanItemGroup = {
            ...planItemGroup,
            planItems: planItemGroup.planItems.map(pI => {
              if (pI === planItem) {
                return editedPlanItem;
              } else {
                return pI;
              }
            })
          };
          editedPlanItemGroups = _.difference(value.planItemGroups, [
            planItemGroup
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

  handleSetMonthView = date => {
    this.setState({ monthViewDate: date }, () =>
      this.setState({ showTwelveMonthsCalendar: false })
    );
  };

  handleCloseDialog = () => {
    this.setState({ planItemDialogPage: -1 });
  };

  handleSelectEvent = info => {
    this.setState({
      selectedPlanItem: info.event.extendedProps.planItem,
      planItemDialogPage: PLAN_ITEM_DIALOG_PAGES.preview
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
    let events = [];
    Object.values(this.state.planCategories).forEach(planCategories => {
      planCategories.planItemGroups.forEach(planItemGroup => {
        events = events.concat(planItemGroupToEvents(planItemGroup));
      });
    });
    _.map(this.state.planCategories, planCategory => {
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
                />
              </Dialog>
            )))}

        <Card>
          <CardHeader title="Budget Summary" />
          <CardContent>
            <Grid container>
              <Grid container item xs={12}>
                {total === 0 ? (
                  <div>
                    No budgets allocated to any category! Please edit your plan.
                  </div>
                ) : (
                  <Grid container item xs={12}>
                    <Grid item xs={12}>
                      {this.state.showTwelveMonthsCalendar === true ? (
                        <TwelveMonthCalendar
                          supportGroups={this.state.supportGroups}
                          planCategories={this.state.planCategories}
                          onClick={this.handleSetMonthView}
                        />
                      ) : (
                        <FullCalendar
                          plugins={[dayGridPlugin]}
                          defaultDate={this.state.monthViewDate}
                          fixedWeekCount={false}
                          height="parent"
                          events={this.events()}
                          eventClick={this.handleSelectEvent}
                        />
                      )}
                    </Grid>
                    <Grid item>
                      <DoughnutBody allocated={allocated} total={total} />
                    </Grid>
                  </Grid>
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
      </div>
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

  events = () => {
    const events = [];
    for (const planCategory of Object.values(this.state.planCategories)) {
      planCategory.planItemGroups.forEach(planItemGroup => {
        const toAdd = planItemGroupToEvents(planItemGroup);
        events.push(...toAdd);
      });
    }

    return events;
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
            onEditPlanItemGroups={this.handleEditPlanItemGroups}
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

export default connect(mapStateToProps)(BudgetDashboard);
