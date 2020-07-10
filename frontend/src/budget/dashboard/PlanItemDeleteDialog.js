import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@material-ui/core/";

export default function PlanItemDeleteDialog(props) {
  const { open, onClose, onDelete } = props;
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this? It cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onDelete}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
}
