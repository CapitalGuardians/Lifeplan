import React, { useCallback, useState } from "react";
import PlanItemCalendarDialog from "./PlanItemCalendarDialog";
import { Button, Grid, DialogContent, DialogActions } from "@material-ui/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { makeStyles } from "@material-ui/core/styles";
import { PLAN_ITEM_GROUP_EDIT_ALL } from "./SupportItemDialog";
import { planItemGroupToEvents } from "./BudgetDashboard";
import PlanItemDeleteDialog from "./PlanItemDeleteDialog";

const useStyles = makeStyles(theme => ({
  buttonContainer: {
    bottom: 0
  },
  root: {
    height: "100%"
  }
}));

const DELETE_ALL = true;

export default function PlanItemGroupCalendarView(props) {
  const {
    planItemGroup,
    onDeletePlanItem,
    onDeletePlanItemGroup,
    onEditPlanItem
  } = props;
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
    if (deleteMode !== DELETE_ALL && planItemGroup.planItems.length > 1) {
      onDeletePlanItem(selectedPlanItem);
    } else {
      onDeletePlanItemGroup(planItemGroup);
    }
    handleCloseDialog();
  }, [
    deleteMode,
    planItemGroup,
    selectedPlanItem,
    onDeletePlanItem,
    onDeletePlanItemGroup
  ]);

  const handleEditAll = useCallback(() => {
    onEditPlanItem({
      editAll: PLAN_ITEM_GROUP_EDIT_ALL,
      planItem: planItemGroup.planItems[0]
    });
  }, [planItemGroup, onEditPlanItem]);

  const handleEdit = useCallback(() => {
    onEditPlanItem({
      editAll: !PLAN_ITEM_GROUP_EDIT_ALL,
      planItem: selectedPlanItem
    });
  }, [selectedPlanItem, onEditPlanItem]);

  function handleCloseDialog() {
    setSelectedPlanItem(null);
    setDeleteMode(-1);
    setOpenPlanItemDialog(false);
    setOpenDeleteDialog(false);
  }

  function handleDeletePlanItem(planItem) {
    setDeleteMode(!DELETE_ALL);
    setOpenDeleteDialog(true);
  }

  function handleDeletePlanItemGroup() {
    setDeleteMode(DELETE_ALL);
    setOpenDeleteDialog(true);
  }

  return (
    <>
      <DialogContent>
        <Grid container justify="center" className={classes.root}>
          <Grid
            container
            item
            xs={11}
            direction="column"
            justify="space-around"
          >
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
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleDeletePlanItemGroup}>Delete All</Button>
        <Button onClick={handleEditAll}>Edit All</Button>
        <Button onClick={props.back}>Back</Button>
      </DialogActions>
      {openPlanItemDialog === true && selectedPlanItem != null && (
        <PlanItemCalendarDialog
          open={openPlanItemDialog && selectedPlanItem != null}
          planItem={selectedPlanItem}
          onClose={handleCloseDialog}
          onDelete={handleDeletePlanItem}
          onEdit={handleEdit}
        />
      )}
      {openDeleteDialog === true && deleteMode !== -1 && (
        <PlanItemDeleteDialog
          open={openDeleteDialog === true && deleteMode !== -1}
          onClose={handleCloseDialog}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
