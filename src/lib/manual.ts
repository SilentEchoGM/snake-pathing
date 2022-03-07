import { get } from "svelte/store";
import { blackboard } from "./blackboard";
import { nextTick } from "./manager";
import { snake } from "./snake";
import { Vector2 } from "./vector2";

export const registerControls = (doc: typeof document) => {
  doc.addEventListener("keypress", ({ key }) => {
    const controls = {
      w: Vector2.Up,
      d: Vector2.Right,
      s: Vector2.Down,
      a: Vector2.Left,
    };

    if (!Object.keys(controls).includes(key)) return;

    blackboard.update(($board) => {
      const { head } = get(snake);

      return {
        ...$board,
        plan: [Vector2.add(head)(controls[key]), ...$board.plan],
      };
    });
  });

  doc.addEventListener("keydown", ({ key }) => {
    if (key === " ") {
      nextTick();
    }
  });
};
