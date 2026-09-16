import React, { useState } from 'react';
import { usePackages } from '../../context/PackagesProvider';
import { PackageImageManager } from '../components/PackageImageManager';
import type { PackageGalleryImage } from '../../types/blogAdmin';
import { Search, Image as ImageIcon, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { ConfirmModal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

const API_URL = 'https://yjdlz1pnwl.execute-api.us-east-1.amazonaws.com';

export const AdminPackages: React.FC = () => {
  const { packages, refreshPackages, loading } = usePackages();
  const { toast } = useToast();

  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [pkgToDelete, setPkgToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State for Images
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<PackageGalleryImage[]>([]);

  const startEditing = (pkg: any) => {
    setEditingPkg(pkg);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    setIsSaving(true);

    const orderUrls = galleryImages.map((g) => g.url);
    const activeFeatured = featuredImage || (galleryImages[0]?.url ?? '');

    const payload = {
      ...editingPkg,
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
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save to DynamoDB');

      await refreshPackages();
      toast.success(`"${editingPkg.name}" updated successfully!`);
      setTimeout(() => {
        setEditingPkg(null);
      }, 600);
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
      if (!res.ok) throw new Error('Failed to delete');
      await refreshPackages();
      toast.success(`Package "${pkgToDelete.name}" deleted successfully.`);
      setPkgToDelete(null);
    } catch (err: any) {
      toast.error('Error deleting package: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPackages = packages.filter((pkg: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      pkg.name?.toLowerCase().includes(q) ||
      pkg.destination?.toLowerCase().includes(q) ||
      pkg.startingPrice?.toString().toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 pb-16">
      {/* Header */}
      <PageHeader
        title={editingPkg ? `Edit Package: ${editingPkg.name}` : 'Manage Packages'}
        description="Browse and update travel packages, starting prices, and multi-image galleries stored in AWS DynamoDB & S3."
        breadcrumbs={[
          { label: 'Management', href: '/admin/packages' },
          { label: 'Packages', href: '/admin/packages' },
          ...(editingPkg ? [{ label: editingPkg.name }] : []),
        ]}
        actions={
          editingPkg ? (
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<ArrowLeft size={14} />}
              onClick={() => setEditingPkg(null)}
            >
              Back to Packages List
            </Button>
          ) : undefined
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
                onChange={(e) =>
                  setEditingPkg({ ...editingPkg, name: e.target.value })
                }
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

            <Textarea
              label="Description"
              rows={4}
              value={editingPkg.description || ''}
              onChange={(e) =>
                setEditingPkg({ ...editingPkg, description: e.target.value })
              }
              placeholder="Comprehensive overview of itinerary, inclusions, and highlights..."
            />

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
              >
                {isSaving ? 'Saving to DynamoDB...' : 'Save All Changes'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingPkg(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          {/* Table Search Toolbar */}
          <div className="p-4 border-b border-white/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search packages by name or price..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconLeft={<Search size={15} />}
              />
            </div>

            <span className="text-xs text-gray-500 font-medium self-end sm:self-auto">
              Showing <strong className="text-gray-900">{filteredPackages.length}</strong> of{' '}
              {packages.length} packages
            </span>
          </div>

          {/* Packages Table */}
          <div className="overflow-x-auto" data-lenis-prevent>
            {loading ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                Loading packages from AWS DynamoDB...
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                No packages match your search query.
              </div>
            ) : (
              <table className="w-full text-left text-[13px] text-gray-700">
                <thead className="bg-white/40 border-b border-white/60 text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Image</th>
                    <th className="px-6 py-3.5">Package Name</th>
                    <th className="px-6 py-3.5">Gallery Photos</th>
                    <th className="px-6 py-3.5">Starting Price</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {filteredPackages.map((pkg: any) => {
                    const cover =
                      pkg.featuredImage ||
                      pkg.image_url ||
                      pkg.heroImage ||
                      pkg.image ||
                      pkg.img ||
                      '';
                    const galleryCount = Array.isArray(pkg.galleryImages)
                      ? pkg.galleryImages.length
                      : cover
                      ? 1
                      : 0;

                    return (
                      <tr
                        key={pkg.id}
                        className="hover:bg-white/60 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <div className="w-14 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-white/80 shadow-sm">
                            {cover ? (
                              <img
                                src={cover}
                                alt={pkg.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                                No Img
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-3.5">
                          <div className="font-bold text-gray-900 text-sm">
                            {pkg.name}
                          </div>
                          {pkg.destination && (
                            <div className="text-xs text-gray-400">
                              {pkg.destination}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            <ImageIcon size={12} /> {galleryCount} photo
                            {galleryCount === 1 ? '' : 's'}
                          </span>
                        </td>

                        <td className="px-6 py-3.5 font-bold text-gray-900">
                          {pkg.startingPrice || 'N/A'}
                        </td>

                        <td className="px-6 py-3.5 text-right whitespace-nowrap">
                          <Button
                            variant="secondary"
                            size="sm"
                            iconLeft={<Edit2 size={13} className="text-indigo-600" />}
                            onClick={() => startEditing(pkg)}
                            className="mr-2"
                          >
                            Edit
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
                  })}
                </tbody>
              </table>
            )}
          </div>
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
