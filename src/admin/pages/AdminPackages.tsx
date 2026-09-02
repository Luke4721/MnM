import { useState } from 'react';
import { usePackages } from '../../context/PackagesProvider';

const API_URL = 'https://yjdlz1pnwl.execute-api.us-east-1.amazonaws.com';

export const AdminPackages = () => {
  const { packages, refreshPackages, loading } = usePackages();
  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPkg)
      });
      if (!res.ok) throw new Error('Failed to save');
      
      await refreshPackages();
      setEditingPkg(null);
      alert('Saved successfully to AWS DynamoDB!');
    } catch (err: any) {
      alert('Error saving: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (pkg: any) => {
    if (!window.confirm(`Are you sure you want to delete "${pkg.name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/${pkg.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      await refreshPackages();
      alert('Package deleted successfully!');
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Packages</h1>
      </div>

      <div className="bg-white/50 backdrop-blur-xl border-white/60 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {editingPkg ? (
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">Editing: {editingPkg.name}</h2>
            <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  value={editingPkg.name} 
                  onChange={e => setEditingPkg({...editingPkg, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price</label>
                <input 
                  type="text" 
                  value={editingPkg.startingPrice || ''} 
                  onChange={e => setEditingPkg({...editingPkg, startingPrice: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={editingPkg.description} 
                  onChange={e => setEditingPkg({...editingPkg, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input 
                  type="text" 
                  value={editingPkg.image_url || editingPkg.img || editingPkg.image || ''} 
                  onChange={e => setEditingPkg({...editingPkg, image_url: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-lg font-medium">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => setEditingPkg(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading packages from AWS...</div>
            ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-6 py-4">Package Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {packages.map((pkg: any) => (
                  <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{pkg.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">Active</span>
                    </td>
                    <td className="px-6 py-4">{pkg.startingPrice || 'N/A'}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button onClick={() => setEditingPkg(pkg)} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs uppercase tracking-wider mr-4">Edit</button>
                      <button onClick={() => handleDelete(pkg)} className="text-red-600 hover:text-red-900 font-medium text-xs uppercase tracking-wider">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
