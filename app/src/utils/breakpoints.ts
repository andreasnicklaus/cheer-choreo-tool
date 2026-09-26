/**
 * Reactive breakpoint detection utilities
 * @module Util:Breakpoints
 */

/**
 * @typedef {object} Breakpoints
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

import { reactive } from "vue";
import { debug } from "./logging";

interface BreakpointValues {
  width: number;
  mobile: boolean;
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  gt: Record<string, boolean>;
  lt: Record<string, boolean>;
}

const state: { screen: BreakpointValues } = reactive({
  screen: {} as BreakpointValues,
});

const style = getComputedStyle(document.body);
const xs = parseInt(style.getPropertyValue("--breakpoint-xs")) || 0;
const sm = parseInt(style.getPropertyValue("--breakpoint-sm")) || 576;
const md = parseInt(style.getPropertyValue("--breakpoint-md")) || 768;
const lg = parseInt(style.getPropertyValue("--breakpoint-lg")) || 992;
const xl = parseInt(style.getPropertyValue("--breakpoint-xl")) || 1200;

function onResize() {
  const width = document.getElementById("app")?.clientWidth || 1900;

  state.screen = {
    width,
    mobile: width < md,
    xs: width >= xs && width < sm,
    sm: width >= sm && width < md,
    md: width >= md && width < lg,
    lg: width >= lg && width < xl,
    xl: width >= xl,
    gt: {
      xs: width >= xs,
      sm: width >= sm,
      md: width >= md,
      lg: width >= lg,
      xl: width >= xl,
    },
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

window.onresize = onResize;
onResize();

export default state;
