import { supabase } from "./supabaseClient.js";

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

function mapCatalogRow(row) {
  return { id: row.id, name: row.name };
}

function mapLoanRow(row) {
  return {
    id: row.id,
    itemId: row.item_id,
    borrowerId: row.borrower_id,
    borrowDate: row.borrow_date,
    dueDate: row.due_date,
    returnedAt: row.returned_at,
  };
}

export async function fetchAllData() {
  const [itemsRes, borrowersRes, loansRes] = await Promise.all([
    supabase.from("items").select("id, name").order("name"),
    supabase.from("borrowers").select("id, name").order("name"),
    supabase
      .from("loans")
      .select("id, item_id, borrower_id, borrow_date, due_date, returned_at"),
  ]);
  if (itemsRes.error) throw itemsRes.error;
  if (borrowersRes.error) throw borrowersRes.error;
  if (loansRes.error) throw loansRes.error;
  return {
    items: itemsRes.data.map(mapCatalogRow),
    borrowers: borrowersRes.data.map(mapCatalogRow),
    loans: loansRes.data.map(mapLoanRow),
  };
}

export async function addItem(name) {
  const { data, error } = await supabase
    .from("items")
    .insert({ name })
    .select("id, name")
    .single();
  if (error) throw error;
  return mapCatalogRow(data);
}

export async function deleteItem(id) {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

export async function addBorrower(name) {
  const { data, error } = await supabase
    .from("borrowers")
    .insert({ name })
    .select("id, name")
    .single();
  if (error) throw error;
  return mapCatalogRow(data);
}

export async function deleteBorrower(id) {
  const { error } = await supabase.from("borrowers").delete().eq("id", id);
  if (error) throw error;
}

export async function addLoan({ itemId, borrowerId, borrowDate, dueDate }) {
  const { data, error } = await supabase
    .from("loans")
    .insert({
      item_id: itemId,
      borrower_id: borrowerId,
      borrow_date: borrowDate || todayISO(),
      due_date: dueDate || null,
    })
    .select("id, item_id, borrower_id, borrow_date, due_date, returned_at")
    .single();
  if (error) throw error;
  return mapLoanRow(data);
}

export async function updateLoan(id, patch) {
  const dbPatch = {};
  if ("itemId" in patch) dbPatch.item_id = patch.itemId;
  if ("borrowerId" in patch) dbPatch.borrower_id = patch.borrowerId;
  if ("borrowDate" in patch) dbPatch.borrow_date = patch.borrowDate;
  if ("dueDate" in patch) dbPatch.due_date = patch.dueDate;
  if ("returnedAt" in patch) dbPatch.returned_at = patch.returnedAt;

  const { data, error } = await supabase
    .from("loans")
    .update(dbPatch)
    .eq("id", id)
    .select("id, item_id, borrower_id, borrow_date, due_date, returned_at")
    .single();
  if (error) throw error;
  return mapLoanRow(data);
}

export async function deleteLoan(id) {
  const { error } = await supabase.from("loans").delete().eq("id", id);
  if (error) throw error;
}
