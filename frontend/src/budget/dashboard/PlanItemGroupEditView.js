import React, { useState } from "react";
import PlanItemCalendarPopup from "./PlanItemCalendarPopup";
import { Grid } from "@material-ui/core";

export default function PlanItemEditor(props) {
  const { planItemGroup } = props;
  return (
    <Grid container>
      <Grid item>
        <PlanItemCalendarPopup planItem={planItemGroup.planItems[0]} />
      </Grid>
    </Grid>
  );
}
