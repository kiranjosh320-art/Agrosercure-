import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against unhandled promise rejections from transient network socket closures
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const reasonStr = typeof reason === 'string' ? reason : reason?.message || String(reason || '');
  if (reasonStr.includes('WebSocket') || reasonStr.includes('websocket') || reasonStr.includes('Failed to fetch')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
