import { App } from "../App";
import React from "react";
import ReactDOM from "react-dom";

import "../application.scss";

import * as Rails from "@rails/ujs";
Rails.start();

import * as Sentry from "@sentry/browser";
// TODO: SENTRY_DSN

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(<App />, document.querySelector("#app"));
});
