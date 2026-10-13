import { render, screen } from "@testing-library/react";
import SubscriptionBillingInformationCardPresentation from "components/domain/subscription/subscription-billing-information-card.presentation";
import { getDaysInMonth, getDaysInYear } from "date-fns";

import { describe, expect, test } from "bun:test";
import { currencyId, timeUnit } from "@/domain/type";

import type { SubscriptionDetail, UpdateCycle } from "@/domain/type";

describe("SubscriptionBillingInformationCardPresentation", () => {
  test("日次サブスクコスト計算", () => {
    const mock: SubscriptionDetail = {
      id: "1",
      name: "Netflix",
      active: true,
      fee: 1500,
      amount: 100,
      currencyId: currencyId.usd,
      updateCycle: { number: 2, unit: timeUnit.day } as UpdateCycle,
      nextUpdate: new Date("2023-12-01"),
    };

    render(
      <SubscriptionBillingInformationCardPresentation subscription={mock} />,
    );

    // 各種表示内容の検証
    const today = new Date();
    const dailyCost = mock.fee / mock.updateCycle.number;
    const monthlyCost = dailyCost * getDaysInMonth(today);
    const yearlyCost = dailyCost * getDaysInYear(today);
    expect(screen.getByText(`¥${monthlyCost.toLocaleString()}`)).toBeTruthy();
    expect(screen.getByText(`¥${yearlyCost.toLocaleString()}`)).toBeTruthy();
  });
  test("月次サブスクコスト計算", () => {
    const mock: SubscriptionDetail = {
      id: "1",
      name: "Netflix",
      active: true,
      fee: 1500,
      amount: 100,
      currencyId: currencyId.usd,
      updateCycle: { number: 2, unit: timeUnit.month } as UpdateCycle,
      nextUpdate: new Date("2023-12-01"),
    };

    render(
      <SubscriptionBillingInformationCardPresentation subscription={mock} />,
    );

    // 各種表示内容の検証
    const monthlyCost = mock.fee / mock.updateCycle.number;
    const yearlyCost = monthlyCost * 12;
    expect(screen.getByText(`¥${monthlyCost.toLocaleString()}`)).toBeTruthy();
    expect(screen.getByText(`¥${yearlyCost.toLocaleString()}`)).toBeTruthy();
  });

  test("年次サブスクコスト計算", () => {
    const mock: SubscriptionDetail = {
      id: "1",
      name: "Netflix",
      active: true,
      fee: 1500,
      amount: 100,
      currencyId: currencyId.usd,
      updateCycle: { number: 2, unit: timeUnit.year } as UpdateCycle,
      nextUpdate: new Date("2023-12-01"),
    };

    render(
      <SubscriptionBillingInformationCardPresentation subscription={mock} />,
    );

    // 各種表示内容の検証
    const monthlyCost = mock.fee / mock.updateCycle.number / 12;
    const yearlyCost = monthlyCost;
    expect(screen.getByText(`¥${monthlyCost.toLocaleString()}`)).toBeTruthy();
    expect(screen.getByText(`¥${yearlyCost.toLocaleString()}`)).toBeTruthy();
  });
});
