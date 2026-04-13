/**
 * Hook para WebSocket - Notificaciones en tiempo real
 * Basado en: websocket-frontend-guide.md
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  UseWebSocketOptions,
  UseWebSocketReturn,
  OrderNotificationData,
  OnlineOrderNotificationData,
  PaymentNotificationData,
  WebSocketErrorData,
  ConnectionAckData,
  WebSocketMessage,
} from '@/domain/types';

// URL del WebSocket (usar variable de entorno en producción)
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
const WS_PATH = '/socket.io';

/**
 * Genera un ID de conexión único
 */
const generateConnectionId = (): string => {
  return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Hook para manejar conexión WebSocket y notificaciones en tiempo real
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    userId,
    token,
    autoConnect = true,
    onOrderCreated,
    onOrderUpdated,
    onOrderDelivered,
    onOrderCanceled,
    onOrderNewOnline,
    onPaymentConfirmed,
    onPaymentFailed,
    onPaymentPending,
    onError,
    onConnectionChange,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  // Registrar conexión con el servidor
  const registerConnection = useCallback(() => {
    if (!socketRef.current || !userId || !token) return;

    const connId = generateConnectionId();

    socketRef.current.emit('register_connection', {
      connectionId: connId,
      userId: userId,
      token: token,
    });
  }, [userId, token]);

  // Conectar al WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    if (!userId) return;

    const socket = io(WS_URL, {
      path: WS_PATH,
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      auth: token ? { token } : { userId }, // Si no hay token en store, enviar userId; la cookie se envía igual
      withCredentials: true, // Enviar cookies (HttpOnly) en la conexión WebSocket
    });

    // ============ EVENTOS DE CONEXIÓN ============

    socket.on('connect', () => {
      setIsConnected(true);
      onConnectionChange?.(true);
      registerConnection();
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setConnectionId(null);
      onConnectionChange?.(false);
    });

    socket.on('connection_ack', (message: WebSocketMessage<ConnectionAckData>) => {
      setConnectionId(message.data.connectionId);
    });

    // ============ EVENTOS DE ÓRDENES ============

    socket.on('order_created', (message: WebSocketMessage<OrderNotificationData>) => {
      onOrderCreated?.(message.data);
    });

    socket.on('order_updated', (message: WebSocketMessage<OrderNotificationData>) => {
      onOrderUpdated?.(message.data);
    });

    socket.on('order_delivered', (message: WebSocketMessage<OrderNotificationData>) => {
      onOrderDelivered?.(message.data);
    });

    socket.on('order_canceled', (message: WebSocketMessage<OrderNotificationData>) => {
      onOrderCanceled?.(message.data);
    });

    socket.on('order_new_online', (message: WebSocketMessage<OnlineOrderNotificationData>) => {
      onOrderNewOnline?.(message.data);
    });

    socket.on('payment_confirmed', (message: WebSocketMessage<PaymentNotificationData>) => {
      onPaymentConfirmed?.(message.data);
    });

    socket.on('payment_failed', (message: WebSocketMessage<PaymentNotificationData>) => {
      onPaymentFailed?.(message.data);
    });

    socket.on('payment_pending', (message: WebSocketMessage<PaymentNotificationData>) => {
      onPaymentPending?.(message.data);
    });

    // ============ EVENTOS DE ERROR ============

    socket.on('error', (message: WebSocketMessage<WebSocketErrorData>) => {
      console.error('[WebSocket] Error:', message.data);
      onError?.(message.data);
    });

    socket.on('connect_error', (error: Error & { type?: string; description?: string; context?: unknown }) => {
      console.error('[WebSocket] Error de conexión:', {
        message: error.message,
        type: error.type,
        description: error.description,
        context: error.context,
        error,
      });
      onError?.({ message: error.message });
    });

    // ============ EVENTOS DE RECONEXIÓN ============

    socket.on('reconnect', () => {
      registerConnection();
    });

    socket.on('reconnect_error', (error) => {
      console.error('[WebSocket] Error de reconexión:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconexión falló después de todos los intentos');
      onError?.({ message: 'No se pudo reconectar al servidor' });
    });

    socketRef.current = socket;
    socket.connect();
  }, [
    userId,
    token,
    registerConnection,
    onOrderCreated,
    onOrderUpdated,
    onOrderDelivered,
    onOrderCanceled,
    onPaymentConfirmed,
    onPaymentFailed,
    onPaymentPending,
    onError,
    onConnectionChange,
  ]);

  // Desconectar del WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setConnectionId(null);
    }
  }, []);

  // Conectar al montar si autoConnect está habilitado (solo se exige userId; token opcional si backend lo pide)
  useEffect(() => {
    if (autoConnect && userId) connect();

    // Desconectar al desmontar
    return () => {
      disconnect();
    };
  }, [autoConnect, userId, token, connect, disconnect]);

  return {
    isConnected,
    connectionId,
    connect,
    disconnect,
  };
}
