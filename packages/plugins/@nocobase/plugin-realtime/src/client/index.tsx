/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Plugin } from '@nocobase/client';

type MessageHandler = (data: any) => void;

interface RealtimeClient {
  subscribe: (channel: string, handler: MessageHandler) => void;
  unsubscribe: (channel: string, handler: MessageHandler) => void;
  connected: boolean;
}

const RealtimeContext = createContext<RealtimeClient>({
  subscribe: () => {},
  unsubscribe: () => {},
  connected: false,
});

export const useRealtime = () => useContext(RealtimeContext);

/**
 * Hook to subscribe to a WebSocket channel and get live updates.
 *
 * Usage:
 *   const { data } = useRealtimeChannel('collection:orders');
 *   // data updates whenever an order is created/updated/deleted
 */
export const useRealtimeChannel = (channel: string) => {
  const { subscribe, unsubscribe } = useRealtime();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const handler = (msg: any) => setData(msg);
    subscribe(channel, handler);
    return () => unsubscribe(channel, handler);
  }, [channel, subscribe, unsubscribe]);

  return { data };
};

const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(new Map<string, Set<MessageHandler>>());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws`;

    const connect = () => {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnected(true);
        // Re-subscribe to all channels
        for (const channel of handlersRef.current.keys()) {
          ws.send(JSON.stringify({ type: 'subscribe', channel }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const channel = msg.channel;
          if (channel && handlersRef.current.has(channel)) {
            for (const handler of handlersRef.current.get(channel)!) {
              handler(msg);
            }
          }
        } catch { /* ignore */ }
      };

      ws.onclose = () => {
        setConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      wsRef.current = ws;
    };

    connect();
    return () => { wsRef.current?.close(); };
  }, []);

  const subscribe = useCallback((channel: string, handler: MessageHandler) => {
    if (!handlersRef.current.has(channel)) {
      handlersRef.current.set(channel, new Set());
      // Send subscribe message
      wsRef.current?.readyState === 1 &&
        wsRef.current.send(JSON.stringify({ type: 'subscribe', channel }));
    }
    handlersRef.current.get(channel)!.add(handler);
  }, []);

  const unsubscribe = useCallback((channel: string, handler: MessageHandler) => {
    handlersRef.current.get(channel)?.delete(handler);
    if (handlersRef.current.get(channel)?.size === 0) {
      handlersRef.current.delete(channel);
      wsRef.current?.readyState === 1 &&
        wsRef.current.send(JSON.stringify({ type: 'unsubscribe', channel }));
    }
  }, []);

  return (
    <RealtimeContext.Provider value={{ subscribe, unsubscribe, connected }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export class PluginRealtimeClient extends Plugin {
  async load() {
    this.app.addComponents({ RealtimeProvider });
  }
}

export default PluginRealtimeClient;
export { RealtimeProvider, RealtimeContext };
