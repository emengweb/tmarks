/**
 * Chrome 消息通信工具
 * 统一的消息发送函数，避免重复代码
 */

interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function sendMessage<T = unknown>(message: { type: string; payload?: unknown }): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: MessageResponse<T>) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response?.success) {
        reject(new Error(response?.error || 'Unknown error'));
        return;
      }
      resolve(response.data as T);
    });
  });
}
