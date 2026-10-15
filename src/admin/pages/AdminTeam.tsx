import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Search,
  Upload,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import fallbackTeam from '../../data/team.json';

export interface TeamMember {
  id: string;
  name: string;
  photo_url: string;
  email: string;
  branch: string;
  phone_number: string;
}

export const AdminTeam: React.FC = () => {
  const { toast } = useToast();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamMember>({
    id: '',
    name: '',
    photo_url: '',
    email: '',
    branch: '',
    phone_number: '',
  });

  // Delete modal state
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/site-config?section=team');
      if (!res.ok) throw new Error('Failed to load team data');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTeam(data.data);
      } else {
        setTeam(fallbackTeam);
      }
    } catch (err: any) {
      console.warn('[AdminTeam] Falling back to local data:', err);
      setTeam(fallbackTeam);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      id: 'team_' + Date.now(),
      name: '',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop',
      email: '',
      branch: 'Headquarters - New Delhi',
      phone_number: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({ ...member });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const bodyData = new FormData();
    bodyData.append('file', file);
    bodyData.append('folder', 'team');

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: bodyData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, photo_url: data.url }));
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      toast.error('Image upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSubmitting(true);
    let updatedList: TeamMember[];

    if (editingMember) {
      updatedList = team.map((m) => (m.id === formData.id ? { ...formData } : m));
    } else {
      updatedList = [{ ...formData }, ...team];
    }

    try {
      const res = await fetch('/api/admin/site-config?section=team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save team member');

      setTeam(updatedList);
      setIsModalOpen(false);
      toast.success(editingMember ? 'Team member updated!' : 'Team member added!');
    } catch (err: any) {
      toast.error('Error saving: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/site-config?section=team&id=${deleteModalId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete');

      setTeam((prev) => prev.filter((m) => m.id !== deleteModalId));
      setDeleteModalId(null);
      toast.success('Team member removed');
    } catch (err: any) {
      toast.error('Delete error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTeam = team.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.branch.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 pb-20">
      <PageHeader
        title="Team Members"
        description="Manage the company experts, photos, branch locations, and contact details shown on the website."
        actions={
          <Button variant="primary" iconLeft={<Plus size={18} />} onClick={openAddModal}>
            Add Member
          </Button>
        }
      />

      {/* Search Bar & Stats */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, branch, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm font-medium text-slate-500">
          Showing <span className="text-slate-900 font-bold">{filteredTeam.length}</span> member(s)
        </div>
      </Card>

      {/* Team Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredTeam.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">
          <Users size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Team Members Found</h3>
          <p className="text-sm text-slate-500 mb-6">Click below to add your first team member.</p>
          <Button variant="primary" iconLeft={<Plus size={16} />} onClick={openAddModal}>
            Add Member
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((member) => (
            <Card key={member.id} className="p-6 flex flex-col items-center text-center relative group hover:shadow-lg transition-shadow">
              {/* Top controls */}
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => openEditModal(member)}
                  className="p-2 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Edit member"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModalId(member.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete member"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Avatar */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-orange-200 mb-4 bg-slate-100">
                <img
                  src={member.photo_url || 'https://via.placeholder.com/150'}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop';
                  }}
                />
              </div>

              {/* Details */}
              <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
              <p className="text-xs font-semibold text-orange-600 mb-4 flex items-center gap-1">
                <MapPin size={12} />
                {member.branch}
              </p>

              <div className="w-full space-y-2 border-t border-slate-100 pt-4 mt-auto text-xs text-slate-600">
                <div className="flex items-center justify-center gap-2 truncate">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{member.phone_number}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Avatar Preview & Upload */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-300 shrink-0 bg-white shadow-sm">
              <img
                src={formData.photo_url || 'https://via.placeholder.com/150'}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Member Photo
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                  <Upload size={14} />
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Photo URL (Direct Link)
            </label>
            <Input
              value={formData.photo_url}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Full Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Branch / Office Location
            </label>
            <Input
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              placeholder="e.g. New Delhi - HQ or Mumbai Branch"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="member@mnmtravels.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+91-9876543210"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteModalId}
        onClose={() => setDeleteModalId(null)}
        onConfirm={confirmDelete}
        title="Remove Team Member"
        message="Are you sure you want to remove this team member from the website? This will update the live site."
        confirmText={isSubmitting ? 'Deleting...' : 'Delete Member'}
        variant="danger"
      />
    </div>
  );
};
