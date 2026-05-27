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
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
              active === idx
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
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