<script lang="ts">
  import Config from "$lib/Config.svelte";

  import Field from "$lib/Field.svelte";
  import { restart } from "$lib/manager";
  import { snake } from "$lib/snake";
  import { onMount } from "svelte";

  $: $snake, console.log("Bounds", $snake?.bounds);
  onMount(() => {
    restart();
  });
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<Config />
<Field />
