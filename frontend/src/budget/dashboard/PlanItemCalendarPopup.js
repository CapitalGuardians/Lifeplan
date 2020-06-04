import React from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography
} from "@material-ui/core";
import { format } from "date-fns";

export default function PlanItemCalendarPopup(props) {
  const { planItem } = props;
  console.log(planItem);
  // const startDateString = format(planItem.)
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{planItem.name}</Typography>
        <Typography variant="body2">Monday, May 11, 8:00-8:30am</Typography>
        <Typography variant="body2">${planItem.priceActual}</Typography>
      </CardContent>
      <CardActions>
        <Button>Edit</Button>
        <Button>Delete</Button>
        <Button>Close</Button>
      </CardActions>
    </Card>
  );
}

function renderDateString(planItem) {
  if (planItem.allDay === true) {
    // const dateStirng = format(planItem.startDate, "")
  }
}
