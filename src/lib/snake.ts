import { pipe } from "fp-ts/function";
import { array as A, option as O, record as R } from "fp-ts";
import { get, writable } from "svelte/store";
import type { Writable } from "svelte/store";
import { config } from "./config";
import type { Config } from "./config";
import { Vector2 } from "./vector2";
import { checkIfCoordIsField } from "./field";

export class Snake {
  head: Vector2;
  body: Vector2[];
  toArray: () => Vector2[];
  getNeck: () => Vector2;
  checkIfCoordIsBody: (coord: Vector2) => boolean;
  pickRandomFreeDirection: () => Vector2;
  checkIfCoordIsField: (config: Config, coord: Vector2) => boolean;

  constructor(head, body = []) {
    this.head = head;
    this.body = body;
    this.toArray = () => [this.head, ...this.body];
    this.toString = () => JSON.stringify(this.toArray());

    this.getNeck = () => {
      const horizontal = this.head.x - this.body[0].x;
      const vertical = this.head.y - this.body[0].y;

      if (horizontal > 0) return Vector2.Right;
      if (horizontal < 0) return Vector2.Left;
      if (vertical > 0) return Vector2.Up;
      if (vertical < 0) return Vector2.Down;
    };

    this.checkIfCoordIsBody = (coord: Vector2) =>
      pipe(
        this.body,
        A.findFirst((pixel) => pixel.x === coord.x && pixel.y === coord.y),
        O.isSome
      );
    this.pickRandomFreeDirection = () => {
      const possibles = [
        Vector2.Right,
        Vector2.Down,
        Vector2.Left,
        Vector2.Up,
      ].filter((dir) => {
        const v = Vector2.add(this.head)(dir);
        return (
          !this.checkIfCoordIsBody(v) && checkIfCoordIsField(get(config), v)
        );
      });

      if (!possibles.length) {
        console.error("Calamity!", this.toString());
        throw new Error("No directions are free! I'm trapped!");
      }
      const pick = possibles[Math.floor(Math.random() * possibles.length)];
      return pick;
    };
    this.checkIfCoordIsField = checkIfCoordIsField;
  }

  move(direction, config, grow = false) {
    console.log("move input", direction, config, grow);
    const newHead = Vector2.add(this.head)(direction);

    if (this.checkIfCoordIsBody(newHead)) {
      console.error("Calamity!", snake);
      throw new Error("Oh no! I hit my own body!");
    }

    if (!checkIfCoordIsField(config, newHead)) {
      console.error("Calamity!", snake);
      throw new Error(
        "Oh no! Outside the field is nothing except the impending heat death of the universe!"
      );
    }

    const newBody = grow ? this.path : [this.head, ...this.body.slice(0, -1)];

    console.log("M76: move", {
      head: this.head.toString(),
      newBody: newBody.toString(),
      oldBody: this.body.toString(),
    });
    return new Snake(newHead, newBody);
  }

  get path() {
    return [this.head, ...this.body];
  }

  get bounds() {
    const leftBound = pipe(this.path, A.sort(Vector2.Ord), (arr) =>
      A.reduce<Vector2, number>(arr[arr.length - 1].x, (min, v) => {
        if (v.x < min) return v.x;
        return min;
      })(arr)
    );
    const rightBound = pipe(
      this.path,
      A.reduce(0, (max, v) => {
        if (v.x > max) return v.x;
        return max;
      })
    );
    const upBound = pipe(this.path, A.sort(Vector2.Ord), (arr) =>
      A.reduce<Vector2, number>(arr[arr.length - 1].y, (min, v) => {
        if (v.y < min) return v.y;
        return min;
      })(arr)
    );
    const downBound = pipe(
      this.path,
      A.reduce(0, (max, v) => {
        if (v.y > max) return v.y;
        return max;
      })
    );
    return {
      left: leftBound,
      right: rightBound,
      up: upBound,
      down: downBound,
    };
  }
}

export const spawn = (length = null, x = null, y = null): Snake => {
  const $config = get(config);
  if (!length) length = $config.spawnLength;
  if (!x) x = Math.min($config.spawnLength + 1, $config.width / 2);
  if (!y) y = Math.min($config.spawnLength + 1, $config.height / 2);

  const head = new Vector2(x, y);

  let snake = new Snake(head);

  for (let i = 0; i < length; i++) {
    snake = snake.move(snake.pickRandomFreeDirection(), $config, true);
  }

  console.log("Spawning snake:", snake);
  return snake;
};

export const snake: Writable<Snake | null> = writable(null);
