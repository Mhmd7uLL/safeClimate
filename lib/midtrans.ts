import "server-only";
import midtransClient from "midtrans-client";

export function getMidtransSnap() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.trim();

  const isProduction =
    process.env.MIDTRANS_IS_PRODUCTION?.trim().toLowerCase() === "true";

  if (!serverKey || !clientKey) {
    throw new Error("Midtrans API keys belum dikonfigurasi.");
  }

  return new midtransClient.Snap({
    isProduction,
    serverKey,
    clientKey,
  });
}
