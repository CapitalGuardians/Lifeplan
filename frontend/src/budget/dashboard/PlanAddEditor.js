//UI for plan item addition
//The UI provides 4 fields for users to modify the support item:
// 1. a costomised support item name, meaning users are able to name the item whatever they want
// 2. usage frequency, how often they use the item
// 3. the number of items users consume each time
// 4. the customised price, price for users may differ for varied reasons
// each field will be filled with a default value if users never costomised them before
// an annual cost will be calculated based on the fields
// once saved, a new item will be added into plan items list
import React, { useState } from "react";
import { DialogContent } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputAdornment from "@material-ui/core/InputAdornment";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import FormHelperText from "@material-ui/core/FormHelperText";
import CustomDatePicker from "./CustomDatePicker";
import _ from "lodash";
import isSameDay from "date-fns/isSameDay";


export const DAY_UNITS = ["H", "D", "EA"];
const DAY_DAILY = "Every day";
const DAY_WEEKLY = "Once or more per week recurringly";
const DAY_MONTHLY = "Once or more per month recurringly";
const DAY_YEARLY = "Specific times in the year";

// const WEEK_WEEKLY = "Weekly";
// const WEEK_FORTNIGHTLY = "Fortnightly";
// const WEEK_MONTHLY = "Monthly";
// const WEEK_YEARLY = "Specific weeks of the year";


export const DAILY = "DAILY";
export const WEEKLY = "WEEKLY";
//export const FORTNIGHTLY = "FORTNIGHTLY";
export const MONTHLY = "MONTHLY";
export const YEARLY = "YEARLY";


