import { OrdersPageView } from "@/components/features/orders/orders-page-view";

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <OrdersPageView scope="all" searchParams={searchParams} />;
}
