/**
 * 问候语组件
 */

import { useMemo } from 'react';
import { t } from '@/lib/i18n';

interface GreetingProps {
  userName?: string;
}

// 时间段配置（可根据需要调整）
const TIME_PERIODS = {
  MORNING_START: 5,
  NOON_START: 12,
  AFTERNOON_START: 14,
  EVENING_START: 18,
  NIGHT_START: 22,
} as const;

export function Greeting({ userName }: GreetingProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    
    if (hour >= TIME_PERIODS.MORNING_START && hour < TIME_PERIODS.NOON_START) {
      return { text: t('greeting_morning'), icon: '🌅' };
    } else if (hour >= TIME_PERIODS.NOON_START && hour < TIME_PERIODS.AFTERNOON_START) {
      return { text: t('greeting_noon'), icon: '☀️' };
    } else if (hour >= TIME_PERIODS.AFTERNOON_START && hour < TIME_PERIODS.EVENING_START) {
      return { text: t('greeting_afternoon'), icon: '🌤️' };
    } else if (hour >= TIME_PERIODS.EVENING_START && hour < TIME_PERIODS.NIGHT_START) {
      return { text: t('greeting_evening'), icon: '🌆' };
    } else {
      return { text: t('greeting_night'), icon: '🌙' };
    }
  }, []);

  return (
    <div className="text-center text-white select-none">
      <h2 className="text-2xl font-light text-shadow">
        {greeting.text}
        {userName && <span className="ml-2">{userName}</span>}
      </h2>
    </div>
  );
}
