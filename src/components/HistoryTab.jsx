import { useState } from "react";
import LoanForm from "./LoanForm.jsx";

export default function HistoryTab({
  items,
  borrowers,
  loans,
  onAddItem,
  onAddBorrower,
  onUpdateLoan,
  onDeleteLoan,
  onReopenLoan,
}) {
  const [editingLoan, setEditingLoan] = useState(null);

  const historyLoans = loans
    .filter((l) => l.returnedAt)
    .sort((a, b) => b.returnedAt.localeCompare(a.returnedAt));

  function itemName(id) {
    return items.find((i) => i.id === id)?.name ?? "-";
  }

  function borrowerName(id) {
    return borrowers.find((b) => b.id === id)?.name ?? "-";
  }

  function handleSubmit(loan) {
    onUpdateLoan(loan.id, loan);
    setEditingLoan(null);
  }

  return (
    <div className="history-tab">
      {editingLoan && (
        <LoanForm
          items={items}
          borrowers={borrowers}
          loans={loans}
          initialLoan={editingLoan}
          onAddItem={onAddItem}
          onAddBorrower={onAddBorrower}
          onSubmit={handleSubmit}
          onCancel={() => setEditingLoan(null)}
        />
      )}

      {historyLoans.length === 0 ? (
        <p>ยังไม่มีประวัติการคืน</p>
      ) : (
        <ul className="loan-list">
          {historyLoans.map((loan) => (
            <li key={loan.id} className="loan-row">
              <span className="loan-main">
                {itemName(loan.itemId)} — {borrowerName(loan.borrowerId)}
              </span>
              <span className="loan-dates">
                ยืม {loan.borrowDate} / คืนแล้ว {loan.returnedAt}
              </span>
              <span className="loan-actions">
                <button onClick={() => onReopenLoan(loan.id)}>ยืมอยู่อีกครั้ง</button>
                <button onClick={() => setEditingLoan(loan)}>แก้ไข</button>
                <button onClick={() => onDeleteLoan(loan.id)}>ลบ</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
