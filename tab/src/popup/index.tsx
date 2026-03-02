import React from 'react';
import ReactDOM from 'react-dom/client';
import { Popup } from './Popup';
import { initI18n } from '@/lib/i18n';
import { logger } from '@/lib/utils/logger';
import './index.css';
import '../themes/index.css';

const root = document.getElementById('root');

if (root) {
  initI18n()
    .then(() => {
      ReactDOM.createRoot(root).render(
        <React.StrictMode>
          <Popup />
        </React.StrictMode>
      );
    })
    .catch((error) => {
      logger.error('Failed to initialize i18n:', error);
    });
}
