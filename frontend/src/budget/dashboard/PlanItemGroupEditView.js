import React, { useState } from "react";
import PlanItemCalendarPopup from "./PlanItemCalendarPopup";
import { Grid } from "@material-ui/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

function planItemGroupToEvents(planItemGroup) {
  console.log(planItemGroup);
  return planItemGroup;
}

export default function PlanItemEditor(props) {
  const { planItemGroup } = props;
  const events = planItemGroupToEvents(planItemGroup);
  return (
    <Grid container>
      <Grid item>
        <FullCalendar defaultView="dayGridMonth" plugins={[dayGridPlugin]} />
        <PlanItemCalendarPopup planItem={planItemGroup.planItems[0]} />
      </Grid>
    </Grid>
  );
}
