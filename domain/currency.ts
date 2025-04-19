export type Currency = (typeof currency)[keyof typeof currency];

export const currency = {
  jpy: 0,
  usd: 1,
  eur: 2,
  gbp: 3,
  cny: 4,
  btc: 5,
} as const;
export const currencyNames = {
  [currency.jpy]: "日本円 (JPY)",
  [currency.usd]: "米ドル (USD)",
  [currency.eur]: "ユーロ (EUR)",
  [currency.gbp]: "英ポンド (GBP)",
  [currency.cny]: "人民元 (CNY)",
  [currency.btc]: "ビットコイン (BTC)",
} as const;
