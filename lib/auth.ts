export async function signInAdmin(email: string, password: string) {
  const response = await fetch('/api/auth', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json();
  return {
    data: body.data ?? null,
    error: body.error ? { message: body.error } : null,
  };
}

export async function getAdminSession() {
  const response = await fetch('/api/auth', { cache: 'no-store', credentials: 'same-origin' });
  const body = await response.json();
  return {
    data: body.data ?? { session: null },
    error: body.error ? { message: body.error } : null,
  };
}

export async function signOutAdmin() {
  const response = await fetch('/api/auth', { method: 'DELETE', credentials: 'same-origin' });
  const body = await response.json();
  return {
    data: body.data ?? { session: null },
    error: body.error ? { message: body.error } : null,
  };
}
