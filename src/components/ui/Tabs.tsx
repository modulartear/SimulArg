import React, { useState } from 'react'

interface TabsProps {
  tabs: Array<{
    label: string
    content: React.ReactNode
    icon?: string
  }>
  defaultTab?: number
}

export default function Tabs({ tabs, defaultTab = 0 }: TabsProps) {
  const [active, setActive] = useState(defaultTab)

  return (
    <div className="w-full">
      <div className="app-surface app-surface-muted flex gap-2 p-2 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={`px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition ${
              active === idx
                ? 'btn-main text-white shadow-md'
                : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6">{tabs[active].content}</div>
    </div>
  )
}
