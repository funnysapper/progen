import { GoogleButton } from './GoogleButton';
import { ApiError } from '../api/client';
import s from '../pages/auth.module.css';

// Official multi-color Google "G".
const GOOGLE_G = `<svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
</svg>`;

// "Sign in/up with" label + Google button + "Or continue with email" divider.
// The button always shows. It's functional once VITE_GOOGLE_CLIENT_ID is set;
// until then, clicking it explains how to enable Google sign-in.
export function GoogleAuth({
  label,
  run,
  onDone,
  onError,
}: {
  label: string;
  run: (idToken: string) => Promise<void>;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const configured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <>
      <p className={s.sub}>{label}</p>

      {configured ? (
        <GoogleButton
          onToken={async (idToken) => {
            try {
              await run(idToken);
              onDone();
            } catch (err) {
              onError(err instanceof ApiError ? err.message : 'Google sign-in failed');
            }
          }}
        />
      ) : (
        <button
          type="button"
          className={s.googleBtn}
          onClick={() =>
            onError('Google sign-in isn’t set up yet. Add VITE_GOOGLE_CLIENT_ID to client/.env to enable it.')
          }
        >
          <span className={s.googleG} dangerouslySetInnerHTML={{ __html: GOOGLE_G }} />
          Google
        </button>
      )}

      <div className={s.divider}>Or continue with email</div>
    </>
  );
}
