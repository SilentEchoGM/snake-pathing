import { pipe } from "fp-ts/function";
import { record as R, array as A } from "fp-ts";
import { get, writable } from "svelte/store";
import { config } from "./config";
import type { Config } from "./config";
import { Vector2 } from "./vector2";
import { Pixel } from "./Pixel";
import type { PixelState } from "./Pixel";
import type { Blackboard } from "./blackboard";

export type Field = Pixel[][];

let traceId = 0;

const trace = (str) => (val) => {
  console.log(`${str} (traceId: ${++traceId})`, val);
  return val;
};

export const createFieldPixels = (width = 10, height = 10): Field =>
  pipe(
    A.replicate(width, []),
    A.mapWithIndex((x, _) => {
      const col = pipe(
        A.replicate(height, []),
        A.mapWithIndex((y, _) => new Pixel(new Vector2(x, y)))
      );
      return col;
    })
  );

export const changePixelState =
  (field: Field) =>
  (state: PixelState) =>
  ({ x, y }: Vector2): Field =>
    pipe(
      field,
      A.mapWithIndex((x1, column) =>
        pipe(
          column,
          A.mapWithIndex((y1, pixel) =>
            x1 === x && y1 === y ? pixel.changeState(state) : pixel
          )
        )
      )
    );

export const applyToPixel =
  (field: Field) =>
  (fn: (pixel: Pixel) => Pixel) =>
  ({ x, y }: Vector2): Field =>
    pipe(
      field,
      A.mapWithIndex((x1, column) =>
        pipe(
          column,
          A.mapWithIndex((y1, pixel) =>
            x1 === x && y1 === y ? fn(pixel) : pixel
          )
        )
      )
    );

export const applyToAllPixels = (
  field: Field,
  fn: (pixel: Pixel) => Pixel
): Field =>
  pipe(
    field,
    A.map((column) => pipe(column, A.map(fn)))
  );

export const spawnField = ({ width, height }): Field => {
  return createFieldPixels(width, height);
};

export const fieldStore = writable<Field>(spawnField(get(config)));

export const fieldToGraph = (field: Field) =>
  pipe(
    field,
    A.map((column) =>
      pipe(
        column,
        A.map(({ isFree }: Pixel) => (isFree ? 1 : 0))
      )
    )
  );

export const checkIfCoordIsField = (config: Config, coord: Vector2) =>
  coord.x >= 0 &&
  coord.y >= 0 &&
  coord.x < config.width &&
  coord.y < config.height;
