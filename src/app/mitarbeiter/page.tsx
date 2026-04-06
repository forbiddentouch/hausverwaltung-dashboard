'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mail, Phone, X, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { supabase, getOrganizationId } from '@/lib/supabase';

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

function dbRowToStaff(row: Record<string, unknown>): Staff {
  return {
    id: row.id as string,
    vorname: row.vorname as string,
    nachname: row.nachname as string,
    email: (row.email as string) || '',
    telefon: (row.telefon as string) || '',
    themen: (row.themen as string[]) || [],
    erreichbar: row.erreichbar as boolean,
    createdAt: (row.created_at as string) || new Date().toISOString(),
  };
}

export default function MitarbeiterPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const hasLoaded = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [useDB, setUseDB] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Staff>>({
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    themen: [],
    erreichbar: true,
  });

  const loadFromSupabase = useCallback(async () => {
    try {
      const oid = await getOrganizationId();
      if (!oid) {
        const stored = localStorage.getItem('immogreta_mitarbeiter');
        if (stored) {
          try { setStaff(JSON.parse(stored)); } catch { setStaff(SEED_DATA); }
        } else {
          setStaff(SEED_DATA);
        }
        hasLoaded.current = true;
        return;
      }
      setOrgId(oid);
      setUseDB(true);
      const { data, error } = await supabase
        .from('mitarbeiter')
        .select('*')
        .eq('organization_id', oid)
        .order('nachname');
      if (error) throw error;
      setStaff((data || []).map(dbRowToStaff));
    } catch {
      const stored = localStorage.getItem('immogreta_mitarbeiter');
      if (stored) {
        try { setStaff(JSON.parse(stored)); } catch { setStaff(SEED_DATA); }
      } else {
        setStaff(SEED_DATA);
      }
    }
    hasLoaded.current = true;
  }, []);

  useEffect(() => { loadFromSupabase(); }, [loadFromSupabase]);

  // Save to localStorage when not using DB
  useEffect(() => {
    if (!hasLoaded.current || useDB) return;
    localStorage.setItem('immogreta_mitarbeiter', JSON.stringify(staff));
  }, [staff, useDB]);

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

  const handleSave = async () => {
    if (!formData.vorname || !formData.nachname || !formData.email || !formData.telefon) {
      showToast('Bitte alle erforderlichen Felder ausfüllen');
      return;
    }

    if (editingId) {
      if (useDB && orgId) {
        await supabase.from('mitarbeiter').update({
          vorname: formData.vorname,
          nachname: formData.nachname,
          email: formData.email,
          telefon: formData.telefon,
          themen: formData.themen || [],
          erreichbar: formData.erreichbar ?? true,
        }).eq('id', editingId);
      }
      setStaff((prev) =>
        prev.map((p) =>
          p.id === editingId ? { ...p, ...formData } : p
        )
      );
      showToast('Gespeichert');
    } else {
      if (useDB && orgId) {
        const { data: inserted, error } = await supabase.from('mitarbeiter').insert({
          organization_id: orgId,
          vorname: formData.vorname,
          nachname: formData.nachname,
          email: formData.email,
          telefon: formData.telefon,
          themen: formData.themen || [],
          erreichbar: formData.erreichbar ?? true,
        }).select().single();
        if (!error && inserted) {
          setStaff((prev) => [...prev, dbRowToStaff(inserted)]);
        }
      } else {
        const newStaff: Staff = {
          ...(formData as Omit<Staff, 'id' | 'createdAt'>),
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        setStaff((prev) => [...prev, newStaff]);
      }
      showToast('Gespeichert');
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (useDB && orgId) {
      await supabase.from('mitarbeiter').delete().eq('id', id);
    }
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
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 min-w-0">
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
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Mitarbeiter erstellen</span>
          <span className="sm:hidden">Neu</span>
        </button>
      </div>

      {/* Staff list */}
      <div className="space-y-3 lg:space-y-0">
        {filteredStaff.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-12 text-center text-gray-500">
            Keine Mitarbeiter gefunden
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {filteredStaff.map((person) => (
              <div key={person.id} className="p-4 lg:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`${getAvatarColor(person.id)} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                  >
                    {getInitials(person.vorname, person.nachname)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {person.vorname} {person.nachname}
                      </span>
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${person.erreichbar ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div className="text-sm text-gray-500 truncate">{person.email}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 lg:hidden">
                      <Phone size={12} />
                      {person.telefon}
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center gap-1 text-gray-700 flex-shrink-0">
                    <Phone size={16} />
                    <span className="text-sm">{person.telefon}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {deleteConfirm === person.id ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDelete(person.id)} className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => openEditModal(person)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(person.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {person.themen.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 ml-13 lg:ml-13">
                    {person.themen.map((topic) => (
                      <span key={topic} className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${getTopicColor(topic)}`}>
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
                <input type="text" value={formData.vorname || ''} onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
                <input type="text" value={formData.nachname || ''} onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                <input type="tel" value={formData.telefon || ''} onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Themen</label>
                <div className="space-y-2">
                  {TOPIC_OPTIONS.map((topic) => (
                    <label key={topic.label} className="flex items-center gap-2">
                      <input type="checkbox" checked={(formData.themen || []).includes(topic.label)} onChange={() => toggleTopic(topic.label)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">{topic.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.erreichbar || false} onChange={(e) => setFormData({ ...formData, erreichbar: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Erreichbar</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                Abbrechen
              </button>
              <button onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 space-y-2 z-40">
        {toasts.map((toast) => (
          <div key={toast.id} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in">
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
