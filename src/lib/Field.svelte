<script lang="ts">
  import { blackboard } from "./blackboard";

  import { fieldStore } from "./field";
  import Pixel from "./Pixel.svelte";

  $: console.log("Blackboard", $blackboard);
</script>

<div
  class="field"
  style={`grid-template-rows: repeat(${$blackboard.width}, ${$blackboard.pixelSize}px); grid-template-columns: repeat(${$blackboard.height}, ${$blackboard.pixelSize}px);`}>
  {#each $fieldStore as column, x}
    {#each column as { state, planned }, y}
      <Pixel {state} {planned} {x} {y} />
    {/each}
  {/each}
</div>

<style>
  .field {
    display: grid;
    background-color: black;
    grid-auto-flow: column;
  }
  div {
    color: darkslategrey;
  }
</style>
