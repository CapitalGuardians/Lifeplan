import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Fab from "@material-ui/core/Fab";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import api from "../../api";
import { DialogContent } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import DialogActions from "@material-ui/core/DialogActions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import _ from "lodash";
import InfoIcon from "@material-ui/icons/Info";
import Tooltip from "@material-ui/core/Tooltip";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { DARK_BLUE, LIGHT_BLUE } from "../../common/theme";
import TextField from "@material-ui/core/TextField";
import PlanItemEditor from "./PlanItemEditor";
import PlanAddEditor from "./PlanAddEditor";

const useStyles = makeStyles(theme => ({
  dialogTitle: {
    backgroundColor: DARK_BLUE,
    color: "white"
  },
  dialogContent: {
    minHeight: 400
  },
  buttonText: {
    textTransform: "none"
  },
  supportButtonLight: {
    backgroundColor: LIGHT_BLUE,
    color: "white",
    width: "100%",
    maxHeight: "72px",
    minHeight: "72px"
  },
  supportButtonDark: {
    backgroundColor: DARK_BLUE,
    color: "white",
    width: "100%",
    maxHeight: "72px",
    minHeight: "72px"
  },
  icon: {
    height: "150"
  },
  list: {
    padding: 8
  },
  blackButton: {
    backgroundColor: "black",
    color: "white"
  },
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
  }
}));

