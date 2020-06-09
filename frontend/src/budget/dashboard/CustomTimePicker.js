import React from "react";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import { getHours, getMinutes, setHours, setMinutes } from "date-fns";
import MenuItem from "@material-ui/core/MenuItem";

const options = ({ minHour, minMinute }) => {
  let i, j;
  const timeOptions = [];
  for (j = minMinute / 15; j < 4; j++) {
    const hour = minHour;
    const minute = j * 15;
    const am = hour >= 12 ? "pm" : "am";
    const timeOption = `${hour},${minute}`;
    const hourString = (hour > 12 ? hour - 12 : hour === 0 ? 12 : hour)
      .toString()
      .padStart(2, "0");
    const minuteString = minute.toString().padStart(2, "0");
    const text = `${hourString}:${minuteString} ${am}`;
    timeOptions.push(
      <MenuItem key={timeOption} value={timeOption}>
        {text}
      </MenuItem>
    );
  }
  for (i = minHour + 1; i < 24; i++) {
    for (j = 0; j < 4; j++) {
      const hour = i;
      const minute = j * 15;
      const am = i >= 12 ? "pm" : "am";
      const timeOption = `${hour},${minute}`;
      const hourString = (hour > 12 ? hour - 12 : hour === 0 ? 12 : hour)
        .toString()
        .padStart(2, "0");
      const minuteString = minute.toString().padStart(2, "0");
      const text = `${hourString}:${minuteString} ${am}`;
      timeOptions.push(
        <MenuItem key={timeOption} value={timeOption}>
          {text}
        </MenuItem>
      );
    }
  }
  return timeOptions;
};

export default function CustomTimePicker(props) {
  const { onChange, value, minHour, minMinute } = props;

  const defaultDate = new Date(value);

  const convertedValue = `${getHours(value)},${getMinutes(value)}`;

  const handleChange = event => {
    const result = event.target.value.split(",");
    const hour = parseInt(result[0]);
    const minute = parseInt(result[1]);

    onChange(setHours(setMinutes(defaultDate, minute), hour));
  };

  return (
    <FormControl>
      <Select value={convertedValue} onChange={handleChange}>
        {options({ minHour, minMinute })}
      </Select>
    </FormControl>
  );
}
