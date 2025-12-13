import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";

/**
 * Hook to handle email authentication deep links
 * Handles:
 * - Email confirmation links: https://wihngo.com/auth/confirm-email?email=...&token=...
 * - Password reset links: https://wihngo.com/auth/reset-password?email=...&token=...
 */
export function useAuthDeepLink() {
  const router = useRouter();

  useEffect(() => {
    // Handle initial URL when app is opened via link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleAuthUrl(url);
      }
    });

    // Handle URL when app is already running
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleAuthUrl(url);
    });

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAuthUrl(url: string) {
    try {
      const { hostname, path, queryParams } = Linking.parse(url);

      console.log("🔗 Deep link received:", { hostname, path, queryParams });

      // Handle wihngo.com URLs
      if (hostname === "wihngo.com" || hostname === "www.wihngo.com") {
        // Email confirmation
        if (path === "/auth/confirm-email") {
          const email = queryParams?.email as string;
          const token = queryParams?.token as string;

          if (email && token) {
            console.log("✅ Email confirmation deep link detected");
            router.push({
              pathname: "/auth/confirm-email" as any,
              params: { email, token },
            });
          } else {
            console.error("❌ Missing email or token in confirmation link");
          }
        }
        // Password reset
        else if (path === "/auth/reset-password") {
          const email = queryParams?.email as string;
          const token = queryParams?.token as string;

          if (email && token) {
            console.log("✅ Password reset deep link detected");
            router.push({
              pathname: "/auth/reset-password" as any,
              params: { email, token },
            });
          } else {
            console.error("❌ Missing email or token in reset link");
          }
        }
      }
      // Handle custom scheme URLs (wihngo://auth/...)
      else if (hostname === "auth") {
        if (path === "/confirm-email") {
          const email = queryParams?.email as string;
          const token = queryParams?.token as string;

          if (email && token) {
            console.log(
              "✅ Email confirmation deep link detected (custom scheme)"
            );
            router.push({
              pathname: "/auth/confirm-email" as any,
              params: { email, token },
            });
          }
        } else if (path === "/reset-password") {
          const email = queryParams?.email as string;
          const token = queryParams?.token as string;

          if (email && token) {
            console.log("✅ Password reset deep link detected (custom scheme)");
            router.push({
              pathname: "/auth/reset-password" as any,
              params: { email, token },
            });
          }
        }
      }
    } catch (error) {
      console.error("❌ Error handling auth deep link:", error);
    }
  }

  return null;
}
