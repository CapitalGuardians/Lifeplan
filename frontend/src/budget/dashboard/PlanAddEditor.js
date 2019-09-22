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

  function onClickSave(values, supportItemId) {
    const planItem = createNewPlanItem(values, supportItemId);
    props.save(planItem);
    props.redirectSupports();
  }

  function handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    if (name === "price_actual" && !moneyRegex.test(value)) {
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

  function createNewPlanItem(values, supportItemId) {
    const planItem = {
      supportItemId: supportItemId,
      ...values
    };
    return planItem;
  }

  function enumFrequency(itemUnit) {
    let frequencyEnum = 0;
    switch (itemUnit) {
      case "H":
        frequencyEnum = 365;
        break;
      case "EA":
        frequencyEnum = 365;
        break;
      case "D":
        frequencyEnum = 52;
        break;
      case "WK":
        frequencyEnum = 12;
        break;
      case "MON":
        frequencyEnum = 1;
        break;
      case "YR":
        frequencyEnum = 1;
        break;
      default:
        break;
    }
    return frequencyEnum;
  }

  function initialiseValues(supportItem) {
    let name, frequency, price;
    let quantity = "";
    name = supportItem.name;
    if (supportItem.price !== null) {
      price = supportItem.price;
    } else {
      price = "";
    }
    frequency = enumFrequency(supportItem.unit);
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
    if (values.price_actual === "" || values.quantity === "") {
      return 0;
    } else {
      return values.price_actual * values.frequency_per_year * values.quantity;
    }
  }

  function displayTotalCost(totalPrice, frequencyUnit, quantityUnit) {
    return totalPrice > 0 ? (
      <Typography>
        Total: ${values.price_actual} X {values.quantity} {quantityUnit}
        (s) X {values.frequency_per_year} {frequencyUnit}(s) = ${totalPrice}
      </Typography>
    ) : (
      <Typography>Total: $0</Typography>
    );
  }

  const usageFrequency = "frequency_per_year";
  const supportItemName = "name";
  const itemPrice = "price_actual";
  const itemQuantity = "quantity";
  const { name, frequency, quantity, price } = initialiseValues(supportItem);
  const [values, setValues] = useState({
    name: name,
    price_actual: price,
    quantity: quantity,
    frequency_per_year: frequency
  });
  const enumResult = unitEnumeration(supportItem.unit);
  const unitEnum = enumResult.units;
  const unitTime = enumResult.unitTime;
  const unit = enumResult.unit;
  const frequencyUsage = timeEnumeration(values.frequency_per_year);

  const totalCost = calculateTotalCost(values);

  return (
    <main>
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
              <Typography variant={"body1"} align={"left"}>
                How often do you use this support item?
              </Typography>
              <FormControl margin={"normal"} required>
                <InputLabel htmlFor={usageFrequency}>
                  Usage Frequency
                </InputLabel>
                <Select
                  value={values.frequency_per_year}
                  onChange={e => handleChange(e)}
                  inputProps={{
                    name: usageFrequency,
                    id: usageFrequency
                  }}
                >
                  {unitEnum >= 5 && <MenuItem value={365}>daily</MenuItem>}
                  {unitEnum >= 4 && <MenuItem value={52}>weekly</MenuItem>}
                  {unitEnum >= 3 && <MenuItem value={12}>monthly</MenuItem>}
                  {unitEnum >= 1 && <MenuItem value={1}>yearly</MenuItem>}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography cvariant={"body1"} align={"left"}>
                How many {unitTime} do you this use per {frequencyUsage}?
              </Typography>
              <FormControl margin={"normal"} required>
                <InputLabel htmlFor={itemQuantity}>{unitTime}</InputLabel>
                <Input
                  id={itemQuantity}
                  name={itemQuantity}
                  autoComplete={itemQuantity}
                  autoFocus
                  defaultValue={values.quantity}
                  onChange={e => handleChange(e)}
                  //endAdornment={<InputAdornment position="end">per {frequencyUsage}</InputAdornment>}
                ></Input>
              </FormControl>
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
                  value={values.price_actual}
                  onChange={e => handleChange(e)}
                  startAdornment={
                    <InputAdornment position="start">$</InputAdornment>
                  }
                ></Input>
              </FormControl>
            </Grid>
          </Grid>
          {displayTotalCost(totalCost, frequencyUsage, unit)}
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
    </main>
  );
}