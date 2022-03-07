import { pipe } from "fp-ts/function";
import { array as A, option as O, record as R, ord as Ord } from "fp-ts";
import { Vector2 } from "./vector2";
import { fieldToGraph } from "./field";
import type { Field } from "./field";
import type { Snake } from "./snake";

/**
 *
 * @param v The Vector2 for the position on the field
 * @param path An array of the Vector2s that make up the path
 * @param i The index to check adjacency from
 * @returns true if the previous Vector2 in the path is a neighbor
 * and the new Vector2 is not already in the path.
 */
export const isSafe = (v: Vector2, path: Vector2[], i: number) => {
  if (Vector2.subtract(v)(path[i - 1]).magnitude !== 1) return false;
  return pipe(
    path,
    A.findFirst((p) => Vector2.equal(p)(v)),
    O.isNone
  );
};

export const hamCycleUtil = async (
  path: Vector2[],
  cur: number,
  nodes: Vector2[]
): Promise<[boolean, Vector2[]]> => {
  //Base case
  if (cur === nodes.length) {
    console.info("H946: End of field, confirming path existence.");
    if (Vector2.subtract(path[cur - 1])(path[0]).magnitude === 1) {
      console.info("H946: Path exists.");
      return [true, path];
    }
    console.warn("H946: No path exists.");
    return [false, path];
  }

  const result = pipe(
    nodes.slice(1),
    A.reduce(path, (acc, v) => {
      if (isSafe(v, acc, cur)) {
        const newPath = [...acc, v];
        if (hamCycleUtil(newPath, cur + 1, nodes)) {
          console.info(
            "H946: Increased Hamiltonian path length:",
            newPath.toString()
          );
          return newPath;
        }
      }
      return path;
    })
  );

  const status = result.length !== path.length;

  return [status, status ? result : path];
};

export const hamCycle = (snake: Snake, vs: Vector2[]): Promise<Vector2[]> =>
  new Promise((resolve, reject) => {
    console.log("H945: Searching for Hamiltonian path.");
    hamCycleUtil(snake.path, snake.path.length, vs).then(
      ([pathExists, result]) => {
        if (pathExists) {
          console.info("H945: Hamiltonian path found.", result.toString());
          resolve(result);
        } else {
          console.warn("H945: No Hamiltonian path available");
          reject([]);
        }
      }
    );
  });

export const getColumnPathSegment = (
  x: number,
  startY: number,
  endY: number
): Vector2[] =>
  pipe(
    new Array(endY - startY),
    A.mapWithIndex((i, _) => new Vector2(x, startY + i))
  );

export const getImmediateColumnPathSegment = (
  snake: Snake,
  rowCount
): Vector2[] | false => {
  const columnFreeUp = pipe(
    snake.body,
    A.filter((v) => v.x === snake.head.x && v.y < snake.head.y),
    A.isEmpty
  );

  if (columnFreeUp) {
    return getColumnPathSegment(snake.head.x, 0, snake.head.y);
  }

  const columnFreeDown = pipe(
    snake.body,
    A.filter((v) => v.x === snake.head.x && v.y > snake.head.y),
    A.isEmpty
  );

  if (columnFreeDown) {
    return getColumnPathSegment(snake.head.x, snake.head.y, rowCount);
  }
  return false;
};

//@TODO
export const simpleCycle = (snake: Snake, field: Field): Vector2[] => {
  const raw = fieldToGraph(field);
  const unoccupiedColPaths = pipe(
    raw,
    A.filterMapWithIndex((i, col) => {
      if (col.includes(0)) return O.none;
      return O.some(i);
    }),
    A.map((x) => getColumnPathSegment(x, 0, field[0].length))
  );

  if (Vector2.equal(snake.getNeck())(Vector2.Up)) {
    const pathStart = getImmediateColumnPathSegment(snake, field[0].length);
  }
};

export const findBestColumn = (snake: Snake, width: number, height: number) => {
  const rightCount = width - snake.bounds.right;
  const downCount = height - snake.bounds.down;
};
