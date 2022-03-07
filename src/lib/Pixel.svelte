<script lang="ts">
  import type { PixelState } from "./Pixel";

  import { snake } from "./snake";
  import { Vector2 } from "./vector2";

  export let state: PixelState,
    planned: boolean = false,
    x: number,
    y: number;

  $: console.log("Neck angle:", $snake?.getNeck()?.angleFromUp);

  $: console.log("magnitude", new Vector2(3, 4).angleFromUp);
</script>

<div class={`pixel ${state}`} class:planned>
  <br />
  {x},{y}{#if state === "head"}
    <div
      class="eyes"
      style={state === "head"
        ? `transform: rotate(${90 - $snake.getNeck().angleFromUp}deg)`
        : ""}>
      <div class="eye left" />
      <div class="eye right" />
    </div>
  {/if}
</div>

<style>
  .body {
    background-color: green;
  }
  .head {
    background-color: orange;
  }
  .planned {
    background-color: lightblue;
  }
  .food {
    background-color: red;
  }
  .pixel {
    position: relative;
    border: dashed 1px grey;
  }
  .eyes {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }
  .eye {
    border-radius: 100%;
    background-color: red;
    width: 8px;
    height: 8px;
    position: absolute;
    top: 3px;
  }
  .eye.left {
    left: 5px;
  }

  .eye.right {
    right: 5px;
  }
</style>
