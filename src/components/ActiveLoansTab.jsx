import { useState } from "react";
import { isOverdue } from "../storage.js";
import LoanForm from "./LoanForm.jsx";

export default function ActiveLoansTab({
  items,
  borrowers,
  loans,
  onAddItem,
  onAddBorrower,
  onAddLoan,
  onUpdateLoan,
  onDeleteLoan,
  onReturnLoan,
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);

  const activeLoans = loans
    .filter((l) => !l.returnedAt)
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  function itemName(id) {
    return items.find((i) => i.id === id)?.name ?? "-";
  }

  function borrowerName(id) {
    return borrowers.find((b) => b.id === id)?.name ?? "-";
  }

  function openCreateForm() {
    setEditingLoan(null);
    setFormOpen(true);
  }

  function openEditForm(loan) {
    setEditingLoan(loan);
    setFormOpen(true);
  }

  function handleSubmit(loan) {
    if (loan.id) {
      onUpdateLoan(loan.id, loan);
    } else {
      onAddLoan(loan);
    }
    setFormOpen(false);
    setEditingLoan(null);
  }

  return (
    <div className="active-loans-tab">
      {formOpen ? (
        <LoanForm
          items={items}
          borrowers={borrowers}
          loans={loans}
          initialLoan={editingLoan}
          onAddItem={onAddItem}
          onAddBorrower={onAddBorrower}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      ) : (
        <button onClick={openCreateForm}>+ สร้างรายการยืมใหม่</button>
      )}

      {activeLoans.length === 0 ? (
        <p>ยังไม่มีรายการที่ยืมอยู่</p>
      ) : (
        <ul className="loan-list">
          {activeLoans.map((loan) => (
            <li key={loan.id} className="loan-row">
              <span className="loan-main">
                {itemName(loan.itemId)} — {borrowerName(loan.borrowerId)}
              </span>
              <span className="loan-dates">
                ยืม {loan.borrowDate} {loan.dueDate ? `/ คืน ${loan.dueDate}` : ""}
              </span>
              {isOverdue(loan) && <span className="badge overdue">เกินกำหนด</span>}
              <span className="loan-actions">
                <button onClick={() => onReturnLoan(loan.id)}>คืนแล้ว</button>
                <button onClick={() => openEditForm(loan)}>แก้ไข</button>
                <button onClick={() => onDeleteLoan(loan.id)}>ลบ</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
