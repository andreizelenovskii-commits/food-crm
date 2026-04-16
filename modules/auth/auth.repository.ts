import { pool } from "@/shared/db/pool";
import type { AuthUser, UserRole } from "@/modules/auth/auth.types";

type UserRow = {
  id: number;
  email: string;
  password: string;
  role: string;
};

type CreateUserInput = {
  email: string;
  passwordHash: string;
  role: UserRole;
};

export interface AuthUserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  create(input: CreateUserInput): Promise<AuthUser>;
  updatePasswordHash(userId: number, passwordHash: string): Promise<void>;
  updateUser(userId: number, input: { email: string; role: UserRole; passwordHash?: string }): Promise<void>;
}

function mapRowToAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password,
    role: row.role as UserRole,
  };
}

class PgAuthUserRepository implements AuthUserRepository {
  async findByEmail(email: string) {
    const result = await pool.query<UserRow>(
      `
        SELECT "id", "email", "password", "role"
        FROM "User"
        WHERE "email" = $1
        LIMIT 1
      `,
      [email],
    );

    const row = result.rows[0];

    return row ? mapRowToAuthUser(row) : null;
  }

  async create({ email, passwordHash, role }: CreateUserInput) {
    const result = await pool.query<UserRow>(
      `
        INSERT INTO "User" ("email", "password", "role")
        VALUES ($1, $2, $3)
        RETURNING "id", "email", "password", "role"
      `,
      [email, passwordHash, role],
    );

    return mapRowToAuthUser(result.rows[0]);
  }

  async updatePasswordHash(userId: number, passwordHash: string) {
    await pool.query(
      `
        UPDATE "User"
        SET "password" = $2
        WHERE "id" = $1
      `,
      [userId, passwordHash],
    );
  }

  async updateUser(
    userId: number,
    input: { email: string; role: UserRole; passwordHash?: string },
  ) {
    if (input.passwordHash) {
      await pool.query(
        `
          UPDATE "User"
          SET "email" = $2, "role" = $3, "password" = $4
          WHERE "id" = $1
        `,
        [userId, input.email, input.role, input.passwordHash],
      );

      return;
    }

    await pool.query(
      `
        UPDATE "User"
        SET "email" = $2, "role" = $3
        WHERE "id" = $1
      `,
      [userId, input.email, input.role],
    );
  }
}

export const authUserRepository: AuthUserRepository =
  new PgAuthUserRepository();
