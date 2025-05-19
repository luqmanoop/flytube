import { render } from "preact";
import { Popup } from "./popup";

const container = document.getElementById("root");

if (container) {
  render(<Popup />, container);
}
