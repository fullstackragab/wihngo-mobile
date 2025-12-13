/**
 * Server-Sent Events (SSE) Service
 * Handles real-time invoice event updates via SSE
 */

import { getAuthToken } from "@/lib/auth/auth-manager";
import type { InvoiceEvent } from "@/types/invoice";
import { getApiBaseUrl } from "./api-helper";

type EventListener = (event: InvoiceEvent) => void;

class SSEService {
  private eventSources: Map<string, EventSource> = new Map();
  private listeners: Map<string, Set<EventListener>> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  /**
   * Subscribe to invoice events
   */
  async subscribeToInvoice(
    invoiceId: string,
    onEvent: EventListener
  ): Promise<() => void> {
    // Add listener
    if (!this.listeners.has(invoiceId)) {
      this.listeners.set(invoiceId, new Set());
    }
    this.listeners.get(invoiceId)!.add(onEvent);

    // Create EventSource if not exists
    if (!this.eventSources.has(invoiceId)) {
      await this.createEventSource(invoiceId);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.get(invoiceId)?.delete(onEvent);

      // Close EventSource if no more listeners
      if (this.listeners.get(invoiceId)?.size === 0) {
        this.closeEventSource(invoiceId);
      }
    };
  }

  /**
   * Create EventSource for invoice
   */
  private async createEventSource(invoiceId: string): Promise<void> {
    try {
      const baseUrl = getApiBaseUrl();
      const token = await getAuthToken();

      // Note: EventSource in React Native requires polyfill
      // Install: npm install react-native-sse
      const url = `${baseUrl}/v1/invoices/${invoiceId}/events`;

      // For now, we'll use fetch with streaming (EventSource alternative)
      // In production, use a proper SSE library like react-native-sse
      this.startStreamingFetch(invoiceId, url, token);
    } catch (error) {
      console.error("Error creating EventSource:", error);
      this.handleReconnect(invoiceId);
    }
  }

  /**
   * Start streaming fetch (SSE alternative for React Native)
   */
  private async startStreamingFetch(
    invoiceId: string,
    url: string,
    token: string
  ): Promise<void> {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
      });

      if (!response.ok) {
        throw new Error(`SSE request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader!.read();

            if (done) {
              console.log("SSE stream closed");
              this.handleReconnect(invoiceId);
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                try {
                  const event: InvoiceEvent = JSON.parse(data);
                  this.notifyListeners(invoiceId, event);
                } catch (e) {
                  console.error("Error parsing SSE event:", e);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error processing SSE stream:", error);
          this.handleReconnect(invoiceId);
        }
      };

      processStream();
    } catch (error) {
      console.error("Error starting streaming fetch:", error);
      this.handleReconnect(invoiceId);
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(invoiceId: string): void {
    const attempts = this.reconnectAttempts.get(invoiceId) || 0;

    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(invoiceId, attempts + 1);
      const delay = this.reconnectDelay * Math.pow(2, attempts);

      console.log(
        `Reconnecting to SSE in ${delay}ms (attempt ${attempts + 1})`
      );

      setTimeout(() => {
        this.createEventSource(invoiceId);
      }, delay);
    } else {
      console.error("Max reconnect attempts reached");
      this.closeEventSource(invoiceId);
    }
  }

  /**
   * Notify all listeners of an event
   */
  private notifyListeners(invoiceId: string, event: InvoiceEvent): void {
    const listeners = this.listeners.get(invoiceId);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error("Error in event listener:", error);
        }
      });
    }
  }

  /**
   * Close EventSource for invoice
   */
  private closeEventSource(invoiceId: string): void {
    const eventSource = this.eventSources.get(invoiceId);
    if (eventSource) {
      // Note: For streaming fetch, we'd need to store the reader and cancel it
      this.eventSources.delete(invoiceId);
      this.listeners.delete(invoiceId);
      this.reconnectAttempts.delete(invoiceId);
    }
  }

  /**
   * Close all EventSources
   */
  closeAll(): void {
    this.eventSources.forEach((_, invoiceId) => {
      this.closeEventSource(invoiceId);
    });
  }
}

// Export singleton instance
export const sseService = new SSEService();
