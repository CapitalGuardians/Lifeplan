import React from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  secondary: {
    backgroundColor: theme.palette.secondary.main
  },
  categoryIcon: {},
  expansionPanelSummary: {
    marginBottom: 0
  }
}));
export default function BudgetCategorySection(props) {
  const classes = useStyles();
  const { sectionName } = props;
  return (
    <ExpansionPanel defaultExpanded>
      <ExpansionPanelSummary
        classes={{ expanded: classes.expansionPanelSummary }}
        expandIcon={<ExpandMoreIcon color="secondary" />}
        aria-controls={sectionName + "content"}
        id={sectionName + "-header"}
      >
        <Typography variant="h5">{sectionName}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid container spacing={4}>
          <Grid item container spacing={2} justify="space-evenly">
            {props.children}
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}
