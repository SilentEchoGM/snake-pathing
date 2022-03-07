<script lang="ts">
  import { record as R } from "fp-ts";
  import { config } from "./config";
  import { nextTick, restart } from "./manager";
</script>

<div class="config-container">
  {#each R.keys($config).sort((a, b) => a.length - b.length) as key}
    <span>{key}</span><input type="number" bind:value={$config[key]} />
  {/each}

  <button on:click={restart}> Restart </button>
  <button on:click={nextTick}> Next Tick </button>
</div>

<style>
  .config-container {
    display: grid;
    grid-template-columns: 100px 50px;
    width: 150px;
    margin: 10px;
    row-gap: 4px;
  }

  button {
    grid-column-end: span 2;
  }
</style>
