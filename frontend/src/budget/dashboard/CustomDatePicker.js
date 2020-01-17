import React from "react";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {DAY_UNITS, YEARLY} from "./PlanAddEditor"
import DateFnsUtils from "@date-io/date-fns";
import IconButton from "@material-ui/core/IconButton";
import format from "date-fns/format";
import {createStyles, withStyles} from "@material-ui/core";
import classNames from "classnames";
import _ from "lodash";
import isSameDay from "date-fns/isSameDay";



function CustomDatePicker(props) {
  const { frequency, unit, handleChange, itemStartDates } = props;

  const renderDayYearlyPicker = () => {
    const { classes } = props;


    const renderDay = (date, selectedDate, dayInCurrentMonth) => {
      // console.log(_.map(itemStartDates, item => {return item.getTime()}));
      // console.log(date.getTime());
      const dayClassName = classNames(classes.day, {
        [classes.nonCurrentMonthDay]: !dayInCurrentMonth,
        [classes.highlight]: _.some(itemStartDates, itemStartDate => {return isSameDay(itemStartDate, date)})
      });
      return (
        <div>
          <IconButton className={dayClassName}>
            <span> {format(date, "d")} </span>
          </IconButton>
        </div>
      );
    };
    return (
      <DatePicker
        disableToolbar
        variant={"static"}
        onChange={handleChange}
        renderDay={renderDay}
        initialFocusedDate={itemStartDates[0]}
      />
    )
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      {DAY_UNITS.includes(unit) && frequency === YEARLY && renderDayYearlyPicker()}
    </MuiPickersUtilsProvider>
  )
}

const styles = createStyles(theme => ({
  dayWrapper: {
    position: "relative",
  },
  day: {
    width: 36,
    height: 36,
    fontSize: theme.typography.caption.fontSize,
    margin: "0 2px",
    color: "inherit",
  },
  customDayHighlight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "2px",
    right: "2px",
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: "50%",
  },
  nonCurrentMonthDay: {
    color: theme.palette.text.disabled,
  },
  highlightNonCurrentMonthDay: {
    color: "#676767",
  },
  highlight: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  firstHighlight: {
    extend: "highlight",
    borderTopLeftRadius: "50%",
    borderBottomLeftRadius: "50%",
  },
  endHighlight: {
    extend: "highlight",
    borderTopRightRadius: "50%",
    borderBottomRightRadius: "50%",
  },
}));

export default withStyles(styles)(CustomDatePicker);