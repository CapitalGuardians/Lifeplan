import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Fab from "@material-ui/core/Fab";
import api from "../../api";
import { DialogContent } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import DialogActions from "@material-ui/core/DialogActions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import _ from "lodash";
import InfoIcon from "@material-ui/icons/Info";
import Tooltip from "@material-ui/core/Tooltip";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { DARK_BLUE, LIGHT_BLUE } from "../../common/theme";
import TextField from "@material-ui/core/TextField";
import PlanItemGroupEditView from "./PlanItemGroupEditView";
import PlanAddEditor from "./PlanAddEditor";
import { useSelector } from "react-redux";
import Divider from "@material-ui/core/Divider";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import classNames from "classnames";
import {
  ADD_SUPPORT,
  calculateAllocated,
  calculateTotalCost,
  EDIT_SUPPORT,
  SUPPORTS_LIST,
  SUPPORTS_SELECTION
} from "./BudgetDashboard";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Toolbar from "@material-ui/core/Toolbar";
import DoughnutBody from "../../DoughnutChart/DoughnutBody";

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
  },
  planItemText: {
    textAlign: "left"
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  },
  appBar: {
    position: "relative"
  }
}));

export default function SupportItemDialog(props) {
  const {
    birthYear,
    postcode,
    planCategory,
    supportCategory,
    setPlanItemGroups,
    registrationGroups,
    page,
    setPage
  } = props;

  // React Hooks
  // list of all support items for this group
  const [supportItems, setSupportItems] = useState([]);
  // id of registration group
  const [registrationGroupId] = useState(null);
  // 0: large screen; 1: small screen (mobile)
  // number representing current page
  // 0: supports list; 1: supports selection; 2: edit support; 3: add support
  // const [page, setPage] = useState(
  //   openAddSupports === 0 ? SUPPORTS_LIST : SUPPORTS_SELECTION
  // );
  // set of support returned from search
  const [searchResults, setSearchResults] = useState([]);
  // text typed into search bar
  const [searchText, setSearchText] = useState("");
  // item that is being edited
  const [editedItem, setEditedItem] = useState(0);
  const [planItemGroup, setPlanItemGroup] = useState(0);

  const [registrationGroupIdFilter, setRegistrationGroupIdFilter] = useState(
    ""
  );

  const currentUser = useSelector(state => state.auth.currentUser);

  const classes = useStyles();

  // api call to load support items
  useEffect(() => {
    if (supportCategory.id === 3) {
      // load all categories under core supports
      let items = [];
      // TODO: no magic numbers
      const body = {
        birthYear: birthYear,
        postcode: postcode,
        registrationGroupId
      };
      Promise.all([
        api.SupportItemGroups.get({ ...body, supportCategoryID: 3 }),
        api.SupportItemGroups.get({ ...body, supportCategoryID: 4 }),
        api.SupportItemGroups.get({ ...body, supportCategoryID: 5 }),
        api.SupportItemGroups.get({ ...body, supportCategoryID: 6 })
      ]).then(responses => {
        _.map(responses, response => {
          // console.log(response.data);

          const newItems = response.data.map(supportItem => {
            return {
              ...supportItem,
              label: supportItem.name
            };
          });
          items = [...items, ...newItems];
        });
        setSupportItems(items);
        setSearchResults(items);
      });
    } else {
      // load single category
      api.SupportItemGroups.get({
        birthYear: birthYear,
        postcode: postcode,
        supportCategoryID: supportCategory.id,
        registrationGroupId
      }).then(response => {
        // console.log(response.data);
        const items = response.data.map(supportItem => {
          return {
            ...supportItem,
            label: supportItem.name
          };
        });

        setSupportItems(items);
        setSearchResults(items);
      });
    }
  }, [birthYear, postcode, supportCategory, registrationGroupId]);

  useEffect(() => {
    if (registrationGroupIdFilter !== "") {
      setSearchResults(
        _.filter(supportItems, {
          registrationGroupId: registrationGroupIdFilter
        })
      );
    } else {
      setSearchResults(supportItems);
    }
  }, [registrationGroupIdFilter, supportItems]);

  useEffect(() => {
    setSearchResults(
      supportItems.filter(s =>
        s.name.toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, supportItems]);

  const supportItemsGroupedByRegistrationGroup = _.groupBy(
    supportItems,
    "registrationGroupId"
  );

  function goToSupportsList() {
    setPage(SUPPORTS_LIST);
  }

  function goToSupportSelection() {
    setPage(SUPPORTS_SELECTION);
  }

  function goToEditSupport() {
    setPage(EDIT_SUPPORT);
  }

  function goToAddSupport() {
    setPage(ADD_SUPPORT);
  }

  function handleClose() {
    props.onClose();
  }

  function handleSelectRegistrationGroup(registrationGroupId) {
    setRegistrationGroupIdFilter(registrationGroupId);
    goToSupportSelection();
  }

  function handleAddPlanItemGroup(planItemGroup) {
    const { planItemGroups } = planCategory;
    console.log(planCategory);
    if (currentUser) {
      // TODO: handle registered users
      api.PlanItems.create(planCategory.id, planItemGroup).then(() => {
        setPlanItemGroups([planItemGroup, ...planItemGroups]);
      });
    } else {
      setPlanItemGroups([planItemGroup, ...planItemGroups]);
    }
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
    setPlanItemGroup(planItem);
    goToEditSupport();
  }

  function handleSearch(e) {
    setSearchText(e.target.value);
  }

  function handleDelete(planItemGroup) {
    // TODO: update for planItemGroups
    if (currentUser) {
      api.PlanItems.delete(planItemGroup.id).then(() => {
        setPlanItemGroups(
          _.difference(planCategory.planItemGroups, [planItemGroup])
        );
      });
    } else {
      setPlanItemGroups(
        _.difference(planCategory.planItemGroups, [planItemGroup])
      );
    }

    //saveToLocalStorage(planCategory.planItems);
  }

  function handleItemUpdate(planItemGroup, values) {
    // todo: update both for planItemGroups
    if (currentUser) {
      api.PlanItems.update(planItemGroup.id, values).then(() => {
        setPlanItemGroups(
          planCategory.planItemGroups.map(item => {
            if (planItemGroup === item) {
              return {
                ...item,
                ...values
              };
            }
            return item;
          })
        );
      });
    } else {
      setPlanItemGroups(
        planCategory.planItemGroups.map(item => {
          if (planItemGroup === item) {
            return {
              ...item,
              ...values
            };
          }
          return item;
        })
      );
    }
  }

  function renderPlanItemGroup(planItemGroup) {
    let supportItem;

    if (page === SUPPORTS_LIST) {
      supportItem = _.find(supportItems, supportItem => {
        return supportItem.id === planItemGroup.supportItemGroup;
      });
    } else if (page === SUPPORTS_SELECTION) {
      supportItem = _.find(supportItems, supportItem => {
        return supportItem.id === planItemGroup.id;
      });
    }

    return (
      supportItem != null && (
        <Grid item>
          <Grid container>
            <Fab
              className={
                page === SUPPORTS_SELECTION
                  ? classes.supportButtonLight
                  : classes.supportButtonDark
              }
              variant="extended"
              onClick={() => {
                if (page === SUPPORTS_SELECTION) {
                  handleSelectSupportItem(supportItem);
                }
                if (page === SUPPORTS_LIST) {
                  handleEditSupportItem(supportItem, planItemGroup);
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
              <Grid container alignContent="space-between">
                <Grid item xs={10}>
                  <Typography
                    className={classNames(
                      classes.buttonText,
                      classes.planItemText
                    )}
                  >
                    {page === SUPPORTS_LIST
                      ? planItemGroup.name
                      : supportItem.name}
                  </Typography>
                </Grid>
                {page === SUPPORTS_LIST && (
                  <Grid item>${calculateTotalCost(planItemGroup)}</Grid>
                )}
              </Grid>
            </Fab>
          </Grid>
        </Grid>
      )
    );
  }

  function renderSupportItemList(list) {
    return (
      <Grid container>
        <Grid container item xs={12} md={8} lg={7} alignItems="flex-start">
          {list.length === 0 ? (
            <div> Press Add New to add a support </div>
          ) : (
            list.map((planItemGroup, index) => (
              <Grid item key={index} xs={12} className={classes.list}>
                {renderPlanItemGroup(planItemGroup)}
              </Grid>
            ))
          )}
        </Grid>

        <Grid item md={4} lg={5}>
          <DoughnutBody
            allocated={calculateAllocated(planCategory.planItemGroups)}
            total={parseFloat(planCategory.budget)}
          />
        </Grid>
      </Grid>
    );
  }

  function renderPlanContent() {
    return (
      <>
        <DialogContent className={classes.dialogContent}>
          {renderSupportItemList(planCategory.planItemGroups)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={goToSupportSelection}>Add New</Button>
        </DialogActions>
      </>
    );
  }

  function renderSelectionContent() {
    return (
      <>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid item xs={12} lg={6} xl={8}>
              <TextField
                id={"support-item-select"}
                label={"Search for support items"}
                value={searchText}
                fullWidth
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} lg={6} xl={4}>
              <FormControl fullWidth>
                <InputLabel>Registration Group Filter</InputLabel>
                <Select
                  value={registrationGroupIdFilter}
                  onChange={event => {
                    setRegistrationGroupIdFilter(event.target.value);
                  }}
                >
                  {_.map(
                    supportItemsGroupedByRegistrationGroup,
                    (supportItems, key) => {
                      const registrationGroupId = parseInt(key);
                      return (
                        <MenuItem
                          key={registrationGroupId}
                          value={registrationGroupId}
                        >
                          {
                            _.find(registrationGroups, {
                              id: registrationGroupId
                            }).name
                          }
                        </MenuItem>
                      );
                    }
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Divider />
              {renderSupportItemList(searchResults)}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={goToSupportsList}>Back</Button>
          <Button onClick={goToSupportsList}>Save</Button>
        </DialogActions>
      </>
    );
  }

  function renderEditor() {
    return <PlanItemGroupEditView planItemGroup={planItemGroup} />;
  }

  function renderAdditionPage() {
    return (
      <PlanAddEditor
        supportItem={editedItem}
        redirectSelectionPage={goToSupportSelection}
        redirectSupports={goToSupportsList}
        save={handleAddPlanItemGroup}
      />
    );
  }

  function renderRegistrationGroupSelection() {
    return (
      <>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography>Please select a Registration Group</Typography>
            </Grid>
            {/* TODO improve performance */}
            {_.map(
              supportItemsGroupedByRegistrationGroup,
              (supportItems, key) => {
                const registrationGroup = _.find(registrationGroups, {
                  id: parseInt(key)
                });
                return (
                  <Grid item xs={12} xl={6} key={registrationGroup.id}>
                    <Button
                      size="large"
                      variant="contained"
                      fullWidth
                      className={classes.buttonText}
                      onClick={() =>
                        handleSelectRegistrationGroup(registrationGroup.id)
                      }
                    >
                      {registrationGroup.name}
                    </Button>
                  </Grid>
                );
              }
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </>
    );
  }

  let content;
  if (page === SUPPORTS_LIST) {
    content = renderPlanContent();
  } else if (page === SUPPORTS_SELECTION) {
    content = renderSelectionContent();
  } else if (page === EDIT_SUPPORT) {
    content = renderEditor();
  } else if (page === ADD_SUPPORT) {
    content = renderAdditionPage();
  } else {
    content = renderRegistrationGroupSelection();
  }

  return (
    <Dialog fullScreen open={props.open} onClose={handleClose}>
      <DialogTitle className={classes.dialogTitle}>
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {supportCategory.name}
          </Typography>
        </Toolbar>
      </DialogTitle>
      {content}
    </Dialog>
  );
}
