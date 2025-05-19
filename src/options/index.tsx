import { render } from "preact";
import Options from "./options";

const container = document.getElementById("root");

if (container) {
  render(<Options />, container);
}
