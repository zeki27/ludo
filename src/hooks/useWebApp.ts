import { useState, useEffect } from 'react';

export function useWebApp() {
  const [webApp, setWebApp] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Check if we're in Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      setWebApp(tgWebApp);

      // Extract user ID from Telegram WebApp init data
      try {
        const initData = tgWebApp.initData;
        if (initData) {
          const urlParams = new URLSearchParams(initData);
          const userParam = urlParams.get('user');
          if (userParam) {
            const userData = JSON.parse(userParam);
            setUserId(userData.id.toString());
          }
        } else {
          // Fallback for development
          setUserId('dev_user_' + Math.random().toString(36).substr(2, 9));
        }
      } catch (error) {
        console.error('Error parsing Telegram WebApp data:', error);
        // Fallback for development
        setUserId('dev_user_' + Math.random().toString(36).substr(2, 9));
      }
    } else {
      // Development fallback
      setUserId('dev_user_' + Math.random().toString(36).substr(2, 9));
    }
  }, []);

  return { webApp, userId };
}