import Vue from "vue";
import { debug } from "./logging";

const state = Vue.observable({
  screen: {},
});

const style = getComputedStyle(document.body);
const xs = style.getPropertyValue("--breakpoint-xs").replace("px", "");
const sm = style.getPropertyValue("--breakpoint-sm").replace("px", "");
const md = style.getPropertyValue("--breakpoint-md").replace("px", "");
const lg = style.getPropertyValue("--breakpoint-lg").replace("px", "");
const xl = style.getPropertyValue("--breakpoint-xl").replace("px", "");

function onResize() {
  const width = document.getElementById("app")?.clientWidth || 1900;

  /* Not really sure how to properly define gt or lt */
  state.screen = {
    width,
    mobile: width < md,
    xs: width >= xs && width < sm,
    sm: width >= sm && width < md,
    md: width >= md && width < lg,
    lg: width >= lg && width < xl,
    xl: width >= xl,
    /* Greater than */
    gt: {
      xs: width >= xs,
      sm: width >= sm,
      md: width >= md,
      lg: width >= lg,
      xl: width >= xl,
    },
    /* Less than */
    lt: {
      xs: width < sm,
      sm: width < md,
      md: width < lg,
      lg: width < xl,
      xl: width < 9999,
    },
  };
  debug("Window resized", { width, screen: state.screen });
}

/* Might want to debounce the event, to limit amount of calls */
window.onresize = onResize;
onResize();

/**
 * @typedef Breakpoints
 * @property {object} screen
 * @property {number} screen.width
 * @property {boolean} screen.mobile
 * @property {boolean} screen.xs
 * @property {boolean} screen.sm
 * @property {boolean} screen.md
 * @property {boolean} screen.lg
 * @property {boolean} screen.xl
 * @property {object} screen.gt
 * @property {boolean} screen.gt.xs
 * @property {boolean} screen.gt.sm
 * @property {boolean} screen.gt.md
 * @property {boolean} screen.gt.lg
 * @property {boolean} screen.gt.xl
 * @property {object} screen.lt
 * @property {boolean} screen.lt.xs
 * @property {boolean} screen.lt.sm
 * @property {boolean} screen.lt.md
 * @property {boolean} screen.lt.lg
 * @property {boolean} screen.lt.xl
 */

export default state;
