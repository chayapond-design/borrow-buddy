const STORAGE_KEY = "borrowBuddy";

const emptyData = () => ({ items: [], borrowers: [], loans: [] });

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw);
    return {
      items: parsed.items ?? [],
      borrowers: parsed.borrowers ?? [],
      loans: parsed.loans ?? [],
    };
  } catch {
    return emptyData();
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createId() {
  return crypto.randomUUID();
}

export function isReturned(loan) {
  return loan.returnedAt != null;
}

export function isActive(loan) {
  return !isReturned(loan);
}

export function isOverdue(loan) {
  if (!isActive(loan) || !loan.dueDate) return false;
  return loan.dueDate < todayISO();
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
