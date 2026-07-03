export const currency = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n ?? 0));

export const number = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-US").format(Number(n ?? 0));

export const dateShort = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
