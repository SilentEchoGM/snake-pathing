import type { Vector2 } from "./vector2";

const pixelEnum = ["head", "body", "food", "none"] as const;

export type PixelState = typeof pixelEnum[number];

export class Pixel {
  location: Vector2;
  planned: boolean;
  private _state: keyof typeof pixelEnum;

  constructor(location: Vector2, state: PixelState = "none", planned = false) {
    this.location = location.clone;
    this._state = pixelEnum.indexOf(state);
    this.planned = planned;
  }

  toString() {
    `|${this.location.toString()}:${(this.state as string).slice(1)}|`;
  }
  changeState(newState: PixelState) {
    return new Pixel(this.location.clone, newState);
  }
  get isFree() {
    return !(this.state === "head" || this.state === "body");
  }
  get state() {
    return pixelEnum[this._state] as PixelState;
  }
  plan() {
    return new Pixel(this.location, this.state, true);
  }
}
