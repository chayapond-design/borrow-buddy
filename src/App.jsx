import { useEffect, useState } from "react";
import { loadData, saveData, createId, todayISO } from "./storage.js";
import ActiveLoansTab from "./components/ActiveLoansTab.jsx";
import HistoryTab from "./components/HistoryTab.jsx";

const TABS = [
  { id: "active", label: "ยืมอยู่" },
  { id: "history", label: "ประวัติ" },
  { id: "manage", label: "จัดการของ/ผู้ยืม" },
];

function App() {
  const [data, setData] = useState(() => loadData());
  const [tab, setTab] = useState("active");

  useEffect(() => {
    saveData(data);
  }, [data]);

  function addItem(name) {
    const item = { id: createId(), name };
    setData((d) => ({ ...d, items: [...d.items, item] }));
    return item;
  }

  function deleteItem(id) {
    setData((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));
  }

  function addBorrower(name) {
    const borrower = { id: createId(), name };
    setData((d) => ({ ...d, borrowers: [...d.borrowers, borrower] }));
    return borrower;
  }

  function deleteBorrower(id) {
    setData((d) => ({
      ...d,
      borrowers: d.borrowers.filter((b) => b.id !== id),
    }));
  }

  function addLoan({ itemId, borrowerId, borrowDate, dueDate }) {
    const loan = {
      id: createId(),
      itemId,
      borrowerId,
      borrowDate: borrowDate || todayISO(),
      dueDate: dueDate || null,
      returnedAt: null,
    };
    setData((d) => ({ ...d, loans: [...d.loans, loan] }));
    return loan;
  }

  function updateLoan(id, patch) {
    setData((d) => ({
      ...d,
      loans: d.loans.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }

  function deleteLoan(id) {
    setData((d) => ({ ...d, loans: d.loans.filter((l) => l.id !== id) }));
  }

  function returnLoan(id) {
    updateLoan(id, { returnedAt: todayISO() });
  }

  function reopenLoan(id) {
    updateLoan(id, { returnedAt: null });
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Borrow Buddy</h1>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={t.id === tab ? "tab active" : "tab"}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {tab === "active" && (
          <ActiveLoansTab
            items={data.items}
            borrowers={data.borrowers}
            loans={data.loans}
            onAddItem={addItem}
            onAddBorrower={addBorrower}
            onAddLoan={addLoan}
            onUpdateLoan={updateLoan}
            onDeleteLoan={deleteLoan}
            onReturnLoan={returnLoan}
          />
        )}
        {tab === "history" && (
          <HistoryTab
            items={data.items}
            borrowers={data.borrowers}
            loans={data.loans}
            onAddItem={addItem}
            onAddBorrower={addBorrower}
            onUpdateLoan={updateLoan}
            onDeleteLoan={deleteLoan}
            onReopenLoan={reopenLoan}
          />
        )}
        {tab === "manage" && (
          <p>
            ของ: {data.items.length} รายการ / ผู้ยืม: {data.borrowers.length} คน
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
