'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, X, Plus, Edit2, Trash2, Check } from 'lucide-react';

interface Staff {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  themen: string[];
  erreichbar: boolean;
  createdAt: string;
}

interface Toast {
  id: string;
  message: string;
}

const TOPIC_OPTIONS = [
  { label: 'Heizung', color: 'bg-orange-100 text-orange-800' },
  { label: 'Notfall', color: 'bg-red-100 text-red-800' },
  { label: 'Allgemein', color: 'bg-blue-100 text-blue-800' },
  { label: 'Neukunden', color: 'bg-green-100 text-green-800' },
  { label: 'Wartung', color: 'bg-purple-100 text-purple-800' },
  { label: 'Sonstiges', color: 'bg-gray-100 text-gray-800' },
];

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-teal-500',
];

const SEED_DATA: Staff[] = [
  {
    id: '1',
    vorname: 'Max',
    nachname: 'Mustermann',
    email: 'max.mustermann@hausverwaltung.de',
    telefon: '+49 30 123456789',
    themen: ['Heizung', 'Notfall'],
    erreichbar: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    vorname: 'Anna',
    nachname: 'Schmidt',
    email: 'anna.schmidt@hausverwaltung.de',
    telefon: '+49 30 987654321',
    themen: ['Allgemein', 'Neukunden'],
    erreichbar: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    vorname: 'Tom',
    nachname: 'Weber',
    email: 'tom.weber@hausverwaltung.de',
    telefon: '+49 30 555666777',
    themen: ['Wartung', 'Sonstiges'],
    erreichbar: false,
    createdAt: new Date().toISOString(),
  },
];

function getAvatarColor(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(vorname: string, nachname: string): string {
  return `${vorname[0]}${nachname[0]}`.toUpperCase();
}

function getTopicColor(topic: string): string {
  const topicOption = TOPIC_OPTIONS.find((t) => t.label === topic);
  return topicOption?.color || 'bg-gray-100 text-gray-800';
}

export default function MitarbeiterPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const hasLoaded = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Staff>>({
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    themen: [],
    erreichbar: true,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('immogreta_mitarbeiter');
    if (stored) {
      try {
        setStaff(JSON.parse(stored));
      } catch {
        setStaff(SEED_DATA);
      }
    } else {
      setStaff(SEED_DATA);
    }
    hasLoaded.current = true;
  }, []);

  // Save to localStorage – only after initial load to avoid wiping data on mount
  useEffect(() => {
    if (!hasLoaded.current) return;
    localStorage.setItem('immogreta_mitarbeiter', JSON.stringify(staff));
  }, [staff]);

  const showToast = (message: string) => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  const filteredStaff = staff.filter(
    (person) =>
      `${person.vorname} ${person.nachname}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      vorname: '',
      nachname: '',
      email: '',
      telefon: '',
      themen: [],
      erreichbar: true,
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (person: Staff) => {
    setFormData(person);
    setEditingId(person.id);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.vorname || !formData.nachname || !formData.email || !formData.telefon) {
      showToast('Bitte alle erforderlichen Felder ausfüllen');
      return;
    }

    if (editingId) {
      setStaff((prev) =>
        prev.map((p) =>
          p.id === editingId ? { ...p, ...formData } : p
        )
      );
      showToast('Gespeichert');
    } else {
      const newStaff: Staff = {
        ...(formData as Omit<Staff, 'id' | 'createdAt'>),
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setStaff((prev) => [...prev, newStaff]);
      showToast('Gespeichert');
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setStaff((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
    showToast('Gelöscht');
  };

  const toggleTopic = (topic: string) => {
    setFormData((prev) => {
      const themen = prev.themen || [];
      if (themen.includes(topic)) {
        return { ...prev, themen: themen.filter((t) => t !== topic) };
      } else {
        return { ...prev, themen: [...themen, topic] };
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mitarbeiter</h1>
        <p className="mt-2 text-gray-600">Verwaltung des Hausverwaltungs-Teams</p>
      </div>

      {/* Search and Add Button */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Nach Name oder Email suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Mitarbeiter erstellen
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Kontakt</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Themen</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Keine Mitarbeiter gefunden
                </td>
              </tr>
            ) : (
              filteredStaff.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                  {/* Avatar + Name + Email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`${getAvatarColor(
                          person.id
                        )} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm`}
                      >
                        {getInitials(person.vorname, person.nachname)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {person.vorname} {person.nachname}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail size={14} />
                          {person.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-700">
                      <Phone size={16} />
                      <span className="text-sm">{person.telefon}</span>
                    </div>
                  </td>

                  {/* Topics */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {person.themen.length === 0 ? (
                        <span className="text-sm text-gray-500">Keine Themen</span>
                      ) : (
                        person.themen.map((topic) => (
                          <span
                            key={topic}
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${getTopicColor(
                              topic
                            )}`}
                          >
                            {topic}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          person.erreichbar ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-sm text-gray-700">
                        {person.erreichbar ? 'Erreichbar' : 'Nicht erreichbar'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    {deleteConfirm === person.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Löschen?</span>
                        <button
                          onClick={() => handleDelete(person.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          <Check size={14} />
                          Ja
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                        >
                          <X size={14} />
                          Nein
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(person)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(person.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Vorname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname *
                </label>
                <input
                  type="text"
                  value={formData.vorname || ''}
                  onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Nachname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname *
                </label>
                <input
                  type="text"
                  value={formData.nachname || ''}
                  onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.telefon || ''}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Themen
                </label>
                <div className="space-y-2">
                  {TOPIC_OPTIONS.map((topic) => (
                    <label key={topic.label} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(formData.themen || []).includes(topic.label)}
                        onChange={() => toggleTopic(topic.label)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{topic.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Erreichbar */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.erreichbar || false}
                    onChange={(e) => setFormData({ ...formData, erreichbar: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Erreichbar</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 space-y-2 z-40">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
