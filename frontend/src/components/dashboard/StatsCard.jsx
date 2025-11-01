import React from 'react';

const StatsCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200'
  };

  const iconClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600'
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${colorClasses[color]} p-6`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className={`text-2xl ${iconClasses[color]}`}>
            {icon}
          </span>
        </div>
        <div className="ml-4 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd>
              <div className="text-lg font-semibold text-gray-900">
                {value}
              </div>
              {subtitle && (
                <div className="text-sm text-gray-500 mt-1">
                  {subtitle}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;