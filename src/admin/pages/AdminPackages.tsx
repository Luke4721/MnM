import React, { useMemo, useState } from 'react';
import { usePackages } from '../../context/PackagesProvider';
import { PackageImageManager } from '../components/PackageImageManager';
import type { PackageGalleryImage } from '../../types/blogAdmin';
import type { TourPackage } from '../../types/package';
import {
  isPackageActive,
  hasExpiryDate,
  formatExpiryDate,
  toDateInputValue,
  fromDateInputValue,
} from '../../types/package';
import { validatePackageForm } from '../lib/packageValidation';
import {
  Search,
  Image as ImageIcon,
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  CalendarClock,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmModal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { RichTextEditor } from '../components/RichTextEditor';
import { plainTextToHtml, normalizeImageUrl } from '../../lib/packageUtils';
import { PACKAGES_API_URL } from '../../../config/appConfig.ts';

const API_URL = PACKAGES_API_URL;

type PackageTab = 'active' | 'expired';

interface EditingPackage {
  id?: string | number;
  name?: string;
  slug?: string;
  description?: string;
  overview?: string;
  startingPrice?: string | number;
  [key: string]: unknown;
}

/** Visual status badge for the expiry state of a package. */
const ExpiryBadge: React.FC<{ pkg: { expiryDate?: unknown } }> = ({ pkg }) => {
  if (!hasExpiryDate(pkg)) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wide">
        No expiry set
      </span>
    );
  }
  if (isPackageActive(pkg)) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wide">
        <CalendarClock size={11} /> Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300/60 uppercase tracking-wide">
      <AlertTriangle size={11} /> Expired
    </span>
  );
};

