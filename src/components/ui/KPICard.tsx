import React from 'react'

interface KPICardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const colorClasses = {
  primary: 'border-purple-500 bg-purple-50',
  success: 'border-green-500 bg-green-50',
  warning: 'border-yellow-500 bg-yellow-50',
  danger: 'border-red-500 bg-red-50',
}

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-600',
}

export default function KPICard({
  title,
  value,
  icon,
  change,
  trend = 'neutral',
  color = 'primary',
}: KPICardProps) {
  return (
    <div className={`border-l-4 rounded-lg p-6 shadow-md ${colorClasses[color]} transition-transform hover:scale-105`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-2 ${trendColors[trend]}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {Math.abs(change)}%
            </p>
          )}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
    </div>
  )
}