import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isPackageActive } from '../types/package';
import type { TourPackage } from '../types/package';

const API_URL = 'https://yjdlz1pnwl.execute-api.us-east-1.amazonaws.com';

interface PackagesContextType {
  /**
   * PUBLIC package list — ONLY packages whose `expiryDate` is in the future.
   * Expired packages can never leak to regular website visitors through this.
   */
  packages: TourPackage[];
  /**
   * RAW package list — every record in DynamoDB, expired ones included.
   * For ADMIN use only (Active/Expired tabs). Never render this on the site.
   */
  allPackages: TourPackage[];
  loading: boolean;
  error: string | null;
  refreshPackages: (type?: 'inbound' | 'outbound') => Promise<void>;
  createPackage: (payload: Record<string, unknown>) => Promise<TourPackage>;
}

const PackagesContext = createContext<PackagesContextType>({
  packages: [],
  allPackages: [],
  loading: true,
  error: null,
  refreshPackages: async () => {},
  createPackage: async () => {
    throw new Error('PackagesProvider not mounted');
  },
});

export const usePackages = () => useContext(PackagesContext);

export const PackagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allPackages, setAllPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async (type?: 'inbound' | 'outbound') => {
    try {
      setLoading(true);
      // Cache-buster so an admin extending an expiry date sees the change
      // immediately instead of a stale CDN/API-Gateway cached response.
      const url = new URL(API_URL);
      url.searchParams.append('_', Date.now().toString());
      if (type) {
        url.searchParams.append('inbound_outbound_type', type);
      }
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch packages');
      const data = await res.json();
      const list: TourPackage[] = Array.isArray(data) ? data : (data?.Items ?? data?.items ?? data?.packages ?? []);
      setAllPackages(list);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPackage = useCallback(
    async (payload: Record<string, unknown>): Promise<TourPackage> => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create package in DynamoDB');
      const created = (await res.json().catch(() => null)) as TourPackage | null;
      await fetchPackages();
      // Some backends return the created record, some return nothing — fall
      // back to locating it in the refreshed list.
      if (created && (created.id !== undefined || created.name)) return created;
      const name = String(payload.name ?? '');
      const match = allPackages.find((p) => p.name === name) ?? null;
      if (!match) throw new Error('Package was created but could not be located after refresh');
      return match;
    },
    [fetchPackages, allPackages],
  );

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // CRITICAL: strict expiry filter for the public website.
  // ONLY packages where new Date(expiryDate) > new Date() are served publicly.
  const packages = allPackages.filter((pkg) => isPackageActive(pkg));

  return (
    <PackagesContext.Provider
      value={{ packages, allPackages, loading, error, refreshPackages: fetchPackages, createPackage }}
    >
      {children}
    </PackagesContext.Provider>
  );
};
