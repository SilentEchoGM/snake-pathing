import { aStar, Graph, GridNode } from "./aStar";
import { fieldToGraph } from "./field";
import type { Field } from "./field";
import type { Snake } from "./snake";
import { pipe } from "fp-ts/function";
import { array as A } from "fp-ts";
import { Vector2 } from "./vector2";
// import { hamCycle } from "./hamilton";

let traceId = 0;

const trace = (str) => (val) => {
  console.log(`${str} (traceId: ${++traceId})`, val.toString());
  return val;
};

const resultToPath = (result: GridNode[]): Vector2[] =>
  pipe(
    result,
    trace("resultToPath: input"),
    A.map(({ x, y }) => {
      return new Vector2(x, y);
    }),
    trace("resultToPath: output")
  );

export const planAStar = (snake: Snake, field: Field, food: Vector2) => {
  const raw = fieldToGraph(field);
  console.log("Raw", raw);
  const graph = new Graph(raw, {});
  const start = graph.grid[snake.head.x][snake.head.y];
  const end = graph.grid[food.x][food.y];

  const result = aStar.search(graph, start, end, {});

  console.log("astar", result);

  return resultToPath(result);
};

// export const planHamilton = async (
//   snake: Snake,
//   field: Field
// ): Promise<Vector2[]> => {
//   const raw = field.flat().map(({ location }) => location);
//   return await hamCycle(snake, raw);
// };
