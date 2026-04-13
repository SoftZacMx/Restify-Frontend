/**
 * WebSocket Context - Proveedor global de notificaciones en tiempo real
 * Basado en: websocket-frontend-guide.md
 */

import { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useWebSocket } from '@/presentation/hooks/useWebSocket';
import { useAuthStore } from '@/presentation/store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { showSuccessToast, showInfoToast, showWarningToast } from '@/shared/utils/toast';
import type {
  UseWebSocketReturn,
  OrderNotificationData,
  OnlineOrderNotificationData,
  WebSocketErrorData,
} from '@/domain/types';

// ============ CONTEXT ============

interface WebSocketContextValue extends UseWebSocketReturn {
  // Métodos adicionales si es necesario en el futuro
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

// ============ PROVIDER ============

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user, token } = useAuthStore();
  const queryClient = useQueryClient();

  // ============ HANDLERS DE ÓRDENES ============

  const handleOrderCreated = useCallback((data: OrderNotificationData) => {

    // Invalidar query de órdenes para refrescar la lista
    queryClient.invalidateQueries({ queryKey: ['orders'] });

    // Mostrar notificación
    const clientName = data.order.client || 'Cliente';
    const tableInfo = data.order.tableId ? `Mesa asignada` : 'Para llevar';
    
    showInfoToast(
      'Nueva Orden',
      `${clientName} - ${tableInfo} - $${data.order.total.toFixed(2)}`
    );

    // Reproducir sonido de notificación (opcional)
    playNotificationSound();
  }, [queryClient]);

  const handleOrderUpdated = useCallback((data: OrderNotificationData) => {
    // Invalidar query de órdenes para refrescar la lista
    queryClient.invalidateQueries({ queryKey: ['orders'] });

    showInfoToast('Orden Actualizada', data.message || 'Una orden ha sido modificada');
  }, [queryClient]);

  const handleOrderDelivered = useCallback((data: OrderNotificationData) => {
    // Invalidar query de órdenes para refrescar la lista
    queryClient.invalidateQueries({ queryKey: ['orders'] });

    const orderNumber = data.orderId.slice(-8).toUpperCase();
    showSuccessToast('Orden Entregada', `Orden #${orderNumber} fue entregada`);
  }, [queryClient]);

  const handleOrderCanceled = useCallback((data: OrderNotificationData) => {
    // Invalidar query de órdenes para refrescar la lista
    queryClient.invalidateQueries({ queryKey: ['orders'] });

    const orderNumber = data.orderId.slice(-8).toUpperCase();
    showWarningToast('Orden Cancelada', `Orden #${orderNumber} fue cancelada`);
  }, [queryClient]);

  const handleOrderNewOnline = useCallback((data: OnlineOrderNotificationData) => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });

    const type = data.orderType === 'DELIVERY' ? 'Domicilio' : 'Recolección';
    showInfoToast(
      '🔔 Nuevo pedido online',
      `${data.customerName} — ${type} — $${data.total.toFixed(2)}`
    );

    playOnlineOrderSound();
  }, [queryClient]);

  // ============ HANDLER DE ERRORES ============

  const handleError = useCallback((error: WebSocketErrorData) => {
    console.error('[WS Context] Error:', error);
    // No mostrar toast para errores de WebSocket para no molestar al usuario
    // Solo logear en consola
  }, []);

  // ============ HANDLER DE CONEXIÓN ============

  const handleConnectionChange = useCallback((_connected: boolean) => {
    // Opcional: mostrar indicador visual de conexión
  }, []);

  // ============ HOOK DE WEBSOCKET ============

  const websocket = useWebSocket({
    userId: user?.id || '',
    token: token || '', // Opcional: el backend puede usar la cookie HttpOnly para autenticar
    autoConnect: !!user, // Conectar cuando hay usuario; la cookie se envía automáticamente (same-origin)
    onOrderCreated: handleOrderCreated,
    onOrderUpdated: handleOrderUpdated,
    onOrderDelivered: handleOrderDelivered,
    onOrderCanceled: handleOrderCanceled,
    onOrderNewOnline: handleOrderNewOnline,
    onError: handleError,
    onConnectionChange: handleConnectionChange,
  });

  // No renderizar provider si no hay usuario autenticado
  // El WebSocket se conectará automáticamente cuando haya credenciales

  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

// ============ HOOK PARA CONSUMIR CONTEXT ============

export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}

// ============ UTILIDADES ============

/**
 * Reproduce un sonido de notificación
 */
function playNotificationSound() {
  try {
    if (typeof Audio !== 'undefined') {
      // const audio = new Audio('/sounds/notification.mp3');
      // audio.volume = 0.5;
      // audio.play().catch(() => {});
    }
  } catch {
    // Silenciar fallo de reproducción
  }
}

/**
 * Sonido llamativo para nuevo pedido online (3 tonos ascendentes)
 */
function playOnlineOrderSound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const notes = [
      { freq: 587.33, start: 0, duration: 0.15 },     // D5
      { freq: 739.99, start: 0.15, duration: 0.15 },   // F#5
      { freq: 880.00, start: 0.30, duration: 0.30 },   // A5
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.4, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration);
    });
  } catch {
    // Silenciar fallo de audio
  }
}
