import { useState } from "react";
import { isActive, todayISO } from "../storage.js";

export default function LoanForm({
  items,
  borrowers,
  loans,
  initialLoan,
  onAddItem,
  onAddBorrower,
  onSubmit,
  onCancel,
}) {
  const isEditing = Boolean(initialLoan);

  const availableItems = items.filter((item) => {
    const activeLoan = loans.find((l) => l.itemId === item.id && isActive(l));
    return !activeLoan || activeLoan.id === initialLoan?.id;
  });

  const [itemId, setItemId] = useState(initialLoan?.itemId ?? "");
  const [borrowerId, setBorrowerId] = useState(initialLoan?.borrowerId ?? "");
  const [borrowDate, setBorrowDate] = useState(initialLoan?.borrowDate ?? todayISO());
  const [dueDate, setDueDate] = useState(initialLoan?.dueDate ?? "");
  const [newItemName, setNewItemName] = useState("");
  const [newBorrowerName, setNewBorrowerName] = useState("");

  async function handleAddItem() {
    const name = newItemName.trim();
    if (!name) return;
    const item = await onAddItem(name);
    setItemId(item.id);
    setNewItemName("");
  }

  async function handleAddBorrower() {
    const name = newBorrowerName.trim();
    if (!name) return;
    const borrower = await onAddBorrower(name);
    setBorrowerId(borrower.id);
    setNewBorrowerName("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!itemId || !borrowerId || !borrowDate) return;
    onSubmit({
      id: initialLoan?.id,
      itemId,
      borrowerId,
      borrowDate,
      dueDate: dueDate || null,
    });
  }

  return (
    <form className="loan-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? "แก้ไขรายการยืม" : "สร้างรายการยืมใหม่"}</h2>

      <label>
        ของ
        <select value={itemId} onChange={(e) => setItemId(e.target.value)}>
          <option value="">-- เลือกของ --</option>
          {availableItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <div className="quick-add">
        <input
          placeholder="เพิ่มของใหม่"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <button type="button" onClick={handleAddItem}>
          เพิ่ม
        </button>
      </div>

      <label>
        ผู้ยืม
        <select value={borrowerId} onChange={(e) => setBorrowerId(e.target.value)}>
          <option value="">-- เลือกผู้ยืม --</option>
          {borrowers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <div className="quick-add">
        <input
          placeholder="เพิ่มผู้ยืมใหม่"
          value={newBorrowerName}
          onChange={(e) => setNewBorrowerName(e.target.value)}
        />
        <button type="button" onClick={handleAddBorrower}>
          เพิ่ม
        </button>
      </div>

      <label>
        วันที่ยืม
        <input
          type="date"
          value={borrowDate}
          onChange={(e) => setBorrowDate(e.target.value)}
          required
        />
      </label>

      <label>
        วันที่ต้องคืน (ไม่บังคับ)
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>

      <div className="form-actions">
        <button type="submit">บันทึก</button>
        <button type="button" onClick={onCancel}>
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
