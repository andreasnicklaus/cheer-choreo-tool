import type { ComponentPublicInstance } from "vue";
import store from "@/store";
import { useToast } from "bootstrap-vue-next";

type ShowToastFn = ReturnType<typeof useToast>["create"];

declare module "vue" {
  interface ComponentCustomProperties {
    $store: typeof store;
    $refs: Record<string, ComponentPublicInstance | Element | null>;
    $showToast: ShowToastFn;
  }
}
