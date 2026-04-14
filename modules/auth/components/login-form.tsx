import { loginAction } from "@/modules/auth/auth.actions";
import { SurfaceCard } from "@/components/ui/surface-card";

export function LoginForm() {
  return (
    <SurfaceCard className="mx-auto max-w-md">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-zinc-950">Вход в CRM</h2>
        <p className="text-sm leading-6 text-zinc-600">
          Введи данные администратора, чтобы открыть рабочую панель.
        </p>
      </div>

      <form action={loginAction} className="mt-8 space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Email</span>
          <input
            name="email"
            type="email"
            placeholder="admin@example.com"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            autoComplete="email"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Пароль</span>
          <input
            name="password"
            type="password"
            placeholder="123456"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            autoComplete="current-password"
            required
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Войти
        </button>
      </form>
    </SurfaceCard>
  );
}
