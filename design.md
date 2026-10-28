# Borrow Buddy - Design

เอกสารออกแบบเชิงเทคนิค อ้างอิงโดเมนจาก [GLOSSARY.md](./GLOSSARY.md) และขอบเขตจาก [CONTEXT.md](./CONTEXT.md)

## Tech stack

- React + Vite, ภาษา JavaScript ล้วน (.jsx, ไม่ใช้ TypeScript)
- CSS ธรรมดาเขียนเอง ไม่ใช้ CSS framework
- Backend: Supabase (Postgres + Auth) ผ่าน `@supabase/supabase-js` — ไม่มี server แยกของตัวเอง

## Data model

```
Item     { id, ownerId, name }
Borrower { id, ownerId, name }
Loan     { id, ownerId, itemId, borrowerId, borrowDate, dueDate | null, returnedAt | null }
```

`ownerId` = `auth.uid()` ของเจ้าของบัญชีที่ล็อกอิน ใส่อัตโนมัติตอน insert ใช้คู่กับ RLS เพื่อกรองข้อมูล — ดู [Row Level Security](#row-level-security-rls)

สถานะของ Loan เป็นค่า derived (ไม่เก็บลง storage ตรงๆ):
- **ยืมอยู่**: `returnedAt == null`
- **คืนแล้ว**: `returnedAt != null`
- **เกินกำหนด**: ยืมอยู่ + มี `dueDate` + `dueDate < วันนี้`

## Persistence (Supabase)

- ตาราง Postgres 3 ตาราง: `items`, `borrowers`, `loans` (คอลัมน์ตาม Data model ด้านบน, ทุกตารางมี `owner_id uuid references auth.users`)
- โหลดข้อมูลตอน mount ด้วย `supabase.from(...).select()` (กรองอัตโนมัติด้วย RLS ตาม session ที่ล็อกอินอยู่)
- เขียน/แก้/ลบผ่าน `supabase.from(...).insert/update/delete()` ทีละ record ไม่เขียนทับทั้งก้อนแบบ localStorage เดิม
- ยังไม่มีการเพิ่มการลบ Loan ใหม่ — กฎ "แก้ไข/ลบ Loan ได้เสมอแม้คืนแล้ว" เหมือน V1 ทุกประการ

### Row Level Security (RLS)

- เปิด RLS ทุกตาราง (`items`, `borrowers`, `loans`)
- Policy เดียวกันทั้ง select/insert/update/delete: `owner_id = auth.uid()`
- ผลคือเจ้าของแต่ละคนเห็น/แก้ได้เฉพาะ Item, Borrower, Loan ของตัวเองเท่านั้น

## Auth

- Supabase Auth แบบ email + password เท่านั้น
- ปิดการสมัครสมาชิกเอง (self sign-up) ที่ฝั่ง Supabase project settings — สร้างบัญชีเจ้าของผ่าน Supabase dashboard เท่านั้น
- เช็ค session ตอนเปิดเว็บ: ไม่มี session → แสดงฟอร์ม login (email + password) เท่านั้น, มี session → โหลดข้อมูลแล้วแสดง 3 แท็บตามปกติ
- ปุ่ม logout เรียก `supabase.auth.signOut()`

## State management

- `useState` ที่ระดับ `App` เก็บ state รวมทั้งหมด (items, borrowers, loans, session ผู้ใช้ที่ล็อกอิน, แท็บที่เลือกอยู่)
- โหลดข้อมูลจาก Supabase ตอน mount และหลังล็อกอินสำเร็จ, เขียนกลับ Supabase ทันทีที่มีการแก้ไข (ไม่ใช่เขียนทับทั้งก้อนแบบ `useEffect` เดิม)
- ส่ง state และฟังก์ชันแก้ไข (callback ที่เรียก Supabase แล้วอัปเดต state) ลงไปเป็น props ให้ลูก ไม่ใช้ Context/Redux/Zustand

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
    supabaseClient.js       # สร้าง Supabase client จาก URL + anon key (env var)
    storage.js              # ฟังก์ชันเรียก Supabase (CRUD items/borrowers/loans) + ฟังก์ชันคำนวณสถานะ (ยืมอยู่/คืนแล้ว/เกินกำหนด)
    components/
      LoginForm.jsx          # ฟอร์ม login email + password
      ActiveLoansTab.jsx
      HistoryTab.jsx
      ManageTab.jsx
      LoanForm.jsx           # ฟอร์มสร้างรายการยืม + quick-add ของ/ผู้ยืมใหม่ในฟอร์มเดียวกัน
```

## UI: login + 3 แท็บ (หน้าเดียว ไม่มี routing)

- ก่อนเข้า 3 แท็บต้องล็อกอินด้วย email + password ก่อน (ไม่มีหน้าสมัครสมาชิก)
- **ยืมอยู่**: list เรียงตามวันที่ต้องคืนใกล้สุดก่อน (ไม่มีวันกำหนดคืนอยู่ล่างสุด) แสดงป้าย "เกินกำหนด" ถ้าเลยกำหนด มีปุ่มกดคืน/แก้ไข/ลบต่อแถว และปุ่มสร้างรายการยืมใหม่ (เปิด `LoanForm` ซึ่ง quick-add ของ/ผู้ยืมใหม่ได้ในฟอร์มเดียวกัน)
- **ประวัติ**: list Loan ที่คืนแล้วทั้งหมด แก้ไข/ลบได้
- **จัดการของ/ผู้ยืม**: list + เพิ่ม/ลบ Item และ Borrower ตรงๆ (ลบไม่ได้ถ้ามี Loan ยืมอยู่ผูกอยู่)
