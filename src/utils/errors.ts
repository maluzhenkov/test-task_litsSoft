import { isAxiosError } from "axios";

const FALLBACK_MESSAGE = "Что-то пошло не так. Попробуйте ещё раз.";

// json-server-auth отвечает англоязычными строками в теле ответа.
const KNOWN_MESSAGES: Record<string, string> = {
  "Cannot find user": "Пользователь с таким email не найден",
  "Incorrect password": "Неверный пароль",
  "Email and password are required": "Укажите email и пароль",
  "Email format is invalid": "Некорректный формат email",
  "Email already exists": "Пользователь с таким email уже существует",
  "Password is too short": "Пароль слишком короткий: минимум 8 символов",
};

const extractBodyMessage = (data: unknown): string | null => {
  if (typeof data === "string" && data.trim()) return data.trim();

  if (data && typeof data === "object" && "message" in data) {
    const { message } = data as { message?: unknown };
    if (typeof message === "string" && message.trim()) return message.trim();
  }

  return null;
};

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    if (error.code === "ERR_NETWORK") {
      return "Сервер недоступен. Проверьте, что mock-api запущен.";
    }

    const bodyMessage = extractBodyMessage(error.response?.data);
    if (bodyMessage) return KNOWN_MESSAGES[bodyMessage] ?? bodyMessage;

    return error.message || FALLBACK_MESSAGE;
  }

  return error instanceof Error && error.message
    ? error.message
    : FALLBACK_MESSAGE;
};

export const isUnauthorizedError = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 401;
