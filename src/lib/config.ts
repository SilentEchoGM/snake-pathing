import { writable } from "svelte/store";

const defaultConfig = {
  width: 10,
  height: 10,
  pixelSize: 50,
  spawnLength: 4,
};

export type Config = typeof defaultConfig;

export const config = writable(defaultConfig);
