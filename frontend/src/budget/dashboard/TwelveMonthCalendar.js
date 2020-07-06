import React from "react";
import PreviewCalendar from "./PreviewCalendar";
import { Grid } from "@material-ui/core";
import styles from "./TwelveMonthCalendar.module.css";

export default function TwelveMonthCalendar(props) {
  const { showPreview } = props;

  return (
    <Grid container className={styles.container} justify="flex-start">
      <Grid item xs={12} sm={4} md={3}>
        <PreviewCalendar showPreview={showPreview} startDate={new Date()} />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <PreviewCalendar showPreview={showPreview} startDate={new Date()} />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <PreviewCalendar showPreview={showPreview} startDate={new Date()} />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <PreviewCalendar showPreview={showPreview} startDate={new Date()} />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <PreviewCalendar showPreview={showPreview} startDate={new Date()} />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <PreviewCalendar showPreview={showPreview} startDate={new Date()} />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <PreviewCalendar showPreview={showPreview} startDate={new Date()} />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <PreviewCalendar showPreview={showPreview} startDate={new Date()} />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <PreviewCalendar showPreview={showPreview} startDate={new Date()} />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <PreviewCalendar showPreview={showPreview} startDate={new Date()} />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <PreviewCalendar showPreview={showPreview} startDate={new Date()} />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <PreviewCalendar showPreview={showPreview} startDate={new Date()} />
      </Grid>
    </Grid>
  );
}
