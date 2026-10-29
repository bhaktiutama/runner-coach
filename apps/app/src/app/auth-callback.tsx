import { Redirect } from 'expo-router';

/** Tujuan redirect OAuth native; sesi ditukar di auth/service.ts. */
export default function AuthCallback() {
  return <Redirect href="/" />;
}
