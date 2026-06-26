import type { OrderType } from "@/lib/api/types";

export type OrdersPageScope = "all" | "blasting" | "counter" | "report" | "posting";

export function getOrdersPageOrderType(scope: OrdersPageScope): OrderType | undefined {
  if (scope === "blasting") return "blasting";
  if (scope === "counter") return "counter";
  if (scope === "report") return "report_akun";
  if (scope === "posting") return "posting";
  return undefined;
}

export function getOrdersPageMeta(scope: OrdersPageScope) {
  switch (scope) {
    case "blasting":
      return {
        title: "Blasting",
        description: "Pantau semua tugas blasting dan progres terlaksana anggota.",
        createHref: "/orders/new?type=blasting",
      };
    case "counter":
      return {
        title: "Counter",
        description: "Pantau semua tugas counter narasi dan progres terlaksana anggota.",
        createHref: "/orders/new?type=counter",
      };
    case "report":
      return {
        title: "Report",
        description: "Pantau semua tugas report akun dan progres terlaksana anggota.",
        createHref: "/orders/new?type=report",
      };
    case "posting":
      return {
        title: "Posting",
        description: "Pantau semua tugas posting dan progres terlaksana anggota.",
        createHref: "/orders/new?type=posting",
      };
    default:
      return {
        title: "Overview",
        description: "Kelola draft, tugas aktif, progress terlaksana anggota, dan export pelaksanaan dari satu tempat.",
        createHref: "/orders/new",
      };
  }
}
