import React, { useState, useEffect } from 'react';
import {
  Save,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Share2,
  Building,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { getAdminToken } from '../auth';
import initialSettings from '../../data/site_settings.json';

interface SiteSettingsData {
  companyName: string;
  tagline: string;
  establishedYear: string;
  phone: string;
  altPhone: string;
  email: string;
  conciergeEmail: string;
  address: string;
  instagram: string;
  facebook: string;
  youtube: string;
}

export const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettingsData>({
    companyName: initialSettings.companyName || '',
    tagline: initialSettings.tagline || '',
    establishedYear: (initialSettings as any).establishedYear || '2008',
    phone: initialSettings.phone || '',
    altPhone: initialSettings.altPhone || '',
    email: initialSettings.email || '',
    conciergeEmail: initialSettings.conciergeEmail || '',
    address: initialSettings.address || '',
    instagram: initialSettings.instagram || '',
    facebook: initialSettings.facebook || '',
    youtube: initialSettings.youtube || '',
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/site-config?section=settings');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSettings((prev) => ({
            ...prev,
            ...json.data,
            establishedYear: json.data.establishedYear || '2008',
          }));
        }
      }
    } catch (err) {
      console.warn('[AdminSettings] Failed to fetch live settings, using local fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field: keyof SiteSettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/site-config?section=settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': getAdminToken(),
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Failed to update settings');
      }

      toast.success('Site settings updated and synced to S3 successfully!');
    } catch (err: any) {
      console.error('[AdminSettings] Save error:', err);
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <LoadingSpinner size="lg" variant="primary" />
        <p className="text-sm text-gray-500 font-medium">Loading site settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 pb-20">
      <PageHeader
        title="Site Settings"
        description="Configure brand information, contact details, established year, and social channels stored in AWS S3."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Settings', href: '/admin/settings' },
        ]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company & Brand Identity */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-zinc-800 border border-indigo-200/60 dark:border-zinc-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Building size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Brand & Company Identity
                </h2>
                <p className="text-xs text-gray-500">
                  Global company name, tagline, and founding year displayed across the website.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300">
              <Calendar size={13} />
              Since {settings.establishedYear || '2008'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <Input
                label="Company Name"
                required
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="e.g. Monks & Monkeys Travels Pvt. Ltd."
              />
            </div>
            <div>
              <Input
                label="Established / Founding Year"
                required
                value={settings.establishedYear}
                onChange={(e) => handleChange('establishedYear', e.target.value)}
                placeholder="e.g. 2008"
                helperText="Controls the 'SINCE 2008' circular badge on the homepage."
              />
            </div>
          </div>

          <Input
            label="Company Tagline"
            value={settings.tagline}
            onChange={(e) => handleChange('tagline', e.target.value)}
            placeholder="Travel because life is too short to stay in one place."
          />
        </Card>

        {/* Contact Numbers & Emails */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-zinc-800 border border-emerald-200/60 dark:border-zinc-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Phone size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Contact & Concierge Channels
              </h2>
              <p className="text-xs text-gray-500">
                Phone numbers, email addresses, and office locations rendered on the Contact page & footer.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Primary Phone Number"
              required
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91-9810141641"
              iconLeft={<Phone size={14} className="text-gray-400" />}
            />
            <Input
              label="Alternate / Landline Phone"
              value={settings.altPhone}
              onChange={(e) => handleChange('altPhone', e.target.value)}
              placeholder="+91-11-35919499"
              iconLeft={<Phone size={14} className="text-gray-400" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Concierge Email (Inquiries & Leads)"
              required
              value={settings.conciergeEmail}
              onChange={(e) => handleChange('conciergeEmail', e.target.value)}
              placeholder="concierge@mnmtravels.com"
              iconLeft={<Mail size={14} className="text-gray-400" />}
              helperText="Destination leads from the Contact page fallback to this inbox."
            />
            <Input
              label="General Info Email"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="info@mnmtravels.com"
              iconLeft={<Mail size={14} className="text-gray-400" />}
            />
          </div>

          <Input
            label="Physical Office Address"
            value={settings.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Delhi, India"
            iconLeft={<MapPin size={14} className="text-gray-400" />}
          />
        </Card>

        {/* Social Media Links */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-zinc-800 border border-orange-200/60 dark:border-zinc-700 flex items-center justify-center text-[#FF9933]">
              <Share2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Social Media Channels
              </h2>
              <p className="text-xs text-gray-500">
                Official profile URLs linked in the navbar, footer, and contact section.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Instagram Profile URL"
              value={settings.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
              placeholder="https://www.instagram.com/monks_n_monkeys.travels"
              iconLeft={<Globe size={14} className="text-gray-400" />}
            />
            <Input
              label="Facebook Page URL"
              value={settings.facebook}
              onChange={(e) => handleChange('facebook', e.target.value)}
              placeholder="https://www.facebook.com/share/1DjLJ112BB/"
              iconLeft={<Globe size={14} className="text-gray-400" />}
            />
          </div>

          <Input
            label="YouTube Channel URL"
            value={settings.youtube}
            onChange={(e) => handleChange('youtube', e.target.value)}
            placeholder="https://youtube.com/@monksandmonkeystravels?si=200OlrPcBr_-ddwj"
            iconLeft={<Globe size={14} className="text-gray-400" />}
          />
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200/60 dark:border-zinc-800">
          <p className="text-xs text-gray-500">
            Changes save to AWS S3 (<code className="font-mono text-indigo-600">database/site_settings.json</code>) and trigger immediate site propagation.
          </p>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            iconLeft={<Save size={16} />}
          >
            {saving ? 'Saving to S3...' : 'Save Site Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};
