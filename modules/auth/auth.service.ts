import {
  AuthenticationError,
  ValidationError,
} from "@/shared/errors/app-error";
import { authUserRepository, type AuthUserRepository } from "@/modules/auth/auth.repository";
import { verifyPassword } from "@/modules/auth/auth.password";
import type { LoginInput, SessionUser } from "@/modules/auth/auth.types";

type AuthenticateDependencies = {
  users: AuthUserRepository;
};

const defaultDependencies: AuthenticateDependencies = {
  users: authUserRepository,
};

export async function authenticateUser(
  input: LoginInput,
  dependencies: AuthenticateDependencies = defaultDependencies,
): Promise<SessionUser> {
  if (!input.email || !input.password) {
    throw new ValidationError("Некорректные данные для входа");
  }

  const user = await dependencies.users.findByEmail(input.email);

  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new AuthenticationError("Неверный email или пароль");
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
