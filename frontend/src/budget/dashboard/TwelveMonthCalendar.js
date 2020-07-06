import React from "react";
import PreviewCalendar from "./PreviewCalendar";
import { Grid } from "@material-ui/core";
import styles from "./TwelveMonthCalendar.module.css";
import { getMonth, setMonth, setYear } from "date-fns";
import { calculatePlanItemCost } from "./BudgetDashboard";

export default function TwelveMonthCalendar(props) {
  const { planCategories, showPreview, supportGroups } = props;
  const year = 2020;
  console.log(supportGroups);
  // each array in costs represents a month,
  // where month[0] is Core, month[1] is Capacity, month[2] is Capital

  // TODO: consider year
  const costs = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  console.log(planCategories);
  // populate array
  for (const [key, value] of Object.entries(planCategories)) {
    const intKey = parseInt(key);
    let supportGroupId = -1;
    for (const supportGroup of supportGroups) {
      for (const supportCategory of supportGroup.supportCategories) {
        if (supportCategory.id === intKey) {
          supportGroupId = supportGroup.id - 1;
          break;
        }
      }
      if (supportGroupId !== -1) {
        break;
      }
    }
    // support group found, now find month of events
    value.planItemGroups.forEach(planItemGroup => {
      planItemGroup.planItems.forEach(planItem => {
        const startDate = new Date(planItem.startDate);
        const month = getMonth(startDate);
        costs[month][supportGroupId] += calculatePlanItemCost(planItem);
      });
    });
  }
  console.log(costs);

  return (
    <Grid container className={styles.container} justify="flex-start">
      {renderCalendars(costs, year, showPreview)}
    </Grid>
  );
}

function renderCalendars(costs, year, showPreview) {
  const calendars = [];
  for (let i = 0; i < 12; i++) {
    const date = setYear(setMonth(new Date(), i), year);

    calendars.push(
      <Grid key={i} item xs={12} sm={4} md={3}>
        <PreviewCalendar
          showPreview={showPreview}
          startDate={date}
          costs={costs[i]}
        />
      </Grid>
    );
  }
  return calendars;
}
