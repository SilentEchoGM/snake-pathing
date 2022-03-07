import { get } from "svelte/store";
import { config } from "./config";
import { changePixelState, fieldStore } from "./field";
import { snake, spawn } from "./snake";
import { blackboard } from "./blackboard";
import { planAStar } from "./planner";
import { render } from "./render";
import { spawnFood } from "./food";
import { pipe } from "fp-ts/function";
import { Vector2 } from "./vector2";

export const restart = () => {
  const { width, height, spawnLength, pixelSize } = get(config);

  const newSnake = spawn(spawnLength, 0, 0);
  const food = spawnFood(newSnake);
  const board = {
    food,
    width,
    height,
    memory: [],
    pixelSize,
    plan: [],
  };

  //1st render
  const field = render(width, height, newSnake, food);
  const newPlan = planAStar(newSnake, field, food);

  //2nd render
  const plannedField = render(width, height, newSnake, food, newPlan);

  snake.set(newSnake);
  fieldStore.set(plannedField);
  blackboard.set({ ...board, plan: newPlan });
};

export const nextTick = () => {
  const $board = get(blackboard);
  const $snake = get(snake);
  const $config = get(config);

  const next = pipe($board.plan[0], Vector2.subtract($snake.head));

  const grow = Vector2.equal($board.plan[0])($board.food);
  console.log("NT256", {
    grow,
    next: next.toString(),
    food: $board.food.toString(),
  });
  let newSnake = $snake.move(next, $config, grow);

  const food = grow ? spawnFood(newSnake) : $board.food;
  console.log("NT256: moved to", next);

  //1st pass
  const field = render($board.width, $board.height, newSnake, food);
  console.log("nextTick field", { field: field, snake: newSnake });
  const newPlan = planAStar(newSnake, field, food);
  // planHamilton(newSnake, field).then((newPlan) => {
  const plannedField = render(
    $board.width,
    $board.height,
    newSnake,
    food,
    newPlan
  );
  snake.set(newSnake);
  fieldStore.set(plannedField);
  blackboard.set({ ...$board, food, plan: newPlan });
  // });
  //2nd pass
};
