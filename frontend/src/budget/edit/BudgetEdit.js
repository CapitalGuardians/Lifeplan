import React from "react";
import Grid from "@material-ui/core/Grid/index";
import { NAV_BAR_HEIGHT } from "../../common/theme";
import { makeStyles } from "@material-ui/core/styles";
import FormPersonalDetails from "./BudgetForm";

const useStyles = makeStyles({
  home: {
    height: `calc(100vh - ${NAV_BAR_HEIGHT}px)`,
  },
});

export default function BudgetForm(props) {
  const classes = useStyles();
  return (
    <Grid container className={classes.home} justify="center">
      <Grid item xs={11} sm={8} md={6} lg={5}>
        <FormPersonalDetails history={props.history} />
      </Grid>
    </Grid>
  );
}
