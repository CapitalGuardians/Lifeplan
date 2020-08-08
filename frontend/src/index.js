import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { CustomTheme } from "./common/theme";
import Provider from "react-redux/es/components/Provider";
import store from "./redux/store";
import { BrowserRouter, Route, Switch } from "react-router-dom";

ReactDOM.render(
  <MuiThemeProvider theme={CustomTheme}>
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route path="/" component={App} />
        </Switch>
      </BrowserRouter>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById("root")
);
