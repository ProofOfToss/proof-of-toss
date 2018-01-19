export const AUTHENTICATE_USER = 'AUTHENTICATE_USER';
export const LOGOUT_USER = 'LOGOUT_USER';

export const authenticateUser = (address) => ({
  'type': AUTHENTICATE_USER,
  'address': address
});

export const logoutUser = () => ({
  'type': LOGOUT_USER
});
