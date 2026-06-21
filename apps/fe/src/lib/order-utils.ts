import type { OrderType } from "@/lib/api/types";

export function isBlastingOrderType(orderType?: OrderType) {
  return orderType === "engagement" || orderType === "blasting";
}
