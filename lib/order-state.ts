import type { Order } from "./types";

/**
 * Pure state transitions for an order, mirroring the backend escrow state
 * machine: held → handed-over → completed, with disputes freezing funds.
 * The server is the source of truth; these keep the UI optimistic.
 */
export function applyHandover(order: Order, at: string): Order {
  const timeline = order.timeline.map((s, i) => (i === 2 ? { ...s, done: true, at } : s));
  return { ...order, status: "handed-over", timeline };
}

export function applyConfirmReceipt(order: Order, at: string): Order {
  const timeline = order.timeline.map((s) => (s.done ? s : { ...s, done: true, at }));
  return { ...order, status: "completed", timeline };
}

export function applyDispute(order: Order, at: string): Order {
  const done = order.timeline.filter((s) => s.done);
  return {
    ...order,
    status: "disputed",
    timeline: [...done, { label: "Problem reported", at, done: true }, { label: "Naija Market review", done: false }],
  };
}

export function canConfirm(order: Order) {
  return order.status === "handed-over" || order.status === "held";
}

export function canDispute(order: Order) {
  return order.status === "held" || order.status === "handed-over";
}
