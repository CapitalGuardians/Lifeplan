import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@material-ui/core";
import { format } from "date-fns";

export default function PlanItemCalendarDialog(props) {
  const { planItem, onClose, open, onDelete, onEdit } = props;
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{planItem.name}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Date: {renderDateString(planItem)}
          <br />
          Cost: $
          {planItem.priceActual.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onEdit}>Edit</Button>
        <Button onClick={() => onDelete(planItem)}>Delete</Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function renderDateString(planItem) {
  const startDate = new Date(planItem.startDate);
  const timeString =
    planItem.allDay === true
      ? "All Day"
      : `${format(startDate, "p")}-${format(new Date(planItem.endDate), "p")}`;
  const dateString = format(startDate, "PPPP");
  return `${timeString}, ${dateString}`;
}
