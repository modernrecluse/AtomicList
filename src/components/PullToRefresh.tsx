import React from 'react';
import { RotateCcw } from 'lucide-react';

interface PullToRefreshProps {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  shouldTrigger: boolean;
  theme: {
    background: string;
    text: string;
    accent: string;
  };
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  isPulling,
  pullDistance,
  isRefreshing,
  shouldTrigger,
  theme
}) => {
  const opacity = Math.min(pullDistance / 80, 1);
  const rotation = (pullDistance / 80) * 360;

  if (!isPulling && !isRefreshing) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10"
      style={{
        backgroundColor: theme.background,
        transform: `translateY(${Math.min(pullDistance - 80, 0)}px)`,
        opacity: isRefreshing ? 1 : opacity,
        height: '80px'
      }}
    >
      <div
        className="flex items-center space-x-2 text-sm font-medium"
        style={{ color: theme.text }}
      >
        <RotateCcw
          size={20}
          className={`transition-transform duration-200 ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
            color: shouldTrigger ? theme.accent : theme.text
          }}
        />
        <span style={{ color: shouldTrigger ? theme.accent : theme.text }}>
          {isRefreshing
            ? 'Refreshing...'
            : shouldTrigger
            ? 'Release to refresh'
            : 'Pull to refresh'}
        </span>
      </div>
    </div>
  );
};

export default PullToRefresh;