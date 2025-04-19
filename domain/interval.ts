import { type Result, err, ok } from "@/lib/result";

export type IntervalUnit = (typeof intervalUnit)[keyof typeof intervalUnit];

export const intervalUnit = {
  monthly: 0,
  yearly: 1,
} as const;

export const intervalUnitNames: { [key in IntervalUnit]: string } = {
  [intervalUnit.monthly]: "月額",
  [intervalUnit.yearly]: "年額",
} as const;

export class Interval {
  private constructor(
    public readonly cycle: number,
    public readonly unit: IntervalUnit,
  ) {
    this.cycle = cycle;
    this.unit = unit;
  }

  public static factory(
    cycle: number,
    unit: IntervalUnit,
  ): Result<Interval, string> {
    if (cycle < 1) {
      return { type: err, error: "Invalid cycle" };
    }
    return { type: ok, value: new Interval(cycle, unit) };
  }
}
