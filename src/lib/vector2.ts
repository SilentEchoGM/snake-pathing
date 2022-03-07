import { pipe } from "fp-ts/function";
import { ord as Ord, array as A } from "fp-ts";
export type Cardinal = "left" | "right" | "up" | "down";
export type Point = {
  x: number;
  y: number;
};

const add =
  (v1: Vector2) =>
  (v2: Vector2): Vector2 =>
    new Vector2(v1.x + v2.x, v1.y + v2.y);

const multiplyByScalar = (scalar: number) => (v1: Vector2) =>
  new Vector2(v1.x * scalar, v1.y * scalar);

/**
 *
 * @param subtrahend The Vector2 being subtracted.
 * @param minuend The Vector2 being subtracted from.
 */
const subtract = (subtrahend: Vector2) => (minuend: Vector2) =>
  pipe(subtrahend, multiplyByScalar(-1), (v) => add(minuend)(v));

const equal = (v1: Vector2) => (v2: Vector2) => v1.x === v2.x && v1.y === v2.y;

const magnitude = (v: Vector2) => Math.pow(v.x * v.x + v.y * v.y, 0.5);

const dotProduct = (v1: Vector2) => (v2: Vector2) => (radians: number) =>
  v1.magnitude * v2.magnitude * Math.cos(radians);

const crossProduct = (v1: Vector2) => (v2: Vector2) => (radians: number) =>
  v1.magnitude * v2.magnitude * Math.sin(radians);

const angle = (v1: Vector2) => (v2: Vector2) => {
  console.log("angle", { v1: v1.toString(), v2: v2.toString() });
  return Math.acos(
    (v1.x * v2.x + (v1.y * v2.y) / magnitude(v1)) * magnitude(v2)
  );
};

const sortIntoColumns = (vs: Vector2[], columnCount: number) =>
  pipe(
    vs,
    A.reduce<Vector2, Vector2[][]>(
      new Array(columnCount).map(() => []),
      (acc, v: Vector2) => [
        ...acc.slice(0, v.x),
        pipe(acc[v.x], A.append(v), A.sort(Vector2.Ord)),
        ...acc.slice(v.x + 1),
      ]
    )
  );

export class Vector2 implements Point {
  x: number;
  y: number;
  private printAs: string;

  constructor(x: number, y: number, printAs: string = null) {
    this.x = x;
    this.y = y;
    this.printAs = printAs;
  }

  static add = add;
  static subtract = subtract;
  static equal = equal;
  static multiplyByScalar = multiplyByScalar;
  static angle = angle;
  static crossProduct = crossProduct;
  static dotProduct = dotProduct;
  static sortIntoColumns = sortIntoColumns;
  static get Up() {
    return new Vector2(0, -1, "up");
  }
  static get Right() {
    return new Vector2(1, 0, "right");
  }
  static get Down() {
    return new Vector2(0, 1, "down");
  }
  static get Left() {
    return new Vector2(-1, 0, "left");
  }
  static get Ord() {
    return Ord.fromCompare((v1: Vector2, v2: Vector2) => {
      if (v1.x < v2.x) return -1;
      if (v1.x === v2.x && v1.y < v2.y) return -1;
      if (Vector2.equal(v1)(v2)) return 0;
      return 1;
    });
  }

  get magnitude() {
    return Math.pow(this.x * this.x + this.y * this.y, 0.5);
  }

  get clone() {
    return new Vector2(this.x, this.y, this.printAs);
  }
  get angleFromUp() {
    return (Math.atan2(this.y, this.x) * 180) / Math.PI;
  }
  get unit() {
    return new Vector2(this.x / this.magnitude, this.y / this.magnitude);
  }

  toString() {
    if (this.magnitude === 1) {
      if (this.x === 1) return "right";
      if (this.x === -1) return "left";
      if (this.y === 1) return "down";
      if (this.y === -1) return "up";
    }
    return this.printAs ?? `(${this.x},${this.y})`;
  }
}
