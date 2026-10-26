import { useState } from "react";

export default function ManageTab({
  items,
  borrowers,
  loans,
  onAddItem,
  onAddBorrower,
  onDeleteItem,
  onDeleteBorrower,
}) {
  const [newItemName, setNewItemName] = useState("");
  const [newBorrowerName, setNewBorrowerName] = useState("");

  function itemHasActiveLoan(itemId) {
    return loans.some((l) => l.itemId === itemId && !l.returnedAt);
  }

  function borrowerHasActiveLoan(borrowerId) {
    return loans.some((l) => l.borrowerId === borrowerId && !l.returnedAt);
  }

  function handleAddItem(e) {
    e.preventDefault();
    const name = newItemName.trim();
    if (!name) return;
    onAddItem(name);
    setNewItemName("");
  }

  function handleAddBorrower(e) {
    e.preventDefault();
    const name = newBorrowerName.trim();
    if (!name) return;
    onAddBorrower(name);
    setNewBorrowerName("");
  }

  return (
    <div className="manage-tab">
      <section>
        <h2>ของ</h2>
        <form onSubmit={handleAddItem} className="quick-add">
          <input
            placeholder="ชื่อของใหม่"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
          <button type="submit">เพิ่ม</button>
        </form>
        <ul className="catalog-list">
          {items.map((item) => {
            const locked = itemHasActiveLoan(item.id);
            return (
              <li key={item.id}>
                <span>{item.name}</span>
                <button
                  disabled={locked}
                  title={locked ? "ลบไม่ได้ เพราะมีรายการยืมอยู่" : undefined}
                  onClick={() => onDeleteItem(item.id)}
                >
                  ลบ
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2>ผู้ยืม</h2>
        <form onSubmit={handleAddBorrower} className="quick-add">
          <input
            placeholder="ชื่อผู้ยืมใหม่"
            value={newBorrowerName}
            onChange={(e) => setNewBorrowerName(e.target.value)}
          />
          <button type="submit">เพิ่ม</button>
        </form>
        <ul className="catalog-list">
          {borrowers.map((borrower) => {
            const locked = borrowerHasActiveLoan(borrower.id);
            return (
              <li key={borrower.id}>
                <span>{borrower.name}</span>
                <button
                  disabled={locked}
                  title={locked ? "ลบไม่ได้ เพราะมีรายการยืมอยู่" : undefined}
                  onClick={() => onDeleteBorrower(borrower.id)}
                >
                  ลบ
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
