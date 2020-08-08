import React, { Component } from "react";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { TextField } from "@material-ui/core";

export default class ValidatedTextField extends Component {
  state = {
    clickedAway: false,
    clicked: false,
  };

  handleClickAway = () => {
    if (this.state.clicked) {
      this.setState({ clickedAway: true });
    }
  };

  handleClick = () => {
    this.setState({ clicked: true });
  };

  render() {
    const { error, errortext } = this.props;
    const showError =
      errortext != null && (error === true || this.state.clickedAway === true);
    return (
      <ClickAwayListener onClickAway={this.handleClickAway}>
        <TextField
          onClick={this.handleClick}
          {...this.props}
          helperText={showError === true ? errortext : this.props.helperText}
          error={showError}
        />
      </ClickAwayListener>
    );
  }
}
