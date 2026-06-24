import { OrdersPageView } from "@/components/features/orders/orders-page-view";

export default function OrdersPostingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <OrdersPageView scope="posting" searchParams={searchParams} />;
}
