import { OrdersPageView } from "@/components/features/orders/orders-page-view";

export default function OrdersBlastingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <OrdersPageView scope="blasting" searchParams={searchParams} />;
}
