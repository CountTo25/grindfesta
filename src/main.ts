import { mount } from "svelte";
import "./app.css";
import "./ui.css";
import App from "./App.svelte";

///pre
//@ts-ignore
window.__debug = {};
///

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
