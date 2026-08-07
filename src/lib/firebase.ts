export const firebaseDatabaseUrl = (
  import.meta.env.VITE_FIREBASE_DATABASE_URL ??
  'https://techglaz-hackfest-default-rtdb.firebaseio.com'
).replace(/\/$/, '');

export const allowedLoginEmail = (
  import.meta.env.VITE_ALLOWED_LOGIN_EMAIL ?? 'aqabsami99@gmail.com'
).toLowerCase();

export const allowedLoginPassword = import.meta.env.VITE_ALLOWED_LOGIN_PASSWORD ?? 'aqabsami';
