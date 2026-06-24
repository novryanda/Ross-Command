import { OrdersPageView } from "@/components/features/orders/orders-page-view";

export default function OrdersCounterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <OrdersPageView scope="counter" searchParams={searchParams} />;
}
