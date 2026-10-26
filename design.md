# Borrow Buddy - Design

เอกสารออกแบบเชิงเทคนิค อ้างอิงโดเมนจาก [GLOSSARY.md](./GLOSSARY.md) และขอบเขตจาก [CONTEXT.md](./CONTEXT.md)

## Tech stack

- React + Vite, ภาษา JavaScript ล้วน (.jsx, ไม่ใช้ TypeScript)
- CSS ธรรมดาเขียนเอง ไม่ใช้ CSS framework
- ไม่มี backend/server — เก็บข้อมูลใน localStorage ของเบราว์เซอร์เท่านั้น

## Data model

```
Item     { id, name }
Borrower { id, name }
Loan     { id, itemId, borrowerId, borrowDate, dueDate | null, returnedAt | null }
```

สถานะของ Loan เป็นค่า derived (ไม่เก็บลง storage ตรงๆ):
- **ยืมอยู่**: `returnedAt == null`
- **คืนแล้ว**: `returnedAt != null`
- **เกินกำหนด**: ยืมอยู่ + มี `dueDate` + `dueDate < วันนี้`

## Persistence

- localStorage คีย์เดียว ชื่อ `"borrowBuddy"` เก็บ `{ items, borrowers, loans }` ทั้งก้อนเป็น JSON
- โหลดค่าตอน mount (`useState(() => ...)` อ่านจาก localStorage, ถ้าไม่มีให้ใช้ค่าเริ่มต้น `{ items: [], borrowers: [], loans: [] }`)
- เขียนทับ key เดิมทุกครั้งที่ state เปลี่ยน ผ่าน `useEffect`

## State management

- `useState` ที่ระดับ `App` เก็บ state รวมทั้งหมด (items, borrowers, loans, แท็บที่เลือกอยู่)
- ส่ง state และฟังก์ชันแก้ไข (callback) ลงไปเป็น props ให้ลูก ไม่ใช้ Context/Redux/Zustand

## กฎความสมบูรณ์ของข้อมูล (UI ต้องบังคับ)

- ของ 1 ชิ้น มี Loan ที่ "ยืมอยู่" ได้ไม่เกิน 1 รายการในเวลาเดียวกัน — ตอนสร้าง Loan ใหม่ ต้อง filter ของที่ "ยืมอยู่" แล้วออกจากตัวเลือก
- ลบ Item/Borrower ไม่ได้ถ้ามี Loan ที่ "ยืมอยู่" อ้างอิงอยู่ (ปุ่มลบ disable หรือแจ้งเตือน)

## โครงสร้างไฟล์โปรเจกต์

```
borrow-buddy/
  GLOSSARY.md
  CONTEXT.md
  design.md
  package.json
  vite.config.js
  index.html
  src/
    main.jsx
    App.jsx
    App.css
    storage.js              # โหลด/บันทึก localStorage, ฟังก์ชันคำนวณสถานะ (ยืมอยู่/คืนแล้ว/เกินกำหนด)
    components/
      ActiveLoansTab.jsx
      HistoryTab.jsx
      ManageTab.jsx
      LoanForm.jsx           # ฟอร์มสร้างรายการยืม + quick-add ของ/ผู้ยืมใหม่ในฟอร์มเดียวกัน
```

## UI: 3 แท็บ (หน้าเดียว ไม่มี routing)

- **ยืมอยู่**: list เรียงตามวันที่ต้องคืนใกล้สุดก่อน (ไม่มีวันกำหนดคืนอยู่ล่างสุด) แสดงป้าย "เกินกำหนด" ถ้าเลยกำหนด มีปุ่มกดคืน/แก้ไข/ลบต่อแถว และปุ่มสร้างรายการยืมใหม่ (เปิด `LoanForm` ซึ่ง quick-add ของ/ผู้ยืมใหม่ได้ในฟอร์มเดียวกัน)
- **ประวัติ**: list Loan ที่คืนแล้วทั้งหมด แก้ไข/ลบได้
- **จัดการของ/ผู้ยืม**: list + เพิ่ม/ลบ Item และ Borrower ตรงๆ (ลบไม่ได้ถ้ามี Loan ยืมอยู่ผูกอยู่)