const useStyles = makeStyles(theme => ({
  form: {
    width: "100%",
    marginTop: theme.spacing(1)
  },
  main: {
    width: "auto",
    display: "block",
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    [theme.breakpoints.up(400 + theme.spacing(3 * 2))]: {
      width: 400,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  blackButton: {
    backgroundColor: "black",
    color: "white"
  }
}));

export default function PlanAddEditor(props) {
  const { supportItem } = props;

  const classes = useStyles();

  let quantityRegex = new RegExp(/^$|^[1-9]\d*$/);
  let moneyRegex = new RegExp(/^$|^[1-9]\d*\.?\d{0,2}$/);

  function onClickBack() {
    props.redirectSelectionPage();
  }

  function onClickSave(values, supportItemGroup) {
    const planItem = createNewPlanItem(values, supportItemGroup);
    props.save(planItem);
    props.redirectSupports();
  }

  function handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    if (name === "priceActual" && !moneyRegex.test(value)) {
      /*do nothing*/
    } else if (name === "quantity" && !quantityRegex.test(value)) {
      /*do nothing*/
    } else {
      setValues(values => ({
        ...values,
        [name]: value
      }));
    }
  }

  function createNewPlanItem(values, supportItemGroup) {
    console.log(supportItemGroup);
    const planItem = {
      supportItemGroup: supportItemGroup,
      ...values
    };
    return planItem;
  }

  // function enumFrequency(itemUnit) {
  //   let frequencyEnum = 0;
  //   switch (itemUnit) {
  //     case "H":
  //       frequencyEnum = 365;
  //       break;
  //     case "EA":
  //       frequencyEnum = 365;
  //       break;
  //     case "D":
  //       frequencyEnum = 52;
  //       break;
  //     case "WK":
  //       frequencyEnum = 12;
  //       break;
  //     case "MON":
  //       frequencyEnum = 1;
  //       break;
  //     case "YR":
  //       frequencyEnum = 1;
  //       break;
  //     default:
  //       break;
  //   }
  //   return frequencyEnum;
  // }

  function initialiseValues(supportItem) {
    let name, frequency, price;
    let quantity = 0;
    name = supportItem.name;
    if (supportItem.price != null) {
      price = supportItem.price;
    } else {
      price = 0;
    }
    frequency = YEARLY;
    return { name, frequency, quantity, price };
  }

  //enumerate the unit of each support item
  function unitEnumeration(unitString) {
    let units = 0;
    let unitTime = "";
    let unit = "";
    switch (unitString) {
      case "H":
        unitTime = "hours";
        units = 5;
        unit = "hour";
        break;
      case "D":
        units = 4;
        unitTime = "days";
        unit = "day";
        break;
      case "WK":
        units = 3;
        unitTime = "weeks";
        unit = "week";
        break;
      case "MON":
        units = 2;
        unitTime = "months";
        unit = "month";
        break;
      case "YR":
        units = 1;
        unitTime = "times";
        unit = "year";
        break;
      case "EA":
        units = 5;
        unitTime = "times";
        unit = "time";
        break;
      default:
        break;
    }
    return { units, unitTime, unit };
  }

  function timeEnumeration(frequency) {
    let timeEnum = "";
    switch (frequency) {
      case 365:
        timeEnum = "day";
        break;
      case 52:
        timeEnum = "week";
        break;
      case 12:
        timeEnum = "month";
        break;
      case 1:
        timeEnum = "year";
        break;
      default:
        break;
    }
    return timeEnum;
  }

  function calculateTotalCost(values) {
    if (values.priceActual === "" || values.quantity === "") {
      return 0;
    } else {
      return values.priceActual * values.frequencyPerYear * values.quantity;
    }
  }

  function displayTotalCost(totalPrice, frequencyUnit, quantityUnit) {
    return totalPrice > 0 ? (
      <Typography>
        Total: ${values.priceActual} X {values.quantity} {quantityUnit}
        (s) X {values.frequencyPerYear} {frequencyUnit}(s) = ${totalPrice}
      </Typography>
    ) : (
      <Typography variant="button">Total: $0</Typography>
    );
  }

// 
  const usageFrequency = "frequencyPerYear";
  const supportItemName = "name";
  const itemPrice = "priceActual";
  const { name, frequency, quantity, price } = initialiseValues(supportItem);
  const [values, setValues] = useState({
    name: name,
    priceActual: price,
    quantity: quantity,
    frequencyPerYear: frequency,
  });
  const [itemStartDates, setItemStartDates] = useState([]);

  const handleDayYearlyDateChange = (date) => {

    const newItemStartDates = _.unionWith([date], itemStartDates, isSameDay);

    setItemStartDates(newItemStartDates);
  };

  const enumResult = unitEnumeration(supportItem.unit);
  const unit = enumResult.unit;
  const frequencyUsage = timeEnumeration(values.frequencyPerYear);

  const totalCost = calculateTotalCost(values);

  const renderFrequencySelector = () => {
    return (
      DAY_UNITS.concat("WK").includes(supportItem.unit) &&
      <>
        <Typography variant={"body1"} align={"left"}>
          How often do you use this support item?
        </Typography>
        <FormControl margin={"normal"} required>
          <InputLabel htmlFor={usageFrequency}>
            Usage Frequency
          </InputLabel>
          <Select
            value={values.frequencyPerYear}
            autoWidth
            onChange={e => handleChange(e)}
            inputProps={{
              name: usageFrequency,
              id: usageFrequency
            }}
          >
            {
              DAY_UNITS.includes(supportItem.unit) &&
                [
                  <MenuItem value={YEARLY} key={DAY_YEARLY}>{DAY_YEARLY}</MenuItem>,
                  <MenuItem value={MONTHLY} key={DAY_MONTHLY}>{DAY_MONTHLY}</MenuItem>,
                  <MenuItem value={WEEKLY} key={DAY_WEEKLY}>{DAY_WEEKLY}</MenuItem>,
                  <MenuItem value={DAILY} key={DAY_DAILY}>{DAY_DAILY}</MenuItem>
                ]


            }

          </Select>
          <FormHelperText>
            Please select the frequency from the dropdown box
          </FormHelperText>
        </FormControl>
      </>
    )
  };

  const renderStartDatePicker = () => {
    if (DAY_UNITS.concat("WK").includes(supportItem.unit))
    {return(
      <>
        {
          [YEARLY, MONTHLY].includes(values.frequencyPerYear) &&
            <>
              <Typography variant={"body1"} align={"left"}>
                Please select the starting date/s
              </Typography>
              <CustomDatePicker
                frequency={values.frequencyPerYear}
                unit={supportItem.unit}
                handleChange={handleDayYearlyDateChange}
                itemStartDates={itemStartDates}
              />
            </>
        }
      </>
    )}
  };

  return (
    <>
      <DialogContent>
        <form className={classes.form}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Typography cvariant={"body1"} align={"left"}>
                What would you like to call this support item?
              </Typography>
              <FormControl margin={"dense"} required fullWidth>
                <InputLabel htmlFor={supportItemName}>
                  Support Item Name
                </InputLabel>
                <Input
                  id={supportItemName}
                  name={supportItemName}
                  autoComplete={supportItemName}
                  autoFocus
                  value={values.name}
                  onChange={e => handleChange(e)}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              {renderFrequencySelector()}
            </Grid>
            <Grid item xs={12}>
              {renderStartDatePicker()}
            </Grid>
            <Grid item xs={12}>
              <Typography cvariant={"body1"} align={"left"}>
                How much does each {unit} cost?
              </Typography>
              <FormControl margin={"normal"} required>
                <InputLabel htmlFor={itemPrice}>Amount</InputLabel>
                <Input
                  id={itemPrice}
                  name={itemPrice}
                  autoComplete={itemPrice}
                  autoFocus
                  value={values.priceActual}
                  onChange={e => handleChange(e)}
                  startAdornment={
                    <InputAdornment position="start">$</InputAdornment>
                  }
                />
              </FormControl>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          className={classes.textButton}
          variant={"text"}
          onClick={onClickBack}
        >
          Back
        </Button>
        <Button
          className={classes.textButton}
          variant={"text"}
          onClick={() => onClickSave(values, supportItem.id)}
        >
          Save
        </Button>
      </DialogActions>
    </>
  );
}
