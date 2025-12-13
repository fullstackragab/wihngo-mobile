/**
 * Deep Link Handler for PayPal redirects
 * Handles deep links from PayPal checkout flow
 */

import { getInvoiceStatus } from "@/services/invoice.service";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export function usePayPalDeepLink() {
  const router = useRouter();

  useEffect(() => {
    // Handle initial URL (app opened from deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle deep links while app is running
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async (url: string) => {
    try {
      const { hostname, path, queryParams } = Linking.parse(url);

      // Check if this is a PayPal redirect
      // Expected format: wihngo://donation/paypal-return?invoiceId=xxx&status=success
      if (hostname === "donation" && path === "paypal-return") {
        const invoiceId = queryParams?.invoiceId as string;
        const status = queryParams?.status as string;

        if (invoiceId) {
          // Check invoice status
          const invoice = await getInvoiceStatus(invoiceId);

          // Navigate to result screen
          router.replace({
            pathname: "/donation/result",
            params: { invoiceId },
          });
        }
      }
    } catch (error) {
      console.error("Error handling deep link:", error);
    }
  };
}

/**
 * Get PayPal return URLs for deep linking
 */
export function getPayPalReturnUrls() {
  const scheme = Linking.createURL("/");

  return {
    return_url: `${scheme}donation/paypal-return?status=success`,
    cancel_url: `${scheme}donation/paypal-return?status=cancelled`,
  };
}