export default function SupportItemSelector(props) {
  const {
    birthYear,
    postcode,
    planCategory,
    supportCategory,
    setPlanItems
  } = props;

  const theme = useTheme();

  // React Hooks
  // list of all support items for this group
  const [supportItems, setSupportItems] = useState([]);
  // id of registration group
  const [registrationGroupId] = useState(null);
  // 0: large screen; 1: small screen (mobile)
  const matchesMd = useMediaQuery(theme.breakpoints.up("md"));
  // number representing current page
  // 0: supports list; 1: supports selection; 2: edit/add support
  const [page, setPage] = useState(0);
  // set of support returned from search
  const [searchResults, setSearchResults] = useState([]);
  // text typed into search bar
  const [searchText, setSearchText] = useState("");
  // item that is being edited
  const [editedItem, setEditedItem] = useState(0);
  const [editedPlanItem, setEditedPlanItem] = useState(0);

  const classes = useStyles();

  // api call to load support items
  useEffect(() => {
    api.SupportItemGroups.get({
      birthYear: birthYear,
      postcode: postcode,
      supportCategoryID: supportCategory.id,
      registrationGroupId
    }).then(response => {
      const items = response.data.map(supportItem => {
        supportItem.label = supportItem.name;
        return supportItem;
      });
      setSupportItems(items);
      setSearchResults(items);
    });
  }, [birthYear, postcode, supportCategory, registrationGroupId]);

  // load plan items from backend (logged in) or local storage
  useEffect(() => {}, [supportCategory]);

  // save plan items (not logged in) into local storage
  useEffect(() => {});

  function goToSupportsList() {
    setPage(0);
  }

  function goToSupportSelection() {
    setPage(1);
  }

  function goToEditSupport() {
    setPage(2);
  }

  function goToAddSupport() {
    setPage(3);
  }

  function handleClose() {
    props.onClose();
  }

  function handleAddSupportItem(planItem) {
    const { planItems } = planCategory;
    setPlanItems([planItem, ...planItems]);
  }

  function handleSelectSupportItem(supportItem) {
    // const planItem = {
    //   supportItemId: supportItem.id,
    //   quantity: 1,
    //   price_actual: supportItem.price,
    //   name: supportItem.name
    // };
    // const { planItems } = planCategory;
    // setPlanItems([planItem, ...planItems]);

    // goToSupportsList();

    setEditedItem(supportItem);
    goToAddSupport();

    //saveToLocalStorage(planItems);
  }

  function handleEditSupportItem(supportItem, planItem) {
    setEditedItem(supportItem);
    setEditedPlanItem(planItem);
    goToEditSupport();
  }

  function handleSearch(e) {
    setSearchText(e.target.value);

    setSearchResults(
      supportItems.filter(s =>
        s.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  }

  function handleDelete(planItem) {
    setPlanItems(_.difference(planCategory.planItems, [planItem]));

    //saveToLocalStorage(planCategory.planItems);
  }

  function handleItemUpdate(planItem, values) {
    setPlanItems(
      planCategory.planItems.map((item, index) => {
        if (planItem === item) {
          return {
            ...item,
            ...values
          };
        }
        return item;
      })
    );
  }

  function handleChangeUnitPrice(event, planItem) {
    setPlanItems(
      planCategory.planItems.map((item, index) => {
        if (planItem === item) {
          return {
            ...item,
            price_actual: event.target.value
          };
        }
        return item;
      })
    );
  }

  function handleChangeUnits(event, planItem) {
    setPlanItems(
      planCategory.planItems.map(item => {
        if (planItem === item) {
          return {
            ...item,
            quantity: event.target.value
          };
        }
        return item;
      })
    );
  }

  function renderPlanItem(planItem, index) {
    let supportItem;

    if (page === 0) {
      supportItem = _.find(supportItems, supportItem => {
        return supportItem.id === planItem.supportItemId;
      });
    } else if (page === 1) {
      supportItem = _.find(supportItems, supportItem => {
        return supportItem.id === planItem.id;
      });
    }

    return (
      supportItem != null && (
        <Grid item>
          <Grid container alignItems="center">
            <Fab
              className={
                page === 1
                  ? classes.supportButtonLight
                  : classes.supportButtonDark
              }
              variant="extended"
              onClick={() => {
                if (page === 1) {
                  handleSelectSupportItem(supportItem);
                }
                if (page === 0) {
                  handleEditSupportItem(supportItem, planItem);
                }
              }}
            >
              <ListItemIcon>
                <Tooltip
                  disableTouchListener
                  title={supportItem.description || "No description"}
                >
                  <InfoIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText
                className={classes.buttonText}
                primary={page === 0 ? planItem.name : supportItem.name}
              />
            </Fab>
          </Grid>
        </Grid>
      )
    );
  }

  function renderSupportItemList(list) {
    var halfOfItems = matchesMd ? list.length / 2 + 1 : list.length;

    return list.length === 0 ? (
      <div> Press Add New to add a support </div>
    ) : (
      <Grid container direction={"row"}>
        <Grid item xs={matchesMd ? 6 : 12}>
          <List>
            {list.slice(0, halfOfItems).map((planItem, index) => (
              <div key={index} className={classes.list}>
                {renderPlanItem(planItem, index)}
              </div>
            ))}
          </List>
        </Grid>
        <Grid item xs={matchesMd ? 6 : 12}>
          {matchesMd && (
            <List>
              {list.slice(halfOfItems, list.length).map((planItem, index) => (
                <div key={index} className={classes.list}>
                  {renderPlanItem(planItem, index)}
                </div>
              ))}
            </List>
          )}
        </Grid>
      </Grid>
    );
  }

  function renderPlanContent() {
    return (
      <DialogContent className={classes.dialogContent}>
        {renderSupportItemList(planCategory.planItems)}
      </DialogContent>
    );
  }

  function renderPlanActions() {
    return (
      <DialogActions>
        <Button onClick={handleClose}>Save & Close</Button>
        {!matchesMd && <Button onClick={goToSupportSelection}>Add New</Button>}
      </DialogActions>
    );
  }

  function renderSelectionContent() {
    return (
      <DialogContent>
        <TextField
          id={"support-item-select"}
          label={"Search for support items"}
          value={searchText}
          fullWidth
          variant="filled"
          onChange={handleSearch}
        />
        {renderSupportItemList(searchResults)}
      </DialogContent>
    );
  }

  function renderSelectionActions() {
    return (
      <DialogActions>
        <Button
          className={matchesMd ? classes.blackButton : classes.textButton}
          variant={matchesMd ? "contained" : "text"}
          onClick={goToSupportsList}
        >
          Back
        </Button>
        <Button
          className={matchesMd ? classes.blackButton : classes.textButton}
          variant={matchesMd ? "contained" : "text"}
          onClick={goToSupportsList}
        >
          Save
        </Button>
      </DialogActions>
    );
  }

  function renderEditor() {
    return (
      <PlanItemEditor
        editedItem={editedItem}
        editedPlanItem={editedPlanItem}
        redirect={goToSupportsList}
        delete={handleDelete}
        save={handleItemUpdate}
      />
    );
  }

  function renderAdditionPage() {
    return (
      <PlanAddEditor
        supportItem={editedItem}
        redirectSelectionPage={goToSupportSelection}
        redirectSupports={goToSupportsList}
        save={handleAddSupportItem}
      />
    );
  }

  let content;
  let actions;
  if (page === 0) {
    content = renderPlanContent();
    actions = renderPlanActions();
  } else if (page === 1) {
    content = renderSelectionContent();
    actions = renderSelectionActions();
  } else if (page === 2) {
    //content = renderEditingContent();
    content = renderEditor();
    actions = "";
  } else if (page === 3) {
    content = renderAdditionPage();
    actions = "";
  }

  return (
    <div>
      <Dialog
        fullScreen={!matchesMd}
        fullWidth
        maxWidth="md"
        open={props.open}
        onClose={handleClose}
      >
        <DialogTitle className={classes.dialogTitle}>
          <Grid container justify="space-between">
            <div>{supportCategory.name} supports </div>
            {page !== 1 && page !== 2 && page !== 3 && matchesMd && (
              <Button
                variant="contained"
                onClick={goToSupportSelection}
                className={classes.blackButton}
              >
                Add New Item
              </Button>
            )}
          </Grid>
        </DialogTitle>
        {content}
        {actions}
      </Dialog>
    </div>
  );
}
