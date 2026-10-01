import { OrderSuccessContent } from "@/components/order-success-content";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const parsedOrderId = orderId && /^\d+$/.test(orderId) ? Number(orderId) : null;
  return <OrderSuccessContent orderId={parsedOrderId} />;
}
