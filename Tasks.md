# Borrow Buddy - Tasks

ลำดับงาน implement ตาม [design.md](./design.md) (อ้างอิงกฎโดเมนจาก [CONTEXT.md](./CONTEXT.md)) ทำเรียงตามลำดับ แต่ละงานควร build/รันผ่านก่อนไปงานถัดไป

## 1. Scaffold โปรเจกต์

- [ ] สร้างโปรเจกต์ Vite + React (JS, ไม่ใช่ TS) ในโฟลเดอร์ `borrow-buddy/`
- [ ] ลบไฟล์ตัวอย่าง/boilerplate ที่ Vite สร้างมาให้ที่ไม่ใช้ (logo, ตัวอย่าง counter)
- [ ] รัน dev server ตรวจว่าหน้าเปล่าขึ้นได้

## 2. Storage layer (`src/storage.js`)

- [ ] ฟังก์ชัน `loadData()` อ่าน key `"borrowBuddy"` จาก localStorage, คืนค่าเริ่มต้น `{ items: [], borrowers: [], loans: [] }` ถ้ายังไม่มี
- [ ] ฟังก์ชัน `saveData(data)` เขียนทับ key เดิมเป็น JSON
- [ ] ฟังก์ชันคำนวณสถานะ loan: `isActive(loan)`, `isReturned(loan)`, `isOverdue(loan)` ตามกฎใน design.md
- [ ] ฟังก์ชันช่วยสร้าง id (เช่น `crypto.randomUUID()`)

## 3. `App.jsx` โครงหลัก

- [ ] `useState` เก็บ `{ items, borrowers, loans }` เริ่มต้นจาก `loadData()`
- [ ] `useEffect` เรียก `saveData()` ทุกครั้งที่ state เปลี่ยน
- [ ] `useState` เก็บแท็บที่เลือกอยู่ (ยืมอยู่ / ประวัติ / จัดการ)
- [ ] UI สลับแท็บ (ปุ่ม/nav ง่ายๆ ไม่มี routing library)
- [ ] ส่ง state + callback (add/update/delete item, borrower, loan) ลงเป็น props ให้แต่ละแท็บ

## 4. `LoanForm.jsx` (สร้าง/แก้ไขรายการยืม + quick-add)

- [ ] ฟอร์ม: เลือกของ (dropdown, filter ของที่ "ยืมอยู่" แล้วออกตามกฎ), เลือกผู้ยืม, วันที่ยืม (default วันนี้), วันที่ต้องคืน (ไม่บังคับ)
- [ ] ปุ่ม quick-add ของใหม่ / ผู้ยืมใหม่ในฟอร์มเดียวกัน (เพิ่มเข้า catalog ทันทีที่กด)
- [ ] ใช้ฟอร์มเดียวกันได้ทั้งโหมดสร้างใหม่และโหมดแก้ไข loan เดิม

## 5. `ActiveLoansTab.jsx`

- [ ] แสดง loan ที่ "ยืมอยู่" เรียงตามวันที่ต้องคืนใกล้สุดก่อน (ไม่มีกำหนดคืนอยู่ล่างสุด)
- [ ] ป้าย "เกินกำหนด" ถ้าเข้าเงื่อนไข overdue
- [ ] ปุ่มต่อแถว: กดคืน (set `returnedAt` เป็นวันนี้), แก้ไข (เปิด `LoanForm`), ลบ
- [ ] ปุ่มเปิด `LoanForm` เพื่อสร้างรายการยืมใหม่

## 6. `HistoryTab.jsx`

- [ ] แสดง loan ที่คืนแล้วทั้งหมด
- [ ] ปุ่มแก้ไข (เปิด `LoanForm`, แก้ย้อนกลับเป็นยืมอยู่ได้ด้วยถ้าลบ `returnedAt`), ลบ

## 7. `ManageTab.jsx`

- [ ] list + เพิ่ม/ลบ Item ตรงๆ
- [ ] list + เพิ่ม/ลบ Borrower ตรงๆ
- [ ] ปุ่มลบ disable หรือแจ้งเตือนถ้า Item/Borrower นั้นมี loan ที่ "ยืมอยู่" ผูกอยู่

## 8. Styling (`App.css`)

- [ ] จัด layout แท็บ, list, ฟอร์ม, ป้ายสถานะ (ยืมอยู่ / คืนแล้ว / เกินกำหนด) ให้อ่านง่าย

## 9. ทดสอบ end-to-end ด้วยมือ

- [ ] เพิ่มของ+ผู้ยืมผ่าน quick-add แล้วสร้างรายการยืม ตรวจว่าเลือกของที่ "ยืมอยู่" แล้วไม่ได้
- [ ] กดคืนของ ตรวจว่าย้ายไปแท็บประวัติ พร้อมวันที่คืน = วันนี้
- [ ] ตั้งวันที่ต้องคืนเป็นอดีต ตรวจว่าป้าย "เกินกำหนด" ขึ้น
- [ ] ลองลบ Item/Borrower ที่มี loan ยืมอยู่ผูกอยู่ ตรวจว่าลบไม่ได้
- [ ] รีเฟรชหน้าเว็บ ตรวจว่าข้อมูลยังอยู่ (localStorage persist ถูกต้อง)
