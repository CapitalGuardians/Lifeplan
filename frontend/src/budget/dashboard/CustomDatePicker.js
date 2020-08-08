import React from "react";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import IconButton from "@material-ui/core/IconButton";
import format from "date-fns/format";
import { createStyles, withStyles } from "@material-ui/core";
import classNames from "classnames";
import _ from "lodash";
import isSameDay from "date-fns/isSameDay";

function CustomDatePicker(props) {
  const { handleChange, itemStartDates, classes, minDate, maxDate } = props;

  const renderDayPicker = () => {
    const renderDay = (date, selectedDate, dayInCurrentMonth) => {
      const dayClassName = classNames(classes.day, {
        [classes.nonCurrentMonthDay]:
          !dayInCurrentMonth || date < minDate || date > maxDate,
        [classes.highlight]: _.some(itemStartDates, (itemStartDate) => {
          return isSameDay(itemStartDate, date);
        }),
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
        minDate={minDate}
        maxDate={maxDate}
        disableToolbar
        variant={"static"}
        onChange={handleChange}
        renderDay={renderDay}
        initialFocusedDate={itemStartDates[0]}
      />
    );
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      {renderDayPicker()}
    </MuiPickersUtilsProvider>
  );
}

const styles = createStyles((theme) => ({
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
    "&:hover": {
      background: theme.palette.primary.main,
    },
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
