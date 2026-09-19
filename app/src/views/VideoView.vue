<template>
  <BContainer data-view>
    <VideoExport />
  </BContainer>
</template>

<script lang="ts">
import VideoExport from "@/components/VideoExport.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "VideoView",
  components: { VideoExport },
});
</script>
