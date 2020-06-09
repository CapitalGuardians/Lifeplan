import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  FormLabel,
  Input,
  InputAdornment,
  InputLabel,
  TextField,
  Typography
} from "@material-ui/core";
import CustomTimePicker from "./CustomTimePicker";
import { addHours, endOfDay, getHours, getMinutes, startOfDay } from "date-fns";

export default function PlanItemEditView(props) {
  const { planItem, onSave } = props;
  const [editedPlanItem, setEditedPlanItem] = useState({
    ...planItem,
    startDate: new Date(planItem.startDate),
    endDate: new Date(planItem.endDate)
  });
  console.log(editedPlanItem);
  const dateRef = useRef({
    startDate: new Date(editedPlanItem.startDate),
    endDate: new Date(editedPlanItem.endDate)
  });

  function handleChange(event) {
    setEditedPlanItem({
      ...editedPlanItem,
      [event.target.name]: event.target.value
    });
  }

  function handleSave() {
    onSave({
      ...editedPlanItem,
      priceActual: parseFloat(editedPlanItem.priceActual)
    });
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
          endDate: editedPlanItem.endDate
        };
        setEditedPlanItem({ ...editedPlanItem, startDate: newStartDate });
      } else {
        const newEndDate =
          getHours(editedPlanItem.startDate) === 23
            ? endOfDay(editedPlanItem.startDate)
            : addHours(editedPlanItem.startDate, 1);
        dateRef.current = {
          startDate: editedPlanItem.startDate,
          endDate: newEndDate
        };

        setEditedPlanItem({ ...editedPlanItem, endDate: newEndDate });
      }
    } else {
      dateRef.current = {
        startDate: editedPlanItem.startDate,
        endDate: editedPlanItem.endDate
      };
    }
  }, [editedPlanItem]);

  function handleChangeStart(startDate) {
    console.log(startDate);
    setEditedPlanItem({ ...editedPlanItem, startDate });
  }

  function handleChangeEnd(endDate) {
    setEditedPlanItem({ ...editedPlanItem, endDate });
  }

  return (
    <>
      <DialogContent>
        <Grid container justify="center">
          <Grid container item xs={11} direction="column" spacing={1}>
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
                value={editedPlanItem.priceActual}
                name={"priceActual"}
                onChange={handleChange}
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
                type="number"
              />
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </>
  );
}
