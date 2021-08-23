<script>
  import { onMount } from "svelte";
  export let bindControl;
  export let control;
  export let cssClass = "control";
  let el;
  onMount(() => {
    bindControl(el, control);
  });
</script>

<div class={cssClass}><div bind:this={el} /></div>

<style lang="scss">
  @import "./vars";

  .input-control {
    z-index: 1;
    width: calc(100% - #{$socket-size + 2 * $socket-margin});
    vertical-align: middle;
    display: inline-block;
  }
  .control {
    padding: $socket-margin $socket-size/2 + $socket-margin;
  }
</style>
