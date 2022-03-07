import { get, writable } from "svelte/store";
import { config } from "./config";
import type { Vector2 } from "./vector2";

export type Blackboard = {
  food: Vector2;
  memory: Vector2[];
  plan: Vector2[];
  width: number;
  height: number;
  pixelSize: number;
};

const { width, height, pixelSize } = get(config);

export const blackboard = writable<Blackboard>({
  food: null,
  memory: [],
  plan: [],
  width,
  height,
  pixelSize,
});
