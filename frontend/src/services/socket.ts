import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to NearKart Realtime Engine:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ Socket disconnected:', reason);
    });
  }
  return socket;
}

export function subscribeToOrderTracking(orderId: string, onUpdate: (data: any) => void) {
  const s = getSocket();
  s.emit('join_order_room', orderId);
  s.on(`order_update:${orderId}`, onUpdate);

  return () => {
    s.emit('leave_order_room', orderId);
    s.off(`order_update:${orderId}`, onUpdate);
  };
}

export function subscribeToDriverLocations(onDriverUpdate: (data: any) => void) {
  const s = getSocket();
  s.on('driver_location', onDriverUpdate);

  return () => {
    s.off('driver_location', onDriverUpdate);
  };
}

