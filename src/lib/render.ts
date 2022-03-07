import { pipe } from "fp-ts/function";
import { array as A } from "fp-ts";
import { applyToPixel, changePixelState } from "./field";
import type { Field } from "./field";
import { createFieldPixels } from "./field";
import type { Snake } from "./snake";
import type { Vector2 } from "./vector2";

let traceId = 0;

const trace =
  (str: string) =>
  <T>(val: T): T => {
    console.log(`${str} (traceId: ${++traceId})`, val);
    return val;
  };

const renderHead =
  (snake: Snake) =>
  (field: Field): Field =>
    changePixelState(field)("head")(snake.head);

const renderBody =
  (snake: Snake) =>
  (field: Field): Field =>
    pipe(
      snake.body,
      trace("render:renderBody:in"),
      A.reduce(field, (accPixels, coord) =>
        changePixelState(accPixels)("body")(coord)
      ),
      trace("render:renderBody:out")
    );

const renderSnake =
  (snake: Snake) =>
  (field: Field): Field =>
    pipe(field, renderHead(snake), renderBody(snake));

const renderFood =
  (coord: Vector2) =>
  (field: Field): Field =>
    pipe(coord, changePixelState(field)("food"));

const renderPlanned = (coords: Vector2[]) => (field: Field) =>
  pipe(
    coords,
    trace("render:renderPlanned:in"),
    A.reduce(field, (acc, coord) => applyToPixel(acc)((p) => p.plan())(coord)),
    trace("render:renderPlanned:out")
  );

export const render = (
  width: number,
  height: number,
  snake: Snake,
  food: Vector2,
  plan: Vector2[] = []
) =>
  pipe(
    createFieldPixels(width, height),
    renderSnake(snake),
    renderFood(food),
    renderPlanned(plan)
  );
