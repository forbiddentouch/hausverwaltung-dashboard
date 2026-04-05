'use client'

import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'

interface Task {
  id: string
  icon: string
  name: string
  description: string
  enabled: boolean
  color: string
}

const initialTasks: Task[] = [
  {
    id: '1',
    icon: '🔥',
    name: 'Heizungsprobleme aufnehmen',
    description: 'Nimmt Heizungsstörungen auf und leitet sie an den zuständigen Techniker weiter.',
    enabled: true,
    color: 'orange',
  },
  {
    id: '2',
    icon: '🚨',
    name: 'Notdienst',
    description: 'Erkennt Notfälle und leitet sofort an den Notdienst weiter, sendet eine Benachrichtigung.',
    enabled: true,
    color: 'red',
  },
  {
    id: '3',
    icon: '👥',
    name: 'Mitarbeiteranfragen',
    description: 'Nimmt Mitarbeiteranfragen entgegen und informiert diese.',
    enabled: true,
    color: 'yellow',
  },
  {
    id: '4',
    icon: '💰',
    name: 'Verkaufs- und Akquiseanrufe aufnehmen',
    description: 'Nimmt Verkaufs- und Akquiseanrufe entgegen und sendet 3 Mal täglich eine Zusammenfassung.',
    enabled: true,
    color: 'blue',
  },
  {
    id: '5',
    icon: '🌱',
    name: 'Neukundenanfragen aufnehmen',
    description: 'Nimmt Neukundenanfragen entgegen und leitet sie weiter.',
    enabled: true,
    color: 'green',
  },
  {
    id: '6',
    icon: '📋',
    name: 'Unternehmensauskunft',
    description: 'Beantwortet allgemeine Fragen über das Unternehmen.',
    enabled: true,
    color: 'gray',
  },
  {
    id: '7',
    icon: '📞',
    name: 'Rückrufvereinbarung (Termin)',
    description: 'Vereinbart Rückruftermine für busy callers.',
    enabled: false,
    color: 'teal',
  },
  {
    id: '8',
    icon: '⭐',
    name: 'Bewerbungsanfragen aufnehmen',
    description: 'Nimmt Bewerbungsanfragen entgegen.',
    enabled: false,
    color: 'purple',
  },
]

const colorClasses: Record<string, { bg: string; icon: string }> = {
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600' },
  red: { bg: 'bg-red-50', icon: 'text-red-600' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  green: { bg: 'bg-green-50', icon: 'text-green-600' },
  gray: { bg: 'bg-slate-50', icon: 'text-slate-600' },
  teal: { bg: 'bg-teal-50', icon: 'text-teal-600' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
}

export default function AufgabenPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, enabled: !task.enabled } : task)))
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Aufgaben</h1>
          <p className="text-slate-600 text-sm mt-1">Konfigurieren Sie ImmoGreta Aufgaben nach Ihren Wünschen</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" />
          Neue Aufgabe hinzufügen
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-3 gap-4">
        {tasks.map((task) => {
          const colors = colorClasses[task.color] || colorClasses.gray
          return (
            <div key={task.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              {/* Icon and Header */}
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xl">{task.icon}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {/* Task Name */}
              <h3 className="text-sm font-semibold text-slate-800 mb-1">{task.name}</h3>

              {/* Description */}
              <p className="text-xs text-slate-500 mb-4 line-clamp-3">{task.description}</p>

              {/* Toggle */}
              <button
                onClick={() => handleToggleTask(task.id)}
                className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  task.enabled
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${task.enabled ? 'bg-green-500' : 'bg-slate-400'}`} />
                {task.enabled ? 'Aktiviert' : 'Deaktiviert'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
