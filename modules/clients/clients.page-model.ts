import type { SessionUser } from "@/modules/auth/auth.types";
import type { Client } from "@/modules/clients/clients.types";

export type ClientsPageSearchParams = {
  q?: string;
};

export type UpcomingBirthdayClient = Client & {
  daysUntilBirthday: number;
  formattedDate: string;
};

export type ClientsPageViewModel = {
  rawQuery: string;
  peopleClients: Client[];
  organizations: Client[];
  upcomingBirthdays: UpcomingBirthdayClient[];
};

export type ClientsPageProps = {
  user: SessionUser;
  canManageClients: boolean;
  viewModel: ClientsPageViewModel;
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function getUpcomingBirthdayMeta(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const birthDate = new Date(value);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  const currentYearBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
  );
  const nextBirthday =
    currentYearBirthday >= new Date(today.getFullYear(), today.getMonth(), today.getDate())
      ? currentYearBirthday
      : new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilBirthday = Math.round(
    (nextBirthday.getTime() - todayStart.getTime()) / msPerDay,
  );

  if (daysUntilBirthday < 0 || daysUntilBirthday > 7) {
    return null;
  }

  return {
    daysUntilBirthday,
    formattedDate: new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "long",
    }).format(nextBirthday),
  };
}

export function resolveClientsQuery(searchParams?: ClientsPageSearchParams) {
  return searchParams?.q?.trim() ?? "";
}

export function findExactClientPhoneMatch(clients: Client[], rawQuery: string) {
  const queryPhone = normalizePhone(rawQuery);

  if (!queryPhone) {
    return null;
  }

  return clients.find((client) => normalizePhone(client.phone) === queryPhone) ?? null;
}

export function buildClientsPageViewModel(
  clients: Client[],
  rawQuery: string,
): ClientsPageViewModel {
  const normalizedQuery = rawQuery.toLowerCase();
  const queryPhone = normalizePhone(rawQuery);
  const upcomingBirthdays = clients
    .filter((client) => client.type === "CLIENT")
    .map((client) => {
      const birthdayMeta = getUpcomingBirthdayMeta(client.birthDate);

      if (!birthdayMeta) {
        return null;
      }

      return {
        ...client,
        ...birthdayMeta,
      };
    })
    .filter((client): client is UpcomingBirthdayClient => Boolean(client))
    .sort((left, right) => left.daysUntilBirthday - right.daysUntilBirthday);
  const filteredClients = clients.filter((client) => {
    if (!normalizedQuery) {
      return true;
    }

    const searchablePhone = normalizePhone(client.phone);

    return (
      client.name.toLowerCase().includes(normalizedQuery) ||
      (queryPhone.length > 0 && searchablePhone.includes(queryPhone))
    );
  });

  return {
    rawQuery,
    peopleClients: filteredClients.filter((client) => client.type === "CLIENT"),
    organizations: filteredClients.filter((client) => client.type === "ORGANIZATION"),
    upcomingBirthdays,
  };
}

export function formatDaysUntilBirthday(daysUntilBirthday: number) {
  if (daysUntilBirthday === 0) {
    return "сегодня";
  }

  if (daysUntilBirthday === 1) {
    return "завтра";
  }

  const lastTwoDigits = daysUntilBirthday % 100;
  const lastDigit = daysUntilBirthday % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `через ${daysUntilBirthday} дней`;
  }

  if (lastDigit === 1) {
    return `через ${daysUntilBirthday} день`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `через ${daysUntilBirthday} дня`;
  }

  return `через ${daysUntilBirthday} дней`;
}

export function formatClientDate(value: string | null | undefined) {
  return value
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(value))
    : "Не указана";
}

export function formatClientMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
