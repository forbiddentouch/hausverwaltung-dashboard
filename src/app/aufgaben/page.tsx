'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: string;
  icon: string;
  name: string;
  description: string;
  enabled: boolean;
  color: string;
  createdAt: string;
}

interface Toast {
  id: string;
  message: string;
}

const seedTasks: Task[] = [
  {
    id: '1',
    icon: '🔥',
    name: 'Heizungsprobleme',
    description: 'Heizungsprobleme und Wartung',
    enabled: true,
    color: 'orange',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    icon: '🚨',
    name: 'Notdienst',
    description: 'Notfalldienst und Notfälle',
    enabled: true,
    color: 'red',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    icon: '👥',
    name: 'Mitarbeiteranfragen',
    description: 'Anfragen von Mitarbeitern',
    enabled: true,
    color: 'blue',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    icon: '💼',
    name: 'Verkaufs- und Akquiseanrufe',
    description: 'Verkaufs- und Geschäftsentwicklung',
    enabled: true,
    color: 'green',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    icon: '✨',
    name: 'Neukundenanfragen',
    description: 'Anfragen von neuen Kunden',
    enabled: true,
    color: 'yellow',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    icon: '📋',
    name: 'Unternehmensauskunft',
    description: 'Unternehmensauskünfte',
    enabled: true,
    color: 'teal',
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    icon: '📞',
    name: 'Rückrufvereinbarung',
    description: 'Rückrufvereinbarungen',
    enabled: true,
    color: 'purple',
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    icon: '🎯',
    name: 'Bewerbungsanfragen',
    description: 'Anfragen für Bewerbungen',
    enabled: true,
    color: 'gray',
    createdAt: new Date().toISOString(),
  },
];

const colorClasses: Record<string, string> = {
  orange: 'bg-orange-50',
  red: 'bg-red-50',
  yellow: 'bg-yellow-50',
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  gray: 'bg-slate-50',
  teal: 'bg-teal-50',
  purple: 'bg-purple-50',
};

const colorBorders: Record<string, string> = {
  orange: 'border-orange-200',
  red: 'border-red-200',
  yellow: 'border-yellow-200',
  blue: 'border-blue-200',
  green: 'border-green-200',
  gray: 'border-slate-200',
  teal: 'border-teal-200',
  purple: 'border-purple-200',
};

const colorSquares: Record<string, string> = {
  orange: 'bg-orange-100',
  red: 'bg-red-100',
  yellow: 'bg-yellow-100',
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  gray: 'bg-slate-100',
  teal: 'bg-teal-100',
  purple: 'bg-purple-100',
};

export default function AufgabenPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    icon: '',
    name: '',
    description: '',
    color: 'orange',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('immogreta_aufgaben');
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch {
        setTasks(seedTasks);
      }
    } else {
      setTasks(seedTasks);
    }
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem('immogreta_aufgaben', JSON.stringify(tasks));
  }, [tasks]);

  const showToast = (message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ icon: '', name: '', description: '', color: 'orange' });
    setIsModalOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setEditingId(task.id);
    setFormData({
      icon: task.icon,
      name: task.name,
      description: task.description,
      color: task.color,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      showToast('Bitte füllen Sie Name und Beschreibung aus');
      return;
    }

    if (editingId) {
      // Edit existing task
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingId
            ? {
                ...task,
                icon: formData.icon || '📋',
                name: formData.name,
                description: formData.description,
                color: formData.color,
              }
            : task
        )
      );
      showToast('Aufgabe aktualisiert');
    } else {
      // Add new task
      const newTask: Task = {
        id: Date.now().toString(),
        icon: formData.icon || '📋',
        name: formData.name,
        description: formData.description,
        enabled: true,
        color: formData.color,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, newTask]);
      showToast('Aufgabe hinzugefügt');
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ icon: '', name: '', description: '', color: 'orange' });
  };

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, enabled: !task.enabled } : task
      )
    );
    const task = tasks.find((t) => t.id === id);
    showToast(
      task?.enabled ? 'Aufgabe deaktiviert' : 'Aufgabe aktiviert'
    );
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setDeleteConfirm(null);
    showToast('Aufgabe gelöscht');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Aufgaben
            </h1>
            <p className="text-slate-600">
              Verwalten Sie Ihre Aufgaben und Prioritäten
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Neue Aufgabe hinzufügen
          </button>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`${colorClasses[task.color] || 'bg-slate-50'} border-2 ${
                colorBorders[task.color] || 'border-slate-200'
              } rounded-xl p-6 transition-all hover:shadow-lg`}
            >
              {/* Top Row: Icon Square and Buttons */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`${
                    colorSquares[task.color] || 'bg-slate-100'
                  } w-16 h-16 rounded-lg flex items-center justify-center text-3xl`}
                >
                  {task.icon}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(task)}
                    className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 hover:text-blue-600"
                    aria-label="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(task.id)}
                    className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Task Info */}
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {task.name}
              </h3>
              <p className="text-slate-600 text-sm mb-4">{task.description}</p>

              {/* Toggle Button */}
              <button
                onClick={() => handleToggle(task.id)}
                className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                  task.enabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {task.enabled ? (
                  <>
                    <CheckCircle2 size={18} />
                    Aktiviert
                  </>
                ) : (
                  <>
                    <Circle size={18} />
                    Deaktiviert
                  </>
                )}
              </button>

              {/* Delete Confirmation */}
              {deleteConfirm === task.id && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex flex-col gap-2 p-4 justify-center items-center">
                  <p className="text-white font-medium text-center">
                    Sicher löschen?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Löschen
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingId ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}
            </h2>

            <div className="space-y-4">
              {/* Icon Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Icon
                </label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="📋"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full px-4 py-2 text-2xl border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name*
                </label>
                <input
                  type="text"
                  placeholder="Aufgabenname"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Beschreibung*
                </label>
                <textarea
                  placeholder="Beschreibung"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Color Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Farbe
                </label>
                <select
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="orange">Orange</option>
                  <option value="red">Rot</option>
                  <option value="yellow">Gelb</option>
                  <option value="blue">Blau</option>
                  <option value="green">Grün</option>
                  <option value="gray">Grau</option>
                  <option value="teal">Teal</option>
                  <option value="purple">Lila</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-8 right-8 space-y-3 z-40">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in"
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Tailwind Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
