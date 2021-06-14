import React, { Component } from "react";
import {
  Grid,
  Card,
  CardContent,
  Button,
  CardActions,
} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import CardHeader from "@material-ui/core/CardHeader";
import classNames from "classnames";
import DoughnutBody from "./DoughnutBody";

const styles = {
  cardHeader: { height: 80 },
  noVerticalPadding: { paddingTop: 0, paddingBottom: 0 },
};

class BudgetCategoryCard extends Component {
  render() {
    const { classes, category, allocated, total } = this.props;
    return (
      <Card raised>
        <CardHeader
          title={category}
          titleTypographyProps={{ variant: "h6" }}
          className={classNames(classes.cardHeader, classes.noVerticalPadding)}
        />
        <CardContent className={classes.noVerticalPadding}>
          <DoughnutBody allocated={allocated} total={total} />
        </CardContent>
        <CardActions disableSpacing className={classes.noVerticalPadding}>
          <Grid container justify="flex-end">
            {/* <Grid item>
              <Button onClick={() => this.props.addSupports()} size="small">
                Add
              </Button>
            </Grid> */}
            <Grid item>
              <Button onClick={() => this.props.openSupports()} size="small">
                Allocate
              </Button>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    );
  }
}

export default withStyles(styles)(BudgetCategoryCard);
