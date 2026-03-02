import React from 'react';
import ReactDOM from 'react-dom/client';
import { NewTab } from './NewTab';
import { initI18n } from '@/lib/i18n';
import { logger } from '@/lib/utils/logger';
import './index.css';

const root = document.getElementById('root');

if (root) {
  // 初始化 i18n 后再渲染
  initI18n()
    .then(() => {
      ReactDOM.createRoot(root).render(
        <React.StrictMode>
          <NewTab />
        </React.StrictMode>
      );
    })
    .catch((error) => {
      logger.error('Failed to initialize i18n:', error);
    });
}
