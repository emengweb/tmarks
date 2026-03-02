/**
 * Content Script Entry Point
 */

import { setupMessageHandler } from './handlers/message-handler';

// Initialize content script
setupMessageHandler();
