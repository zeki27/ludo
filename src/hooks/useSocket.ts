import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setSocket(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return socket;
}