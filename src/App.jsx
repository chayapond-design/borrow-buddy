import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";
import {
  fetchAllData,
  addItem as dbAddItem,
  deleteItem as dbDeleteItem,
  addBorrower as dbAddBorrower,
  deleteBorrower as dbDeleteBorrower,
  addLoan as dbAddLoan,
  updateLoan as dbUpdateLoan,
  deleteLoan as dbDeleteLoan,
  todayISO,
} from "./storage.js";
import LoginForm from "./components/LoginForm.jsx";
import ActiveLoansTab from "./components/ActiveLoansTab.jsx";
import HistoryTab from "./components/HistoryTab.jsx";
import ManageTab from "./components/ManageTab.jsx";

const TABS = [
  { id: "active", label: "ยืมอยู่" },
  { id: "history", label: "ประวัติ" },
  { id: "manage", label: "จัดการของ/ผู้ยืม" },
];

function reportError(err) {
  alert(err.message ?? String(err));
}

function App() {
  const [session, setSession] = useState(undefined);
  const [data, setData] = useState({ items: [], borrowers: [], loans: [] });
  const [tab, setTab] = useState("active");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setData({ items: [], borrowers: [], loans: [] });
      return;
    }
    setLoading(true);
    fetchAllData()
      .then(setData)
      .catch(reportError)
      .finally(() => setLoading(false));
  }, [session]);

  async function addItem(name) {
    try {
      const item = await dbAddItem(name);
      setData((d) => ({ ...d, items: [...d.items, item] }));
      return item;
    } catch (err) {
      reportError(err);
      throw err;
    }
  }

  async function deleteItem(id) {
    try {
      await dbDeleteItem(id);
      setData((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));
    } catch (err) {
      reportError(err);
    }
  }

  async function addBorrower(name) {
    try {
      const borrower = await dbAddBorrower(name);
      setData((d) => ({ ...d, borrowers: [...d.borrowers, borrower] }));
      return borrower;
    } catch (err) {
      reportError(err);
      throw err;
    }
  }

  async function deleteBorrower(id) {
    try {
      await dbDeleteBorrower(id);
      setData((d) => ({ ...d, borrowers: d.borrowers.filter((b) => b.id !== id) }));
    } catch (err) {
      reportError(err);
    }
  }

  async function addLoan(loan) {
    try {
      const created = await dbAddLoan(loan);
      setData((d) => ({ ...d, loans: [...d.loans, created] }));
      return created;
    } catch (err) {
      reportError(err);
    }
  }

  async function updateLoan(id, patch) {
    try {
      const updated = await dbUpdateLoan(id, patch);
      setData((d) => ({
        ...d,
        loans: d.loans.map((l) => (l.id === id ? updated : l)),
      }));
      return updated;
    } catch (err) {
      reportError(err);
    }
  }

  async function deleteLoan(id) {
    try {
      await dbDeleteLoan(id);
      setData((d) => ({ ...d, loans: d.loans.filter((l) => l.id !== id) }));
    } catch (err) {
      reportError(err);
    }
  }

  function returnLoan(id) {
    return updateLoan(id, { returnedAt: todayISO() });
  }

  function reopenLoan(id) {
    return updateLoan(id, { returnedAt: null });
  }

  function logout() {
    supabase.auth.signOut();
  }

  if (session === undefined) {
    return <div className="app">กำลังโหลด...</div>;
  }

  if (!session) {
    return <LoginForm />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1>Borrow Buddy</h1>
          <button onClick={logout}>ออกจากระบบ</button>
        </div>
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
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : (
          <>
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
              <ManageTab
                items={data.items}
                borrowers={data.borrowers}
                loans={data.loans}
                onAddItem={addItem}
                onAddBorrower={addBorrower}
                onDeleteItem={deleteItem}
                onDeleteBorrower={deleteBorrower}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
