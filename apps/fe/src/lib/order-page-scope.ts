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
        description: "Pantau semua perintah blasting, progres submit anggota, dan tren aktivitas per periode.",
        createHref: "/orders/new?type=blasting",
      };
    case "counter":
      return {
        title: "Counter",
        description: "Pantau semua perintah counter narasi, progres submit anggota, dan tren pelaksanaan per periode.",
        createHref: "/orders/new?type=counter",
      };
    case "report":
      return {
        title: "Report",
        description: "Pantau semua perintah report akun, progres submit anggota, dan tren pelaporan per periode.",
        createHref: "/orders/new?type=report",
      };
    case "posting":
      return {
        title: "Posting",
        description: "Pantau semua perintah posting, progres submit anggota, dan tren publikasi per periode.",
        createHref: "/orders/new?type=posting",
      };
    default:
      return {
        title: "Overview",
        description: "Kelola draft, perintah aktif, progress submit anggota, dan export pelaksanaan dari satu tempat.",
        createHref: "/orders/new",
      };
  }
}
