import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = 'https://yjdlz1pnwl.execute-api.us-east-1.amazonaws.com';

interface PackagesContextType {
  packages: any[];
  loading: boolean;
  error: string | null;
  refreshPackages: () => Promise<void>;
}

const PackagesContext = createContext<PackagesContextType>({
  packages: [],
  loading: true,
  error: null,
  refreshPackages: async () => {},
});

export const usePackages = () => useContext(PackagesContext);

export const PackagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch packages');
      const data = await res.json();
      setPackages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return (
    <PackagesContext.Provider value={{ packages, loading, error, refreshPackages: fetchPackages }}>
      {children}
    </PackagesContext.Provider>
  );
};
