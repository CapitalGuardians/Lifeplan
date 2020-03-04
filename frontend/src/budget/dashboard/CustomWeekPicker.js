import React from "react";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import isWithinInterval from "date-fns/isWithinInterval";
import isSameDay from "date-fns/isSameDay";
import classnames from "classnames";
import withStyles from "@material-ui/core/styles/withStyles";
import { createStyles } from "@material-ui/styles";
import IconButton from "@material-ui/core/IconButton";
import format from "date-fns/format";
import DateFnsUtils from "@date-io/date-fns";
import _ from "lodash";
import { lastDayOfWeek, endOfWeek } from "date-fns";

function CustomWeekpicker(props) {
  const { onChange, minDate, maxDate, itemStartDates } = props;

  const renderWrappedWeekDay = (date, selectedDate, dayInCurrentMonth) => {
    const { classes } = props;
    const dayIsBetween = _.some(itemStartDates, itemStartDate => {
      const start = new Date(itemStartDate);
      const end = endOfWeek(start);
      return isWithinInterval(date, { start, end });
    });

    const isFirstDay = _.some(itemStartDates, itemStartDate => {
      return isSameDay(itemStartDate, date);
    });
    const isLastDay = _.some(itemStartDates, itemStartDate => {
      return isSameDay(lastDayOfWeek(itemStartDate), date);
    });

    const wrapperClassName = classnames({
      [classes.highlight]: dayIsBetween,
      [classes.firstHighlight]: isFirstDay,
      [classes.endHighlight]: isLastDay
    });

    const dayClassName = classnames(classes.day, {
      [classes.nonCurrentMonthDay]:
        !dayInCurrentMonth || date < minDate || date > maxDate,
      [classes.highlightNonCurrentMonthDay]: !dayInCurrentMonth && dayIsBetween
    });

    return (
      <div className={wrapperClassName}>
        <IconButton className={dayClassName}>
          <span> {format(date, "d")} </span>
        </IconButton>
      </div>
    );
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker
        minDate={minDate}
        maxDate={maxDate}
        variant="static"
        disableToolbar
        onChange={onChange}
        renderDay={renderWrappedWeekDay}
      />
    </MuiPickersUtilsProvider>
  );
}

const styles = createStyles(theme => ({
  dayWrapper: {
    position: "relative"
  },
  day: {
    width: 36,
    height: 36,
    fontSize: theme.typography.caption.fontSize,
    margin: "0 2px",
    color: "inherit"
  },
  customDayHighlight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "2px",
    right: "2px",
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: "50%"
  },
  nonCurrentMonthDay: {
    color: theme.palette.text.disabled
  },
  highlightNonCurrentMonthDay: {
    color: "#676767"
  },
  highlight: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white
  },
  firstHighlight: {
    extend: "highlight",
    borderTopLeftRadius: "50%",
    borderBottomLeftRadius: "50%"
  },
  endHighlight: {
    extend: "highlight",
    borderTopRightRadius: "50%",
    borderBottomRightRadius: "50%"
  }
}));

export default withStyles(styles)(CustomWeekpicker);
