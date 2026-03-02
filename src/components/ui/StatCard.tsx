import type { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  iconColor: string;
  subtitle?: string;
}

/**
 * StatCard Component
 * 
 * Reusable stat card component displaying a metric with icon, title, value, and optional subtitle.
 * Follows the SIRE-ADMIN design pattern with modern card styling.
 */
export const StatCard = ({ title, value, icon: Icon, iconColor, subtitle }: StatCardProps) => {
  return (
    <div className="flex-1 min-w-[140px] rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-2 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${iconColor}15` }}>
          <Icon size={20} color={iconColor} />
        </div>
        <p className="font-inter text-sm text-gray-600 dark:text-gray-400">{title}</p>
      </div>
      <p className="font-poppins text-2xl font-semibold text-gray-900 dark:text-gray-50">
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 font-inter text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
};
