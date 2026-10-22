import React, { useMemo, useState, useRef } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
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
  ChevronUp,
  ChevronDown,
  GripVertical,
  Check,
  X,
  Tag,
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

interface ItineraryDay {
  id?: string;
  day?: number;
  title?: string;
  description?: string;
}

interface EditingPackage {
  id?: string | number;
  name?: string;
  slug?: string;
  description?: string;
  overview?: string;
  startingPrice?: string | number;
  discountPercentage?: number | string;
  itinerary?: ItineraryDay[];
  inclusions?: string[];
  exclusions?: string[];
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

interface ItineraryDayCardProps {
  dayItem: ItineraryDay;
  idx: number;
  totalDays: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateDay: (index: number, field: 'title' | 'description', value: string) => void;
  onRemoveDay: (index: number) => void;
  onMoveDay: (index: number, direction: 'up' | 'down') => void;
  onInsertBelow: (index: number) => void;
  registerTitleRef: (index: number, el: HTMLInputElement | null) => void;
}

const ItineraryDayCard: React.FC<ItineraryDayCardProps> = ({
  dayItem,
  idx,
  totalDays,
  isExpanded,
  onToggleExpand,
  onUpdateDay,
  onRemoveDay,
  onMoveDay,
  onInsertBelow,
  registerTitleRef,
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={dayItem}
      id={dayItem.id || `day-${idx}`}
      dragListener={false}
      dragControls={dragControls}
      className="rounded-2xl bg-white dark:bg-zinc-800/80 border border-gray-200/90 dark:border-zinc-700 shadow-sm overflow-hidden transition-shadow hover:shadow-md"
    >
      {/* Header bar: always visible, acts as accordion trigger */}
      <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-gray-50/70 dark:bg-zinc-800/60 border-b border-gray-200/70 dark:border-zinc-700/60 select-none">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Drag Handle */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab active:cursor-grabbing p-1.5 -ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 rounded-lg hover:bg-gray-200/60 dark:hover:bg-zinc-700/60 touch-none shrink-0"
            title="Drag to reorder day"
          >
            <GripVertical size={16} />
          </div>

          {/* Day Badge */}
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E67E22] to-[#FF9933] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            D{dayItem.day || idx + 1}
          </span>

          {/* Title or summary button to toggle accordion */}
          <button
            type="button"
            onClick={onToggleExpand}
            className="text-left font-semibold text-xs sm:text-sm text-gray-900 dark:text-zinc-100 truncate hover:text-[#FF9933] transition-colors flex-1"
          >
            {dayItem.title || <span className="text-gray-400 italic">Day {idx + 1} (No title set)</span>}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => onMoveDay(idx, 'up')}
            title="Move Day Up"
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-200/60 dark:hover:bg-zinc-700 disabled:opacity-20 disabled:hover:bg-transparent"
          >
            <ChevronUp size={15} />
          </button>
          <button
            type="button"
            disabled={idx === totalDays - 1}
            onClick={() => onMoveDay(idx, 'down')}
            title="Move Day Down"
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-200/60 dark:hover:bg-zinc-700 disabled:opacity-20 disabled:hover:bg-transparent"
          >
            <ChevronDown size={15} />
          </button>
          <button
            type="button"
            onClick={onToggleExpand}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200 rounded-lg hover:bg-gray-200/60 dark:hover:bg-zinc-700 transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} className="text-[#FF9933]" /> : <ChevronDown size={16} />}
          </button>
          <button
            type="button"
            onClick={() => onRemoveDay(idx)}
            title="Delete Day"
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors ml-0.5"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-zinc-800/90 animate-in fade-in duration-150">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              Day Title
            </label>
            <input
              ref={(el) => registerTitleRef(idx, el)}
              type="text"
              value={dayItem.title || ''}
              onChange={(e) => onUpdateDay(idx, 'title', e.target.value)}
              placeholder="e.g. Arrival in Srinagar & Shikara Ride on Dal Lake"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933] transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              Day Description &amp; Activities
            </label>
            <textarea
              rows={3}
              value={dayItem.description || ''}
              onChange={(e) => onUpdateDay(idx, 'description', e.target.value)}
              placeholder="Describe itinerary details, places visited, hotel check-in, meals included..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933] transition leading-relaxed"
            />
          </div>

          {/* Contextual + Add Day Below Button directly under active day */}
          <div className="pt-2 flex items-center justify-end border-t border-gray-100 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => onInsertBelow(idx)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#FF9933] hover:text-[#e07e1b] bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/30 dark:hover:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/40 rounded-lg transition-colors"
            >
              <Plus size={13} />
              Add Day Below
            </button>
          </div>
        </div>
      )}
    </Reorder.Item>
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
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(0);
  const titleInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const isEditingExisting = Boolean(editingPkg?.id);

  const startEditing = (pkg: TourPackage) => {
    const rawDesc =
      typeof pkg.description === 'string' && pkg.description.trim()
        ? pkg.description
        : typeof pkg.overview === 'string' && pkg.overview.trim()
        ? pkg.overview
        : '';
    const htmlDesc = plainTextToHtml(rawDesc);
    let initialItinerary: ItineraryDay[] = [];
    if (Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0) {
      initialItinerary = pkg.itinerary.map((item, idx) => ({
        id: (item as any).id || `day-${idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        day: item.day ?? idx + 1,
        title: item.title || '',
        description: item.description || '',
      }));
    }

    setEditingPkg({
      ...pkg,
      description: htmlDesc,
      overview: htmlDesc,
      itinerary: initialItinerary,
      discountPercentage: pkg.discountPercentage !== undefined && pkg.discountPercentage !== null ? pkg.discountPercentage : '',
      inclusions: Array.isArray(pkg.inclusions) ? [...pkg.inclusions] : [],
      exclusions: Array.isArray(pkg.exclusions) ? [...pkg.exclusions] : [],
    });
    setExpandedDayIndex(initialItinerary.length > 0 ? 0 : null);

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
      itinerary: [],
      discountPercentage: '',
      inclusions: [],
      exclusions: [],
    }); // no id => create mode
    setExpandedDayIndex(null);
    setExpiryInput('');
    setFormErrors({});
    setFeaturedImage('');
    setGalleryImages([]);
  };

  const closeEditor = () => {
    setEditingPkg(null);
    setExpiryInput('');
    setFormErrors({});
    setExpandedDayIndex(null);
  };

  // Itinerary Dynamic Management Handlers
  const handleInsertDay = (afterIndex?: number) => {
    setEditingPkg((prev) => {
      if (!prev) return prev;
      const currentList = prev.itinerary || [];
      const insertAt = afterIndex !== undefined ? afterIndex + 1 : currentList.length;
      const newDayNumber = insertAt + 1;
      const newDayItem: ItineraryDay = {
        id: `day-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        day: newDayNumber,
        title: `Day ${newDayNumber}: Exploration & Sightseeing`,
        description: '',
      };
      const updatedList = [
        ...currentList.slice(0, insertAt),
        newDayItem,
        ...currentList.slice(insertAt),
      ].map((item, idx) => ({ ...item, day: idx + 1 }));

      setExpandedDayIndex(insertAt);

      // Smooth scroll and auto-focus on the newly added day title input
      setTimeout(() => {
        const inputEl = titleInputRefs.current.get(insertAt);
        if (inputEl) {
          inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          inputEl.focus();
        }
      }, 120);

      return {
        ...prev,
        itinerary: updatedList,
      };
    });
  };

  const handleRemoveDay = (index: number) => {
    setEditingPkg((prev) => {
      if (!prev) return prev;
      const currentList = prev.itinerary || [];
      const updated = currentList
        .filter((_, i) => i !== index)
        .map((item, idx) => ({ ...item, day: idx + 1 }));
      if (expandedDayIndex === index) {
        setExpandedDayIndex(updated.length > 0 ? Math.min(index, updated.length - 1) : null);
      } else if (expandedDayIndex !== null && expandedDayIndex > index) {
        setExpandedDayIndex(expandedDayIndex - 1);
      }
      return { ...prev, itinerary: updated };
    });
  };

  const handleUpdateDay = (index: number, field: 'title' | 'description', value: string) => {
    setEditingPkg((prev) => {
      if (!prev) return prev;
      const currentList = [...(prev.itinerary || [])];
      if (currentList[index]) {
        currentList[index] = { ...currentList[index], [field]: value };
      }
      return { ...prev, itinerary: currentList };
    });
  };

  const handleMoveDay = (index: number, direction: 'up' | 'down') => {
    setEditingPkg((prev) => {
      if (!prev) return prev;
      const list = [...(prev.itinerary || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      const reindexed = list.map((item, idx) => ({ ...item, day: idx + 1 }));
      setExpandedDayIndex(targetIndex);
      return { ...prev, itinerary: reindexed };
    });
  };

  const handleReorderDays = (reordered: ItineraryDay[]) => {
    const reindexed = reordered.map((item, idx) => ({ ...item, day: idx + 1 }));
    setEditingPkg((prev) => (prev ? { ...prev, itinerary: reindexed } : prev));
  };

  // Inclusions and Exclusions Handlers
  const handleAddInclusion = () => {
    setEditingPkg((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        inclusions: [...(prev.inclusions || []), ''],
      };
    });
  };

  const handleUpdateInclusion = (index: number, value: string) => {
    setEditingPkg((prev) => {
      if (!prev) return prev;
      const updated = [...(prev.inclusions || [])];
      updated[index] = value;
      return { ...prev, inclusions: updated };
    });
  };

  const handleRemoveInclusion = (index: number) => {
    setEditingPkg((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        inclusions: (prev.inclusions || []).filter((_, i) => i !== index),
      };
    });
  };

  const handleAddExclusion = () => {
    setEditingPkg((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exclusions: [...(prev.exclusions || []), ''],
      };
    });
  };

  const handleUpdateExclusion = (index: number, value: string) => {
    setEditingPkg((prev) => {
      if (!prev) return prev;
      const updated = [...(prev.exclusions || [])];
      updated[index] = value;
      return { ...prev, exclusions: updated };
    });
  };

  const handleRemoveExclusion = (index: number) => {
    setEditingPkg((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exclusions: (prev.exclusions || []).filter((_, i) => i !== index),
      };
    });
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
      const numericStartingPrice = parseInt(String(startingPrice).replace(/[^0-9]/g, ''), 10) || 0;
      const discountRaw = editingPkg.discountPercentage;
      const discountPercentage =
        discountRaw !== undefined && discountRaw !== null && String(discountRaw).trim() !== ''
          ? Math.min(99, Math.max(1, Number(discountRaw)))
          : undefined;

      const originalPrice =
        discountPercentage && numericStartingPrice > 0
          ? Math.round(numericStartingPrice / (1 - discountPercentage / 100))
          : undefined;

      const cleanedInclusions = (editingPkg.inclusions || [])
        .map((s) => String(s).trim())
        .filter((s) => s.length > 0);

      const cleanedExclusions = (editingPkg.exclusions || [])
        .map((s) => String(s).trim())
        .filter((s) => s.length > 0);

      const cleanedItinerary = (editingPkg.itinerary || []).map((it, idx) => ({
        day: idx + 1,
        title: it.title || `Day ${idx + 1}`,
        description: it.description || '',
      }));

      if (isEditingExisting) {
        const payload = {
          ...editingPkg,
          ...imageCompat,
          id: String(editingPkg.id),
          name,
          startingPrice: startingPrice || (numericStartingPrice > 0 ? `₹${numericStartingPrice.toLocaleString('en-IN')}` : ''),
          priceINR: numericStartingPrice > 0 ? numericStartingPrice : undefined,
          discountPercentage,
          originalPrice,
          description: descHtml,
          overview: descHtml,
          itinerary: cleanedItinerary,
          inclusions: cleanedInclusions,
          exclusions: cleanedExclusions,
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
          startingPrice: startingPrice || (numericStartingPrice > 0 ? `₹${numericStartingPrice.toLocaleString('en-IN')}` : ''),
          priceINR: numericStartingPrice > 0 ? numericStartingPrice : undefined,
          discountPercentage,
          originalPrice,
          itinerary: cleanedItinerary,
          inclusions: cleanedInclusions,
          exclusions: cleanedExclusions,
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Starting Price (INR / text)"
                  value={editingPkg.startingPrice || ''}
                  onChange={(e) =>
                    setEditingPkg({ ...editingPkg, startingPrice: e.target.value })
                  }
                  placeholder="e.g. ₹24,999"
                  helperText="Base starting price shown to travelers."
                />

                <Input
                  label="Discount Percentage (% OFF)"
                  type="number"
                  min={0}
                  max={99}
                  value={
                    editingPkg.discountPercentage !== undefined &&
                    editingPkg.discountPercentage !== null
                      ? String(editingPkg.discountPercentage)
                      : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingPkg({
                      ...editingPkg,
                      discountPercentage: val === '' ? '' : parseInt(val, 10),
                    });
                  }}
                  placeholder="e.g. 30"
                  helperText="Shows red '30% OFF' badge. Leave blank to hide."
                />
              </div>
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

            {/* Dynamic Inclusions & Exclusions */}
            <div className="pt-6 border-t border-white/60 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag size={18} className="text-emerald-600" />
                  What's Included &amp; Not Included
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Specify what services, meals, transfers, and activities are covered or excluded for travelers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inclusions Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-zinc-800/70 border border-emerald-200/80 dark:border-emerald-900/40 shadow-xs space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-zinc-700/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        <Check size={14} />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-200">
                        What's Included ({editingPkg.inclusions?.length || 0})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      iconLeft={<Plus size={13} />}
                      onClick={handleAddInclusion}
                      className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      Add Item
                    </Button>
                  </div>

                  {!editingPkg.inclusions || editingPkg.inclusions.length === 0 ? (
                    <div className="p-4 text-center rounded-xl border border-dashed border-gray-200 dark:border-zinc-700 bg-gray-50/40 dark:bg-zinc-800/30">
                      <p className="text-xs text-gray-400">No inclusions specified yet.</p>
                      <button
                        type="button"
                        onClick={handleAddInclusion}
                        className="mt-2 text-xs font-medium text-emerald-600 hover:underline"
                      >
                        + Add first inclusion item
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {editingPkg.inclusions.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-1" />
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateInclusion(idx, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddInclusion();
                              }
                            }}
                            placeholder="e.g. 4 Star Hotel Accommodation with Breakfast"
                            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveInclusion(idx)}
                            className="p-1 text-gray-400 hover:text-rose-500 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Remove inclusion"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddInclusion}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium pt-1"
                      >
                        <Plus size={13} /> Add another inclusion
                      </button>
                    </div>
                  )}
                </div>

                {/* Exclusions Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-zinc-800/70 border border-rose-200/80 dark:border-rose-900/40 shadow-xs space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-zinc-700/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold text-xs">
                        <X size={14} />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-200">
                        Not Included ({editingPkg.exclusions?.length || 0})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      iconLeft={<Plus size={13} />}
                      onClick={handleAddExclusion}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      Add Item
                    </Button>
                  </div>

                  {!editingPkg.exclusions || editingPkg.exclusions.length === 0 ? (
                    <div className="p-4 text-center rounded-xl border border-dashed border-gray-200 dark:border-zinc-700 bg-gray-50/40 dark:bg-zinc-800/30">
                      <p className="text-xs text-gray-400">No exclusions specified yet.</p>
                      <button
                        type="button"
                        onClick={handleAddExclusion}
                        className="mt-2 text-xs font-medium text-rose-600 hover:underline"
                      >
                        + Add first exclusion item
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {editingPkg.exclusions.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 ml-1" />
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateExclusion(idx, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddExclusion();
                              }
                            }}
                            placeholder="e.g. Airfare, Personal Expenses, Camera charges"
                            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExclusion(idx)}
                            className="p-1 text-gray-400 hover:text-rose-500 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Remove exclusion"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddExclusion}
                        className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium pt-1"
                      >
                        <Plus size={13} /> Add another exclusion
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Day-by-Day Itinerary Manager */}
            <div className="pt-6 border-t border-white/60 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CalendarClock size={18} className="text-amber-500" />
                    Day-by-Day Itinerary ({editingPkg.itinerary?.length || 0}{' '}
                    {editingPkg.itinerary?.length === 1 ? 'Day' : 'Days'})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Plan daily schedule, sightseeing spots, and activities. Click any day to edit or expand. Drag handle to reorder.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  iconLeft={<Plus size={14} />}
                  onClick={() => handleInsertDay()}
                >
                  Add Day
                </Button>
              </div>

              {!editingPkg.itinerary || editingPkg.itinerary.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/40">
                  <p className="text-xs font-semibold text-gray-500">
                    No daily itinerary schedule defined yet for this package.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    iconLeft={<Plus size={13} />}
                    onClick={() => handleInsertDay()}
                    className="mt-3"
                  >
                    Add Day 1 Schedule
                  </Button>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={editingPkg.itinerary}
                  onReorder={handleReorderDays}
                  className="space-y-3"
                >
                  {editingPkg.itinerary.map((dayItem, idx) => (
                    <ItineraryDayCard
                      key={dayItem.id || `day-${idx}`}
                      dayItem={dayItem}
                      idx={idx}
                      totalDays={editingPkg.itinerary?.length || 0}
                      isExpanded={expandedDayIndex === idx}
                      onToggleExpand={() =>
                        setExpandedDayIndex(expandedDayIndex === idx ? null : idx)
                      }
                      onUpdateDay={handleUpdateDay}
                      onRemoveDay={handleRemoveDay}
                      onMoveDay={handleMoveDay}
                      onInsertBelow={handleInsertDay}
                      registerTitleRef={(index, el) => {
                        if (el) titleInputRefs.current.set(index, el);
                        else titleInputRefs.current.delete(index);
                      }}
                    />
                  ))}
                </Reorder.Group>
              )}
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
