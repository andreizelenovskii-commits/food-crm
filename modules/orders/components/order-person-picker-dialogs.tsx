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
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-zinc-950/40 px-4 py-4 sm:py-5 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-2xl rounded-[30px] border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-950/20" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
            <p className="text-sm text-zinc-600">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-zinc-200 bg-white p-2 text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900" aria-label={closeLabel}>
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
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />

          <div className="max-h-96 space-y-2 overflow-y-auto pr-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyPickerState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-4 text-sm text-zinc-500">
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
      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
        isSelected
          ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
          : "border-zinc-200 bg-zinc-50 text-zinc-900 hover:border-zinc-300 hover:bg-white"
      }`}
      aria-pressed={isSelected}
    >
      <span className="block text-sm font-medium">{title}</span>
      <span className={`mt-1 block text-xs ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
        {subtitle}
      </span>
    </button>
  );
}
