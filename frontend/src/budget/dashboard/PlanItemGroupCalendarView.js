import React, { useCallback, useState, useEffect, useRef } from "react";
import PlanItemCalendarDialog from "./PlanItemCalendarDialog";
import {
  Button,
  Grid,
  DialogContent,
  DialogActions,
  Input,
  InputAdornment,
  InputLabel,
  TextField,
  Typography,
} from "@material-ui/core";
import CustomTimePicker from "./CustomTimePicker";
import { addHours, endOfDay, getHours, getMinutes, startOfDay } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
// import { makeStyles } from "@material-ui/core/styles";
import { PLAN_ITEM_GROUP_EDIT_ALL } from "./SupportItemDialog";
import { planItemGroupToEvents } from "./BudgetDashboard";
import PlanItemDeleteDialog from "./PlanItemDeleteDialog";

// const useStyles = makeStyles((theme) => ({
//   buttonContainer: {
//     bottom: 0,
//   },
//   root: {
//     height: "100%",
//   },
// }));

const DELETE_ALL = true;

export default function PlanItemGroupCalendarView(props) {
  const { planItem, onSave } = props;
  const [editedPlanItem, setEditedPlanItem] = useState({
    ...planItem,
    startDate: new Date(planItem.startDate),
    endDate: new Date(planItem.endDate),
  });
  const dateRef = useRef({
    startDate: new Date(editedPlanItem.startDate),
    endDate: new Date(editedPlanItem.endDate),
  });

  const {
    planItemGroup,
    onDeletePlanItem,
    onDeletePlanItemGroup,
    onEditPlanItem,
  } = props;
  const events = planItemGroupToEvents(planItemGroup);
  const [openPlanItemDialog, setOpenPlanItemDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteMode, setDeleteMode] = useState(-1);
  const [selectedPlanItem, setSelectedPlanItem] = useState(null);
  // const classes = useStyles();

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
    onDeletePlanItemGroup,
  ]);

  // const handleEditAll = useCallback(() => {
  //   onEditPlanItem({
  //     editAll: PLAN_ITEM_GROUP_EDIT_ALL,
  //     planItem: planItemGroup.planItems[0],
  //   });
  // }, [planItemGroup, onEditPlanItem]);

  const handleEdit = useCallback(() => {
    onEditPlanItem({
      editAll: !PLAN_ITEM_GROUP_EDIT_ALL,
      planItem: selectedPlanItem,
    });
  }, [selectedPlanItem, onEditPlanItem]);

  const getDifferenceInHours = (end, start) => {
    const result =
      end.getHours() +
      end.getMinutes() / 60 -
      (start.getHours() + start.getMinutes() / 60);

    return result < 0 ? 0 : result;
  };

  const getActualPrice = () => {
    let result = 0;
    if (
      getDifferenceInHours(editedPlanItem.endDate, editedPlanItem.startDate) !==
      1
    ) {
      result =
        editedPlanItem.priceActual *
        getDifferenceInHours(editedPlanItem.endDate, editedPlanItem.startDate);
    }

    return result === 0 ? editedPlanItem.priceActual : result;
  };

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

  function handleChange(event) {
    setEditedPlanItem({
      ...editedPlanItem,
      [event.target.name]: event.target.value,
    });
  }

  function handleSave() {
    onSave({
      ...editedPlanItem,
      priceActual: parseFloat(
        editedPlanItem.priceActual *
          (getDifferenceInHours(
            editedPlanItem.endDate,
            editedPlanItem.startDate
          ) === 0
            ? 1
            : getDifferenceInHours(
                editedPlanItem.endDate,
                editedPlanItem.startDate
              ))
      ),
    });
    props.back();
  }

  useEffect(() => {
    if (editedPlanItem.startDate > editedPlanItem.endDate) {
      if (dateRef.current.endDate !== editedPlanItem.endDate) {
        const newStartDate =
          getHours(editedPlanItem.endDate) === 0
            ? startOfDay(editedPlanItem.startDate)
            : addHours(editedPlanItem.endDate, -1);
        dateRef.current = {
          startDate: newStartDate,
          endDate: editedPlanItem.endDate,
        };
        setEditedPlanItem({ ...editedPlanItem, startDate: newStartDate });
      } else {
        const newEndDate =
          getHours(editedPlanItem.startDate) === 23
            ? endOfDay(editedPlanItem.startDate)
            : addHours(editedPlanItem.startDate, 1);
        dateRef.current = {
          startDate: editedPlanItem.startDate,
          endDate: newEndDate,
        };

        setEditedPlanItem({ ...editedPlanItem, endDate: newEndDate });
      }
    } else {
      dateRef.current = {
        startDate: editedPlanItem.startDate,
        endDate: editedPlanItem.endDate,
      };
    }
  }, [editedPlanItem]);

  function handleChangeStart(startDate) {
    setEditedPlanItem({ ...editedPlanItem, startDate });
  }

  function handleChangeEnd(endDate) {
    setEditedPlanItem({ ...editedPlanItem, endDate });
  }

  return (
    <>
      <DialogContent>
        <Grid container justify="flex-start" spacing={1}>
          <Grid item md={5}>
            <Grid item>
              <Typography>
                What would you like to call this support Item?
              </Typography>
              <TextField
                id="plan-item-name"
                label="Support Item Name"
                value={editedPlanItem.name}
                name={"name"}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            {editedPlanItem.allDay !== true && (
              <Grid container item spacing={2}>
                <Grid item xs={12}>
                  <Typography>When do you use it?</Typography>
                </Grid>

                <Grid item>
                  <InputLabel>From</InputLabel>
                  <CustomTimePicker
                    value={editedPlanItem.startDate}
                    onChange={handleChangeStart}
                    minHour={0}
                    minMinute={0}
                  />
                </Grid>
                <Grid item>
                  <InputLabel>To</InputLabel>
                  <CustomTimePicker
                    value={editedPlanItem.endDate}
                    onChange={handleChangeEnd}
                    minHour={getHours(editedPlanItem.startDate)}
                    minMinute={getMinutes(editedPlanItem.startDate)}
                  />
                </Grid>
              </Grid>
            )}
            <Grid item>
              <Typography>How much does each time cost?</Typography>
              <InputLabel>Amount</InputLabel>
              <Input
                id="plan-item-unit-cost"
                value={getActualPrice()}
                name={"priceActual"}
                onChange={handleChange}
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
                type="number"
              />
            </Grid>
          </Grid>
          <Grid item md={7}>
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
        <DialogActions justify="flex-end">
          <Button onClick={handleDeletePlanItemGroup}>Delete All</Button>
          {/* <Button onClick={handleEditAll}>Edit All</Button> */}
          <Button onClick={props.back}>Back</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </DialogContent>

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
