import { pipe } from "fp-ts/function";
import { array as A, option as O } from "fp-ts";
import { get } from "svelte/store";
import { config } from "./config";
import type { Snake } from "./snake";
import { Vector2 } from "./vector2";

export const spawnFood = (snake: Snake): Vector2 => {
  const $config = get(config);

  const tries = [];
  do {
    const newTry: Vector2 = new Vector2(
      Math.floor(Math.random() * $config.width),
      Math.floor(Math.random() * $config.height)
    );
    console.log("newTry", newTry);
    if (tries.includes(JSON.stringify(newTry))) continue;
    const pixels = [snake.head, ...snake.body];
    const isSnake = pipe(
      pixels,
      A.findFirst((pixel) => pixel.x === newTry.x && pixel.y === newTry.y),
      O.isSome
    );
    if (!isSnake) {
      return newTry;
    }
    tries.push(JSON.stringify(newTry));
  } while (tries.length < 15);
  throw new Error("Spent too long trying to spawn food.");
};
