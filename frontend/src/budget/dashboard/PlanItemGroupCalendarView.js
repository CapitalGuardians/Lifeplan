import React, { useCallback, useState } from "react";
import PlanItemCalendarDialog from "./PlanItemCalendarDialog";
import {
  Button,
  Grid,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@material-ui/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  buttonContainer: {
    bottom: 0
  },
  root: {
    height: "100%"
  }
}));

const DELETE_PLAN_ITEM = 0;
const DELETE_PLAN_ITEM_GROUP = 1;

export default function PlanItemGroupCalendarView(props) {
  const { planItemGroup, onDeletePlanItem, onDeletePlanItemGroup } = props;
  const events = planItemGroupToEvents(planItemGroup);
  const [openPlanItemDialog, setOpenPlanItemDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteMode, setDeleteMode] = useState(-1);
  const [selectedPlanItem, setSelectedPlanItem] = useState(null);
  const classes = useStyles();

  function handleSelectEvent(info) {
    setSelectedPlanItem(info.event.extendedProps.planItem);
    setOpenPlanItemDialog(true);
  }

  const handleDelete = useCallback(() => {
    if (deleteMode === DELETE_PLAN_ITEM) {
      onDeletePlanItem(selectedPlanItem);
    } else {
      onDeletePlanItemGroup(planItemGroup);
    }
    handleCloseDialog();
  }, [deleteMode]);

  function handleCloseDialog() {
    setSelectedPlanItem(null);
    setDeleteMode(-1);
    setOpenPlanItemDialog(false);
    setOpenDeleteDialog(false);
  }

  function handleDeletePlanItem(planItem) {
    setDeleteMode(DELETE_PLAN_ITEM);
    setOpenDeleteDialog(true);
  }

  function handleDeletePlanItemGroup() {
    setDeleteMode(DELETE_PLAN_ITEM_GROUP);
    setOpenDeleteDialog(true);
  }

  return (
    <Grid container justify="center" className={classes.root}>
      <Grid container item xs={11} direction="column" justify="space-around">
        <Grid item>
          <FullCalendar
            defaultView="dayGridMonth"
            plugins={[dayGridPlugin]}
            fixedWeekCount={false}
            events={events}
            eventClick={handleSelectEvent}
            height="parent"
          />
        </Grid>
        <Grid
          container
          item
          justify="space-evenly"
          className={classes.buttonContainer}
        >
          <Button variant="contained">Edit All</Button>
          <Button variant="outlined" onClick={handleDeletePlanItemGroup}>
            Delete All
          </Button>
        </Grid>
      </Grid>
      {openPlanItemDialog === true && selectedPlanItem != null && (
        <PlanItemCalendarDialog
          open={openPlanItemDialog && selectedPlanItem != null}
          planItem={selectedPlanItem}
          onClose={handleCloseDialog}
          onDelete={handleDeletePlanItem}
        />
      )}
      {openDeleteDialog === true && deleteMode !== -1 && (
        <Dialog open={openDeleteDialog && deleteMode !== -1}>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this? It cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleDelete}>Delete</Button>
          </DialogActions>
        </Dialog>
      )}
    </Grid>
  );
}

function planItemGroupToEvents(planItemGroup) {
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
