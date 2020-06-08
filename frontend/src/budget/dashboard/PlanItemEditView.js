import React, { useState } from "react";
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

export default function PlanItemEditView(props) {
  const { planItem, onSave } = props;
  const [editedPlanItem, setEditedPlanItem] = useState(planItem);

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

  return (
    <>
      <DialogContent>
        <Grid container justify="center">
          <Grid container item xs={11} direction="column" spacing={1}>
            <Grid item>
              <Typography>
                {" "}
                What would you like to call this support Item?
              </Typography>
              <TextField
                id="plan-item-name"
                label="Support Item Name"
                value={editedPlanItem.name}
                name={"name"}
                onChange={handleChange}
              />
            </Grid>
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
