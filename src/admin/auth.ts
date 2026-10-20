import { ADMIN_API_TOKEN } from '../../config/appConfig.ts';

export const isAdminAuthenticated = () => {
  return localStorage.getItem('admin_auth') === 'true';
};

export const getAdminToken = (): string => {
  return (
    ADMIN_API_TOKEN ||
    localStorage.getItem('admin_api_token') ||
    'mnm_admin_secure_token_2026'
  );
};

export const loginAdmin = (password: string) => {
  if (password === 'Oncology@1857') {
    localStorage.setItem('admin_auth', 'true');
    return true;
  }
  return false;
};

export const logoutAdmin = () => {
  localStorage.removeItem('admin_auth');
};
