import { PaginatedList } from "@/components/ui/paginated-list";
import type { Client } from "@/modules/clients/clients.types";
import type { Employee } from "@/modules/employees/employees.types";

export function ClientPickerDialog({
  clients,
  selectedClientId,
  query,
  onQueryChange,
  onSelect,
  onClose,
}: {
  clients: Client[];
  selectedClientId: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (client: Client) => void;
  onClose: () => void;
}) {
  return (
    <PickerDialog
      title="Выбери клиента"
      description="Ищи по имени, фамилии или телефону."
      closeLabel="Закрыть окно выбора клиента"
      query={query}
      placeholder="Поиск по имени, фамилии или телефону"
      onQueryChange={onQueryChange}
      onClose={onClose}
    >
      {clients.length === 0 ? (
        <EmptyPickerState>Клиенты не найдены.</EmptyPickerState>
      ) : (
        <PaginatedList itemLabel="клиентов" className="space-y-2">
          {clients.map((client) => (
            <PickerOption
              key={client.id}
              isSelected={selectedClientId === String(client.id)}
              title={client.name}
              subtitle={`${client.phone}${client.email ? ` · ${client.email}` : ""}`}
              onClick={() => onSelect(client)}
            />
          ))}
        </PaginatedList>
      )}
    </PickerDialog>
  );
}

export function EmployeePickerDialog({
  employees,
  selectedEmployeeId,
  query,
  onQueryChange,
  onSelect,
  onClose,
}: {
  employees: Employee[];
  selectedEmployeeId: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (employee: Employee) => void;
  onClose: () => void;
}) {
  return (
    <PickerDialog
      title="Выбери исполнителя"
      description="Ищи по имени, фамилии или телефону."
      closeLabel="Закрыть окно выбора исполнителя"
      query={query}
      placeholder="Поиск по имени, фамилии или телефону"
      onQueryChange={onQueryChange}
      onClose={onClose}
    >
      {employees.length === 0 ? (
        <EmptyPickerState>Сотрудники не найдены.</EmptyPickerState>
      ) : (
        <PaginatedList itemLabel="сотрудников" className="space-y-2">
          {employees.map((employee) => (
            <PickerOption
              key={employee.id}
              isSelected={selectedEmployeeId === String(employee.id)}
              title={employee.name}
              subtitle={`${employee.role}${employee.phone ? ` · ${employee.phone}` : ""}`}
              onClick={() => onSelect(employee)}
            />
          ))}
        </PaginatedList>
      )}
    </PickerDialog>
  );
}

function PickerDialog({
  title,
  description,
  closeLabel,
  query,
  placeholder,
  children,
  onQueryChange,
  onClose,
}: {
  title: string;
  description: string;
  closeLabel: string;
  query: string;
  placeholder: string;
  children: React.ReactNode;
  onQueryChange: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-zinc-950/40 px-4 py-4 backdrop-blur-sm sm:py-5" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="foodlike-frame w-full max-w-2xl p-4 sm:p-5" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="foodlike-kicker">Выбор</p>
            <h3 className="foodlike-title-sm">{title}</h3>
            <p className="text-sm text-zinc-600">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-white/90 text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white" aria-label={closeLabel}>
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            className="foodlike-field"
          />

          <div className="max-h-96 space-y-2 overflow-y-auto pr-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyPickerState({ children }: { children: React.ReactNode }) {
  return (
    <div className="foodlike-empty px-4 py-4">
      {children}
    </div>
  );
}

function PickerOption({
  isSelected,
  title,
  subtitle,
  onClick,
}: {
  isSelected: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[18px] border px-4 py-3 text-left shadow-sm transition ${
        isSelected
          ? "border-red-800 bg-red-800 text-white shadow-red-950/15"
          : "border-red-950/10 bg-white/78 text-zinc-900 shadow-red-950/5 hover:border-red-200 hover:bg-white"
      }`}
      aria-pressed={isSelected}
    >
      <span className="block text-sm font-medium">{title}</span>
      <span className={`mt-1 block text-xs ${isSelected ? "text-red-50/75" : "text-zinc-500"}`}>
        {subtitle}
      </span>
    </button>
  );
}
