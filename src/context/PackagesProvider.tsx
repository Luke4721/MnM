import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isPackageActive } from '../types/package';
import type { TourPackage } from '../types/package';

import { PACKAGES_API_URL } from '../../config/appConfig.ts';

const API_URL = PACKAGES_API_URL;

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
      const rawList: TourPackage[] = Array.isArray(data) ? data : (data?.Items ?? data?.items ?? data?.packages ?? []);
      
      const getPkgTimestamp = (pkg: TourPackage): number => {
        if (pkg.createdAt) {
          const t = new Date(pkg.createdAt).getTime();
          if (!isNaN(t)) return t;
        }
        if (pkg.updatedAt) {
          const t = new Date(pkg.updatedAt).getTime();
          if (!isNaN(t)) return t;
        }
        const match = String(pkg.id || '').match(/(\d{10,13})/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > 1577836800000 && num < 2051222400000) return num;
        }
        return 0;
      };

      const sortedList = [...rawList].sort((a, b) => getPkgTimestamp(b) - getPkgTimestamp(a));
      setAllPackages(sortedList);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPackage = useCallback(
    async (payload: Record<string, unknown>): Promise<TourPackage> => {
      // Ensure id is sent as string (DynamoDB primary key schema requires S)
      const stringId =
        payload.id !== undefined && payload.id !== null
          ? String(payload.id)
          : String(Date.now());
      const safePayload = {
        ...payload,
        id: stringId,
      };

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safePayload),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || 'Failed to create package in DynamoDB');
      }
      const created = (await res.json().catch(() => null)) as any;
      await fetchPackages();
      // Backend returns { message: 'Success', item: {...} } or {...}
      const createdItem = created?.item || created;
      if (createdItem && (createdItem.id !== undefined || createdItem.name)) {
        return createdItem as TourPackage;
      }
      const name = String((safePayload as Record<string, unknown>).name ?? '');
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
