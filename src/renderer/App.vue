<template>
  <div id="app" class="cursor-default select-none">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  created() {
    document.title = "Dawn Launcher";
  },
};
</script>
