import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Search,
  UserCheck,
  Compass,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { getAdminToken } from '../auth';
import fallbackRouting from '../../data/support_routing.json';
import fallbackTeam from '../../data/team.json';

interface RouteHandler {
  type: 'Inbound' | 'Outbound';
  name: string;
  email: string;
  phone: string;
}

export const AdminSupportRouting: React.FC = () => {
  const { toast } = useToast();
  const [routing, setRouting] = useState<Record<string, RouteHandler>>({});
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Inbound' | 'Outbound'>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [destinationName, setDestinationName] = useState('');
  const [selectedType, setSelectedType] = useState<'Inbound' | 'Outbound'>('Outbound');
  const [handlerName, setHandlerName] = useState('');
  const [handlerEmail, setHandlerEmail] = useState('');
  const [handlerPhone, setHandlerPhone] = useState('');

  // Delete State
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRouting, resTeam] = await Promise.all([
        fetch('/api/admin/site-config?section=routing'),
        fetch('/api/admin/site-config?section=team'),
      ]);

      if (resRouting.ok) {
        const data = await resRouting.json();
        if (data.success && data.data) {
          setRouting(data.data);
        } else {
          setRouting(fallbackRouting as Record<string, RouteHandler>);
        }
      } else {
        setRouting(fallbackRouting as Record<string, RouteHandler>);
      }

      if (resTeam.ok) {
        const tData = await resTeam.json();
        if (tData.success && Array.isArray(tData.data)) {
          setTeamMembers(tData.data);
        } else {
          setTeamMembers(fallbackTeam);
        }
      }
    } catch (err: any) {
      console.warn('[AdminSupportRouting] Using local fallback:', err);
      setRouting(fallbackRouting as Record<string, RouteHandler>);
      setTeamMembers(fallbackTeam);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingKey(null);
    setDestinationName('');
    setSelectedType('Outbound');
    setHandlerName('');
    setHandlerEmail('');
    setHandlerPhone('');
    setIsModalOpen(true);
  };

  const openEditModal = (dest: string, handler: RouteHandler) => {
    setEditingKey(dest);
    setDestinationName(dest);
    setSelectedType(handler.type);
    setHandlerName(handler.name);
    setHandlerEmail(handler.email);
    setHandlerPhone(handler.phone);
    setIsModalOpen(true);
  };

  const handlePickTeamMember = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    if (!memberId) return;
    const member = teamMembers.find((m) => m.id === memberId);
    if (member) {
      setHandlerName(member.name);
      setHandlerEmail(member.email);
      setHandlerPhone(member.phone_number);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const dest = destinationName.trim();
    if (!dest) {
      toast.error('Destination / Department name is required');
      return;
    }
    if (!handlerName.trim() || !handlerEmail.trim() || !handlerPhone.trim()) {
      toast.error('All assigned helper details (Name, Email, Phone) are required');
      return;
    }

    setIsSubmitting(true);
    const updatedMap = { ...routing };

    // If key renamed in edit mode, remove old key
    if (editingKey && editingKey !== dest) {
      delete updatedMap[editingKey];
    }

    updatedMap[dest] = {
      type: selectedType,
      name: handlerName.trim(),
      email: handlerEmail.trim(),
      phone: handlerPhone.trim(),
    };

    try {
      const res = await fetch('/api/admin/site-config?section=routing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': getAdminToken(),
        },
        body: JSON.stringify(updatedMap),
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text.slice(0, 100) || 'Server returned non-JSON response');
      }
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save routing');

      setRouting(updatedMap);
      setIsModalOpen(false);
      toast.success(editingKey ? 'Destination routing updated!' : 'New destination added!');
    } catch (err: any) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteKey) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/site-config?section=routing&key=${encodeURIComponent(deleteKey)}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': getAdminToken(),
        },
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text.slice(0, 100) || 'Server returned non-JSON response');
      }
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete');

      const updated = { ...routing };
      delete updated[deleteKey];
      setRouting(updated);
      setDeleteKey(null);
      toast.success(`Removed ${deleteKey} routing`);
    } catch (err: any) {
      toast.error('Delete error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEntries = Object.entries(routing).filter(([dest, handler]) => {
    if (filterType !== 'All' && handler.type !== filterType) return false;
    const q = search.toLowerCase();
    return (
      dest.toLowerCase().includes(q) ||
      handler.name.toLowerCase().includes(q) ||
      handler.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 pb-20">
      <PageHeader
        title="Support & Inquiry Routing"
        description="Assign which team member handles customer inquiries for specific destinations and travel departments."
        actions={
          <Button variant="primary" iconLeft={<Plus size={18} />} onClick={openAddModal}>
            Add Destination
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search destination or helper..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['All', 'Inbound', 'Outbound'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  filterType === t
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="text-sm font-medium text-slate-500">
          Showing <span className="text-slate-900 font-bold">{filteredEntries.length}</span> destination(s)
        </div>
      </Card>

      {/* Routing Cards Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">
          <Headphones size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Routing Found</h3>
          <p className="text-sm text-slate-500 mb-6">Create a destination route to assign incoming inquiries.</p>
          <Button variant="primary" iconLeft={<Plus size={16} />} onClick={openAddModal}>
            Add Destination
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map(([dest, handler]) => {
            const isInbound = handler.type === 'Inbound';
            return (
              <Card key={dest} className="p-6 flex flex-col justify-between relative group hover:shadow-lg transition-shadow">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isInbound
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {handler.type}
                    </span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => openEditModal(dest, handler)}
                        className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Edit routing"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteKey(dest)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete routing"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Compass size={18} className="text-orange-500" />
                    {dest}
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Inquiries for {dest} will be routed to the specialist below.
                  </p>
                </div>

                {/* Assigned Helper Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <UserCheck size={14} className="text-orange-600" />
                    <span>{handler.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{handler.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={12} className="text-slate-400 shrink-0" />
                    <span>{handler.phone}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingKey ? `Edit ${editingKey} Routing` : 'Add Destination Routing'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Destination / Inquiry Topic *
            </label>
            <Input
              value={destinationName}
              onChange={(e) => setDestinationName(e.target.value)}
              placeholder="e.g. Dubai, Switzerland, or Corporate Inbound"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Travel Classification *
            </label>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'Inbound' | 'Outbound')}
            >
              <option value="Outbound">Outbound (Going Abroad / International)</option>
              <option value="Inbound">Inbound (Coming to India / Domestic)</option>
            </Select>
          </div>

          {/* Quick Select from Team */}
          {teamMembers.length > 0 && (
            <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200">
              <label className="block text-xs font-bold text-orange-900 uppercase mb-1">
                Quick Assign from Team Members
              </label>
              <Select onChange={handlePickTeamMember} defaultValue="">
                <option value="" disabled>
                  -- Select a team member to auto-fill details --
                </option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.branch})
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Assigned Specialist Name *
            </label>
            <Input
              value={handlerName}
              onChange={(e) => setHandlerName(e.target.value)}
              placeholder="e.g. Alice Smith"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Helper Email *
              </label>
              <Input
                type="email"
                value={handlerEmail}
                onChange={(e) => setHandlerEmail(e.target.value)}
                placeholder="helper@mnmtravels.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Helper Phone *
              </label>
              <Input
                type="tel"
                value={handlerPhone}
                onChange={(e) => setHandlerPhone(e.target.value)}
                placeholder="+91-9876543210"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingKey ? 'Update Route' : 'Add Route'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteKey}
        onClose={() => setDeleteKey(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteKey} Routing`}
        message={`Are you sure you want to remove ${deleteKey} from the inquiry routing? Customers will no longer see this destination in the inquiry form.`}
        confirmText={isSubmitting ? 'Deleting...' : 'Delete Route'}
        variant="danger"
      />
    </div>
  );
};
