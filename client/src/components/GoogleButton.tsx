import { GoogleLogin } from '@react-oauth/google';

// Renders the Google sign-in button — but only when a Client ID is configured
// (VITE_GOOGLE_CLIENT_ID). Without it, this renders nothing, so email/password
// still works and nothing errors.
export function GoogleButton({ onToken }: { onToken: (idToken: string) => void }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <GoogleLogin
        width="380"
        onSuccess={(cred) => {
          if (cred.credential) onToken(cred.credential);
        }}
        onError={() => {
          /* user closed the popup or it failed — no action needed */
        }}
      />
    </div>
  );
}
