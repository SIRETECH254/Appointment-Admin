import { Link } from 'react-router-dom';
import type { IconType } from 'react-icons';

interface ActivitySectionProps {
  title: string;
  icon: IconType;
  items: any[];
  onItemPress: (item: any) => void;
  renderItem: (item: any) => React.ReactNode;
  viewAllLink?: string;
}

/**
 * ActivitySection Component
 * 
 * Reusable activity section component for displaying recent activity items.
 * Includes section header with icon, clickable items, and optional "View All" link.
 */
export const ActivitySection = ({
  title,
  icon: Icon,
  items,
  onItemPress,
  renderItem,
  viewAllLink,
}: ActivitySectionProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={20} color="#D4AF37" />
          <h2 className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
            {title}
          </h2>
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-sm font-medium text-brand-primary transition hover:text-brand-accent">
            View All
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {items && items.length > 0 ? (
          items.slice(0, 5).map((item, index) => {
            const id = item._id || item.id || index;
            return (
              <div
                key={id}
                onClick={() => onItemPress(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onItemPress(item);
                  }
                }}
                className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                {renderItem(item)}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500">No recent activity</p>
        )}
      </div>
    </div>
  );
};
