export const isAdminAuthenticated = () => {
  return localStorage.getItem('admin_auth') === 'true';
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
