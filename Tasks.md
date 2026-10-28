# Borrow Buddy - Tasks

ลำดับงาน implement ตาม [design.md](./design.md) (อ้างอิงกฎโดเมนจาก [CONTEXT.md](./CONTEXT.md)) ทำเรียงตามลำดับ แต่ละงานควร build/รันผ่านก่อนไปงานถัดไป

## 1. Scaffold โปรเจกต์

- [x] สร้างโปรเจกต์ Vite + React (JS, ไม่ใช่ TS) ในโฟลเดอร์ `borrow-buddy/`
- [x] ลบไฟล์ตัวอย่าง/boilerplate ที่ Vite สร้างมาให้ที่ไม่ใช้ (logo, ตัวอย่าง counter)
- [x] รัน dev server ตรวจว่าหน้าเปล่าขึ้นได้

## 2. Storage layer (`src/storage.js`)

- [x] ฟังก์ชัน `loadData()` อ่าน key `"borrowBuddy"` จาก localStorage, คืนค่าเริ่มต้น `{ items: [], borrowers: [], loans: [] }` ถ้ายังไม่มี
- [x] ฟังก์ชัน `saveData(data)` เขียนทับ key เดิมเป็น JSON
- [x] ฟังก์ชันคำนวณสถานะ loan: `isActive(loan)`, `isReturned(loan)`, `isOverdue(loan)` ตามกฎใน design.md
- [x] ฟังก์ชันช่วยสร้าง id (เช่น `crypto.randomUUID()`)

## 3. `App.jsx` โครงหลัก

- [x] `useState` เก็บ `{ items, borrowers, loans }` เริ่มต้นจาก `loadData()`
- [x] `useEffect` เรียก `saveData()` ทุกครั้งที่ state เปลี่ยน
- [x] `useState` เก็บแท็บที่เลือกอยู่ (ยืมอยู่ / ประวัติ / จัดการ)
- [x] UI สลับแท็บ (ปุ่ม/nav ง่ายๆ ไม่มี routing library)
- [x] ส่ง state + callback (add/update/delete item, borrower, loan) ลงเป็น props ให้แต่ละแท็บ

## 4. `LoanForm.jsx` (สร้าง/แก้ไขรายการยืม + quick-add)

- [x] ฟอร์ม: เลือกของ (dropdown, filter ของที่ "ยืมอยู่" แล้วออกตามกฎ), เลือกผู้ยืม, วันที่ยืม (default วันนี้), วันที่ต้องคืน (ไม่บังคับ)
- [x] ปุ่ม quick-add ของใหม่ / ผู้ยืมใหม่ในฟอร์มเดียวกัน (เพิ่มเข้า catalog ทันทีที่กด)
- [x] ใช้ฟอร์มเดียวกันได้ทั้งโหมดสร้างใหม่และโหมดแก้ไข loan เดิม

## 5. `ActiveLoansTab.jsx`

- [x] แสดง loan ที่ "ยืมอยู่" เรียงตามวันที่ต้องคืนใกล้สุดก่อน (ไม่มีกำหนดคืนอยู่ล่างสุด)
- [x] ป้าย "เกินกำหนด" ถ้าเข้าเงื่อนไข overdue
- [x] ปุ่มต่อแถว: กดคืน (set `returnedAt` เป็นวันนี้), แก้ไข (เปิด `LoanForm`), ลบ
- [x] ปุ่มเปิด `LoanForm` เพื่อสร้างรายการยืมใหม่

## 6. `HistoryTab.jsx`

- [x] แสดง loan ที่คืนแล้วทั้งหมด
- [x] ปุ่มแก้ไข (เปิด `LoanForm`, แก้ย้อนกลับเป็นยืมอยู่ได้ด้วยถ้าลบ `returnedAt`), ลบ

## 7. `ManageTab.jsx`

- [x] list + เพิ่ม/ลบ Item ตรงๆ
- [x] list + เพิ่ม/ลบ Borrower ตรงๆ
- [x] ปุ่มลบ disable หรือแจ้งเตือนถ้า Item/Borrower นั้นมี loan ที่ "ยืมอยู่" ผูกอยู่

## 8. Styling (`App.css`)

- [x] จัด layout แท็บ, list, ฟอร์ม, ป้ายสถานะ (ยืมอยู่ / คืนแล้ว / เกินกำหนด) ให้อ่านง่าย

