const TOKEN_KEY = "tt:access-token";
const EMAIL_KEY = "tt:email";

export const readToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const readEmail = (): string | null => localStorage.getItem(EMAIL_KEY);

export const saveSession = (token: string, email: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
};
