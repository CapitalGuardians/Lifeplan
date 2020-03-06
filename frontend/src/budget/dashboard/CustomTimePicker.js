import React from "react";
import { TimePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";

export default function CustomTimePicker(props) {
  const { onChange, value } = props;

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <TimePicker value={value} onChange={onChange} autoOk />
    </MuiPickersUtilsProvider>
  );
}
