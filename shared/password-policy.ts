/** Правила силы пароля (без крипто-зависимостей — можно импортировать в клиентских бандлах). */
export function meetsStrongPasswordRules(password: string): boolean {
  const hasMinLength = password.length >= 12;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);

  return (
    hasMinLength &&
    hasLowercase &&
    hasUppercase &&
    hasDigit &&
    hasSpecialCharacter
  );
}

export const STRONG_PASSWORD_HINT_RU =
  "Пароль должен быть не короче 12 символов и содержать строчные и заглавные буквы, цифру и спецсимвол";