export const AdminPackages: React.FC = () => {
  // allPackages = every DynamoDB record (expired included) — admin-only data.
  const { allPackages, refreshPackages, loading, createPackage } = usePackages();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<PackageTab>('active');
  const [editingPkg, setEditingPkg] = useState<EditingPackage | null>(null);
  const [expiryInput, setExpiryInput] = useState(''); // YYYY-MM-DD from <input type="date">
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [pkgToDelete, setPkgToDelete] = useState<TourPackage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State for Images
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<PackageGalleryImage[]>([]);

  const isEditingExisting = Boolean(editingPkg?.id);

  const startEditing = (pkg: TourPackage) => {
    const rawDesc =
      typeof pkg.description === 'string' && pkg.description.trim()
        ? pkg.description
        : typeof pkg.overview === 'string' && pkg.overview.trim()
        ? pkg.overview
        : '';
    const htmlDesc = plainTextToHtml(rawDesc);
    setEditingPkg({
      ...pkg,
      description: htmlDesc,
      overview: htmlDesc,
    });

    // Show the currently stored validity date in the date input (local YYYY-MM-DD).
    setExpiryInput(toDateInputValue(pkg.expiryDate));
    setFormErrors({});

    const initialFeatured =
      pkg.featuredImage || pkg.image_url || pkg.heroImage || pkg.image || pkg.img || '';
    setFeaturedImage(initialFeatured);

    let initialGallery: PackageGalleryImage[] = [];
    if (Array.isArray(pkg.galleryImages) && pkg.galleryImages.length > 0) {
      initialGallery = pkg.galleryImages;
    } else if (initialFeatured) {
      initialGallery = [
        { url: initialFeatured, alt: pkg.name || 'Package Cover', caption: '' },
      ];
    }
    setGalleryImages(initialGallery);
  };

  const startCreating = () => {
    setEditingPkg({
      description: '',
      overview: '',
    }); // no id => create mode
    setExpiryInput('');
    setFormErrors({});
    setFeaturedImage('');
    setGalleryImages([]);
  };

  const closeEditor = () => {
    setEditingPkg(null);
    setExpiryInput('');
    setFormErrors({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    const name = (editingPkg.name || '').trim();
    const startingPrice = String(editingPkg.startingPrice || '');

    // 1. MANDATORY Zod validation — expiryDate is required; future-dated for new packages.
    const validation = validatePackageForm(
      { name, startingPrice, description: editingPkg.description || '', expiryDate: expiryInput },
      isEditingExisting ? 'edit' : 'create',
    );

    if (!validation.success) {
      setFormErrors(validation.errors);
      toast.error(validation.errors.expiryDate || validation.errors.name || 'Please fix the highlighted fields');
      return;
    }
    setFormErrors({});

    setIsSaving(true);

    const orderUrls = galleryImages.map((g) => g.url);
    const activeFeatured = featuredImage || (galleryImages[0]?.url ?? '');
    // Store as a full ISO string (end of the selected day, local time) so it
    // compares cleanly in DynamoDB and via new Date(...) everywhere.
    const expiryIso = fromDateInputValue(expiryInput);

    const imageCompat = {
      featuredImage: activeFeatured,
      // Backward compatibility fields for public components
      image_url: activeFeatured,
      heroImage: activeFeatured,
      image: activeFeatured,
      img: activeFeatured,
      galleryImages,
      imageOrder: orderUrls,
    };

    try {
      const descHtml = editingPkg.description || editingPkg.overview || '';

      if (isEditingExisting) {
        const payload = {
          ...editingPkg,
          ...imageCompat,
          id: String(editingPkg.id),
          name,
          startingPrice,
          description: descHtml,
          overview: descHtml,
          expiryDate: expiryIso,
          updatedAt: new Date().toISOString(),
        };
        const res = await fetch(`${API_URL}/${editingPkg.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(errText || 'Failed to save to DynamoDB');
        }
        toast.success(`"${name}" updated successfully!`);
      } else {
        // CREATE: new packages must have a future expiry date (enforced above).
        await createPackage({
          id: String(Date.now()),
          name,
          title: name,
          slug:
            name
              .toLowerCase()
              .trim()
              .replace(/[^\w\s-]/g, '')
              .replace(/[\s_-]+/g, '-')
              .replace(/^-+|-+$/g, '') || `package-${Date.now()}`,
          description: descHtml,
          overview: descHtml,
          startingPrice,
          expiryDate: expiryIso,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...imageCompat,
        });
        toast.success(`"${name}" created successfully!`);
      }

      await refreshPackages();
      setTimeout(() => closeEditor(), 600);
    } catch (err: any) {
      toast.error('Error saving package: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pkgToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`${API_URL}/${pkgToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || 'Failed to delete');
      }
      await refreshPackages();
      toast.success(`Package "${pkgToDelete.name}" deleted successfully.`);
      setPkgToDelete(null);
    } catch (err: any) {
      toast.error('Error deleting package: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // AUTOMATIC STATUS DERIVATION — no manual Active/Inactive toggle.
  // Active  : expiryDate is in the future (or not yet set on legacy records).
  // Expired : expiryDate is in the past.
  const { activePackages, expiredPackages } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matches = (pkg: TourPackage) =>
      !q ||
      pkg.name?.toLowerCase().includes(q) ||
      (pkg.destination || pkg.location || pkg.locations || '').toLowerCase().includes(q) ||
      pkg.startingPrice?.toString().toLowerCase().includes(q);

    const active: TourPackage[] = [];
    const expired: TourPackage[] = [];
    for (const pkg of allPackages) {
      if (!matches(pkg)) continue;
      (isPackageActive(pkg) ? active : expired).push(pkg);
    }
    // Soonest-expiring active packages first; most-recently-expired first.
    active.sort(
      (a, b) =>
        new Date(a.expiryDate || '9999-12-31').getTime() -
        new Date(b.expiryDate || '9999-12-31').getTime(),
    );
    expired.sort(
      (a, b) =>
        new Date(b.expiryDate || 0).getTime() - new Date(a.expiryDate || 0).getTime(),
    );
    return { activePackages: active, expiredPackages: expired };
  }, [allPackages, searchQuery]);

  const visiblePackages = activeTab === 'active' ? activePackages : expiredPackages;

  const renderRow = (pkg: TourPackage) => {
    const cover =
      pkg.featuredImage || pkg.image_url || pkg.heroImage || pkg.image || pkg.img || '';
    const expiredRow = activeTab === 'expired';

    return (
      <tr key={String(pkg.id)} className="hover:bg-white/60 transition-colors">
        <td className="px-6 py-3.5">
          <div className="w-14 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-white/80 shadow-sm">
            {cover ? (
              <img
                src={normalizeImageUrl(cover)}
                alt={pkg.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                No Img
              </div>
            )}
          </div>
        </td>

        <td className="px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">{pkg.name}</span>
            <ExpiryBadge pkg={pkg} />
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {pkg.destination || pkg.location || pkg.locations || '—'}
          </div>
        </td>

        <td className="px-6 py-3.5 font-bold text-gray-900">
          {pkg.startingPrice || 'N/A'}
        </td>

        <td className="px-6 py-3.5">
          <div
            className={`text-[13px] font-semibold ${
              expiredRow ? 'text-rose-700' : 'text-gray-800'
            }`}
          >
            {formatExpiryDate(pkg.expiryDate)}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mt-0.5">
            {expiredRow ? 'Expired on' : 'Valid until'}
          </div>
        </td>

        <td className="px-6 py-3.5 text-right whitespace-nowrap">
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<Edit2 size={13} className="text-indigo-600" />}
            onClick={() => startEditing(pkg)}
            className="mr-2"
          >
            {expiredRow ? 'Extend' : 'Edit'}
          </Button>
          <Button
            variant="dangerOutline"
            size="sm"
            iconLeft={<Trash2 size={13} className="text-rose-600" />}
            onClick={() => setPkgToDelete(pkg)}
          >
            Delete
          </Button>
        </td>
      </tr>
    );
  };

  const expiryError = formErrors.expiryDate;
  // Save stays disabled until a validity date is chosen — the field is mandatory.
  const isSaveDisabled = !expiryInput;

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 pb-16">
      {/* Header */}
      <PageHeader
        title={
          editingPkg
            ? isEditingExisting
              ? `Edit Package: ${editingPkg.name}`
              : 'Create New Package'
            : 'Manage Packages'
        }
        description="Browse and update travel packages, validity dates, starting prices, and multi-image galleries stored in AWS DynamoDB & S3."
        breadcrumbs={[
          { label: 'Management', href: '/admin/packages' },
          { label: 'Packages', href: '/admin/packages' },
          ...(editingPkg ? [{ label: editingPkg.name || 'New Package' }] : []),
        ]}
        actions={
          editingPkg ? (
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<ArrowLeft size={14} />}
              onClick={closeEditor}
            >
              Back to Packages List
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              iconLeft={<Plus size={14} />}
              onClick={startCreating}
            >
              New Package
            </Button>
          )
        }
      />

      {editingPkg ? (
        <Card className="p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Basic Package Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Package Name"
                required
                value={editingPkg.name || ''}
                onChange={(e) => {
                  setEditingPkg({ ...editingPkg, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                error={formErrors.name || undefined}
                placeholder="e.g. Majestic Kashmir Tour"
              />

              <Input
                label="Starting Price (INR / text)"
                value={editingPkg.startingPrice || ''}
                onChange={(e) =>
                  setEditingPkg({ ...editingPkg, startingPrice: e.target.value })
                }
                placeholder="e.g. ₹24,999"
              />
            </div>

            {/* Package Validity / Expiry Date — MANDATORY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <Input
                label="Package Validity / Expiry Date"
                type="date"
                required
                value={expiryInput}
                min={isEditingExisting ? undefined : new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setExpiryInput(e.target.value);
                  if (expiryError) setFormErrors({ ...formErrors, expiryDate: '' });
                }}
                error={expiryError || undefined}
                helperText={
                  isEditingExisting && expiryInput
                    ? `Currently valid until ${formatExpiryDate(
                        fromDateInputValue(expiryInput),
                      )} — the package auto-expires after this date.`
                    : 'Required. The package is automatically visible on the website only until this date.'
                }
                disabled={isSaving}
              />

              <div className="flex flex-col justify-center">
                <span className="text-[12px] font-semibold text-gray-700 tracking-wide mb-1.5">
                  Current Status
                </span>
                <div className="flex items-center gap-2">
                  {editingPkg && hasExpiryDate({ expiryDate: expiryInput ? fromDateInputValue(expiryInput) : editingPkg.expiryDate }) ? (
                    <ExpiryBadge
                      pkg={{ expiryDate: expiryInput ? fromDateInputValue(expiryInput) : editingPkg.expiryDate }}
                    />
                  ) : (
                    <span className="text-[11px] text-gray-400">
                      No expiry date set yet — save will be blocked until you choose one.
                    </span>
                  )}
                </div>
                {isEditingExisting && expiryInput && !isPackageActive({ expiryDate: fromDateInputValue(expiryInput) }) && (
                  <p className="text-[11px] text-rose-600 font-medium mt-2 flex items-start gap-1.5">
                    <AlertTriangle size={13} className="shrink-0 mt-px" />
                    This date is in the past. The package is hidden from the public website until
                    you extend the validity.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                Description &amp; Overview
              </label>
              <RichTextEditor
                value={String(editingPkg.description || editingPkg.overview || '')}
                onChange={(html) =>
                  setEditingPkg((prev) =>
                    prev ? { ...prev, description: html, overview: html } : prev
                  )
                }
                minHeight="220px"
                placeholder="Comprehensive overview of itinerary, inclusions, and highlights..."
              />
            </div>

            {/* Package Images & Multi-Image Gallery Manager */}
            <div className="pt-4 border-t border-white/60">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon size={18} className="text-indigo-600" /> Package Images & Gallery
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload multiple high-res photos to AWS S3, reorder gallery slides, edit alt texts & captions, and set the main cover image.
                </p>
              </div>

              <PackageImageManager
                packageSlug={
                  editingPkg.slug ||
                  editingPkg.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
                  'pkg'
                }
                featuredImage={featuredImage}
                galleryImages={galleryImages}
                onFeaturedChange={(url) => setFeaturedImage(url)}
                onGalleryChange={(images) => setGalleryImages(images)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-6 border-t border-white/60">
              <Button
                type="submit"
                variant="primary"
                loading={isSaving}
                disabled={isSaveDisabled}
                title={
                  isSaveDisabled
                    ? 'Choose a Package Validity / Expiry Date first — it is required.'
                    : undefined
                }
              >
                {isSaving
                  ? 'Saving to DynamoDB...'
                  : isEditingExisting
                  ? 'Save All Changes'
                  : 'Create Package'}
              </Button>
              <Button type="button" variant="ghost" onClick={closeEditor}>
                Cancel
              </Button>
              {isSaveDisabled && (
                <span className="text-[11px] font-semibold text-rose-600">
                  Package Validity / Expiry Date is required.
                </span>
              )}
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          {/* Tabs: Active / Expired — status derived automatically from expiryDate */}
          <div className="p-4 border-b border-white/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex gap-2 p-1 bg-white/60 rounded-2xl border border-white/60 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-xl text-[12px] font-bold tracking-wide transition-all ${
                  activeTab === 'active'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-gray-600 hover:bg-white'
                }`}
                aria-pressed={activeTab === 'active'}
              >
                Active Tour Packages ({activePackages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('expired')}
                className={`px-4 py-2 rounded-xl text-[12px] font-bold tracking-wide transition-all ${
                  activeTab === 'expired'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-gray-600 hover:bg-white'
                }`}
                aria-pressed={activeTab === 'expired'}
              >
                Expired Tour Packages ({expiredPackages.length})
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search packages by name or price..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  iconLeft={<Search size={15} />}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                Showing <strong className="text-gray-900">{visiblePackages.length}</strong> of{' '}
                {allPackages.length} packages
              </span>
            </div>
          </div>

          {/* Packages Table */}
          <div className="overflow-x-auto overscroll-x-contain overscroll-y-auto" data-lenis-prevent>
            {loading ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                Loading packages from AWS DynamoDB...
              </div>
            ) : visiblePackages.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                {activeTab === 'active'
                  ? 'No active packages. Create one or extend an expired package.'
                  : 'No expired packages — every package is currently valid.'}
              </div>
            ) : (
              <table className="w-full text-left text-[13px] text-gray-700">
                <thead className="bg-white/40 border-b border-white/60 text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Image</th>
                    <th className="px-6 py-3.5">Package Name</th>
                    <th className="px-6 py-3.5">
                      {activeTab === 'active' ? 'Price' : 'Price'}
                    </th>
                    <th className="px-6 py-3.5">
                      {activeTab === 'active' ? 'Expiry Date' : 'Expired On'}
                    </th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">{visiblePackages.map(renderRow)}</tbody>
              </table>
            )}
          </div>

          {activeTab === 'expired' && expiredPackages.length > 0 && (
            <div className="px-6 py-3 border-t border-white/40 text-[11px] text-gray-500 flex items-center gap-2">
              <AlertTriangle size={13} className="text-rose-500 shrink-0" />
              Expired packages are hidden from the public website automatically. Use{' '}
              <strong className="text-gray-700">Extend</strong> to set a new validity date.
            </div>
          )}
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(pkgToDelete)}
        onClose={() => setPkgToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Package"
        message={`Are you sure you want to delete "${pkgToDelete?.name}"? This will remove the package record from AWS DynamoDB.`}
        confirmText="Yes, Delete Package"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
};

export default AdminPackages;
