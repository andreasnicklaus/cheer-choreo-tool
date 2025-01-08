import Vue from "vue";

const state = Vue.observable({
  screen: {},
});

/* This assumes you're using default bootstrap breakpoint names */
/* You need to hardcode the breakpoint values if you want to support IE11 */
const style = getComputedStyle(document.body);
const xs = style.getPropertyValue("--breakpoint-xs").replace("px", "");
const sm = style.getPropertyValue("--breakpoint-sm").replace("px", "");
const md = style.getPropertyValue("--breakpoint-md").replace("px", "");
const lg = style.getPropertyValue("--breakpoint-lg").replace("px", "");
const xl = style.getPropertyValue("--breakpoint-xl").replace("px", "");

function onResize() {
  const width = document.getElementById("app").clientWidth;

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
}

/* Might want to debounce the event, to limit amount of calls */
window.onresize = onResize;
onResize();

export default state;