## 9. ทดสอบ end-to-end ด้วยมือ

- [x] เพิ่มของ+ผู้ยืมผ่าน quick-add แล้วสร้างรายการยืม ตรวจว่าเลือกของที่ "ยืมอยู่" แล้วไม่ได้
- [x] กดคืนของ ตรวจว่าย้ายไปแท็บประวัติ พร้อมวันที่คืน = วันนี้
- [x] ตั้งวันที่ต้องคืนเป็นอดีต ตรวจว่าป้าย "เกินกำหนด" ขึ้น
- [x] ลองลบ Item/Borrower ที่มี loan ยืมอยู่ผูกอยู่ ตรวจว่าลบไม่ได้
- [x] รีเฟรชหน้าเว็บ ตรวจว่าข้อมูลยังอยู่ (localStorage persist ถูกต้อง)

ทดสอบด้วย headless Chromium (Playwright) ผ่าน dev server จริง ไม่พบ console error, ทุกเงื่อนไขผ่านตามที่คาด

# V2: Supabase + Auth

## 10. Setup Supabase project

- [x] สร้าง/เตรียม Supabase project เก็บ URL + anon key ไว้ใช้ฝั่ง client (เช่น `.env`)
- [x] สร้างตาราง `items`, `borrowers`, `loans` ตาม Data model ใน design.md (ทุกตารางมีคอลัมน์ `owner_id uuid references auth.users`)
- [x] เปิด RLS ทุกตาราง + เขียน policy select/insert/update/delete ด้วยเงื่อนไข `owner_id = auth.uid()`
- [ ] ปิดการสมัครสมาชิกเอง (self sign-up) ใน Supabase Auth settings — **ต้องทำเองในหน้า Dashboard** (ไม่มี MCP tool ให้ตั้งค่านี้)
- [ ] สร้างบัญชีเจ้าของ (email + password) ผ่าน Supabase dashboard — **ต้องทำเองในหน้า Dashboard**

## 11. ย้าย data layer ไปใช้ Supabase (`src/supabaseClient.js`, `src/storage.js`)

- [x] ติดตั้ง `@supabase/supabase-js`
- [x] สร้าง `src/supabaseClient.js` อ่าน URL + anon key จาก env var
- [x] แก้ `storage.js` จาก localStorage เป็นฟังก์ชันเรียก Supabase (โหลด/เพิ่ม/แก้/ลบ item, borrower, loan) ฟังก์ชันคำนวณสถานะ (isActive/isReturned/isOverdue) คงเดิม
- [x] ลบโค้ด localStorage (`loadData`/`saveData`/`useEffect` เขียนทับทั้งก้อน) ที่ไม่ใช้แล้ว

## 12. Auth (`LoginForm.jsx`, `App.jsx`)

- [x] สร้าง `components/LoginForm.jsx` ฟอร์ม email + password เรียก `supabase.auth.signInWithPassword`
- [x] `App.jsx` เช็ค session ตอน mount + subscribe `onAuthStateChange`
- [x] ไม่มี session → แสดงแค่ `LoginForm`, มี session → โหลดข้อมูลแล้วแสดง 3 แท็บตามปกติ
- [x] ปุ่ม logout เรียก `supabase.auth.signOut()`

## 13. ทดสอบ end-to-end ด้วยมือ (V2)

- [ ] ล็อกอินด้วยบัญชีเจ้าของที่สร้างไว้ ตรวจว่าเข้าแท็บต่างๆได้
- [ ] ลองล็อกอินด้วย email/password ผิด ตรวจว่า error แสดงถูกต้อง
- [ ] ตรวจว่าไม่มีหน้า/ปุ่มสมัครสมาชิกเองในระบบ
- [ ] สร้าง Item/Borrower/Loan แล้วตรวจใน Supabase ว่า `owner_id` ตรงกับเจ้าของที่ล็อกอิน
- [ ] (ถ้ามี 2 บัญชี) ตรวจว่าเจ้าของ A มองไม่เห็น Loan ของเจ้าของ B (RLS ทำงานถูก)
- [ ] รีเฟรช/เปิดเบราว์เซอร์ใหม่ ตรวจพฤติกรรม session ตามที่ตั้งใจ
- [ ] logout แล้วตรวจว่ากลับไปหน้า login และเข้าถึงข้อมูลไม่ได้ก่อนล็อกอิน
