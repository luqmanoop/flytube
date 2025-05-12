import { render } from "preact";
import { App } from "./App";

const container = document.getElementById("root");

if (container) {
  render(<App />, container);
}
