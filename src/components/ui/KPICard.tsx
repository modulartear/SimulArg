import React from 'react'

interface KPICardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const bgGradients = {
  primary: 'from-indigo-500/18 via-fuchsia-500/10 to-transparent',
  success: 'from-emerald-500/18 via-teal-500/10 to-transparent',
  warning: 'from-amber-500/20 via-orange-500/10 to-transparent',
  danger: 'from-rose-500/20 via-pink-500/10 to-transparent',
}

const ringColors = {
  primary: 'ring-indigo-500/20',
  success: 'ring-emerald-500/20',
  warning: 'ring-amber-500/25',
  danger: 'ring-rose-500/25',
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
    <div
      className={`app-surface relative overflow-hidden p-6 ring-1 transition-transform hover:-translate-y-0.5 ${ringColors[color]}`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${bgGradients[color]}`} />
      <div className={`pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-gradient-to-br ${bgGradients[color]} blur-2xl`} />
      <div className="relative flex justify-between items-start gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600 truncate">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-2 font-semibold ${trendColors[trend]}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {Math.abs(change)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="shrink-0 rounded-xl bg-white/70 ring-1 ring-black/5 px-3 py-2 text-2xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
