# Gather.in - BNCC EEO Sponsorship & Partner CRM

Prototype sistem manajemen partner, tracking proposal sponsorship, pengingat follow-up otomatis **D+3 / D+7**, persetujuan pembaruan Contact Person (CP), dan generator dokumen **MoU** per event untuk **External Event Organizer (EEO) BNCC**.

Website ini dirancang sebagai aplikasi statis (React + Vite + Tailwind CSS) agar dapat dideploy langsung menggunakan **GitHub Pages** dengan database prototype berbasis file **JSON statis** di dalam repositori.

---

## 1. Struktur & Lokasi Database Prototype (GitHub Static JSON)

Seluruh data awal (*seed data*) disimpan di folder `public/data/`:

| File JSON | Isi & Fungsi |
| :--- | :--- |
| `public/data/users.json` | Daftar akun pengurus (`Manager EEO`, `Bendahara`, dan `Staff EEO`), role (`admin` / `member`), serta flag hak akses `canViewSponsorshipValue`. |
| `public/data/events.json` | Daftar event BNCC (`BNCC TechSpire 2026`, `TechnoScape 2026`, `BNCC Hackathon`, `Tech Talk Series`, `BNCC CSR`). |
| `public/data/partners.json` | Data partner per event, CP & status ketersediaan, tahapan 9 langkah pipeline, tanggal kirim proposal, deadline `D+3` & `D+7`, jadwal meeting, checklist benefit, grade, nominal sponsorship, status MoU, dan riwayat aktivitas partner. |
| `public/data/mouTemplates.json` | Template naskah MoU per event (Sponsorship dan Media Partner / Komunitas) dengan placeholder dinamis (`{{event}}`, `{{tanggal}}`, `{{nama_company}}`, `{{cp}}`, `{{jabatan_cp}}`, `{{nilai}}`, `{{benefit}}`). |
| `public/data/editRequests.json` | Antrean permintaan pembaruan data Contact Person (CP) yang diajukan oleh Staff EEO untuk ditinjau (`Setujui & Terapkan` / `Tolak`) oleh Manager EEO. |
| `public/data/activityLogs.json` | Audit trail seluruh perubahan status proposal, update CP, keputusan pitching/grading, finalisasi MoU, impor spreadsheet, dan handover pengurus. |

---

## 2. Alur Data (Data Flow) Aplikasi

1. **Inisialisasi Data Awal (`GET ./data/*.json`)**
   - Saat aplikasi dibuka (`src/services/jsonDb.ts`), frontend memuat ke-6 file JSON statis secara paralel menggunakan path relatif `./data/...` agar kompatibel dengan subpath **GitHub Pages**.
   - Jika pengguna sebelumnya sudah melakukan perubahan di browser, aplikasi membaca state terbaru dari `localStorage` (`gatherin_eeo_workspace_v2`), sehingga perubahan tetap tersimpan saat halaman dimuat ulang (*reload*).
   - Tombol **Reset** di sidebar menghapus cache `localStorage` dan memuat ulang data awal dari file JSON di `public/data/`.

2. **Autentikasi & Sesi (`sessionStorage`)**
   - Pada halaman awal (`HomePage`), pengguna memilih role (**ADMIN · Manager** atau **MEMBER · Staff EEO**) dan login menggunakan akun pengurus `@bncc.net`.
   - Validasi kredensial dan kesesuaian role dijalankan di `src/utils/auth.ts`. Data sesi pengguna aktif disimpan di `sessionStorage` (`gatherin_eeo_session_v1`).

3. **Alur Pipeline Proposal & Pengingat Otomatis D+3 / D+7**
   - Saat **Proposal Baru** disimpan (atau saat **Impor Spreadsheet** dari Google Sheets / CSV dijalankan), sistem (`src/utils/pipeline.ts`) menghitung otomatis:
     - `deadlineD3 = proposalSentAt + 3 hari`
     - `deadlineD7 = proposalSentAt + 7 hari`
   - Proposal berstatus `Pending` yang telah melewati jadwal D+3 / D+7 otomatis muncul di panel merah **Perlu Follow Up Segera** pada Dashboard dan ditandai **Overdue** di Daftar Sponsorship.
   - Menekan **Selesai Follow Up** menandai tahapan selesai, memajukan pipeline ke tahap berikutnya, dan mencatatnya ke `history` partner serta **Log Aktivitas**.

4. **Alur Pembaruan Contact Person (CP) & Persetujuan Edit**
   - **Staff EEO (`member`)** yang mengajukan perubahan CP melalui tombol **Tambah / Edit CP** akan membuat entri baru di `editRequests` berstatus `Pending` (data partner utama tidak langsung berubah).
   - **Manager EEO (`admin`)** meninjau perbandingan **Nilai Lama vs Nilai Baru** pada menu **Persetujuan Edit**:
     - Jika **Setujui & Terapkan**, data CP pada `partners` langsung diperbarui dan status request berubah menjadi `Approved`.
     - Jika **Tolak**, Manager wajib mengisi alasan penolakan yang tercatat pada riwayat keputusan dan Audit Trail.
   - Perubahan CP yang dilakukan langsung oleh Manager langsung diterapkan ke data partner.

5. **Alur Pitching, Grading, Benefit & Generator MoU Otomatis**
   - Setelah sesi meeting/pitching, **Manager EEO** membuka tab **3. Pitching & Grading** pada Detail Partner untuk menentukan `Grade`, `Nominal Sponsorship (Rp)`, dan `Result` (`Pending` / `Accept` / `Decline`). Jika `Decline`, alasan penolakan wajib diisi agar terdokumentasi untuk kepengurusan berikutnya.
   - Partner berstatus `Accept` otomatis muncul di panel **Generate MoU Otomatis (Partner Accepted)** pada menu **Template MoU Event**. Sistem menarik data perusahaan, CP, grade, nominal (khusus Manager), dan daftar benefit ke placeholder template untuk menghasilkan naskah MoU siap pakai.

---

## 3. Matriks Hak Akses (2 Role Berbeda)

Sesuai dokumen Study Case EEO dan PRD Cluster 5:

| Fitur / Data | ADMIN (`Manager EEO` / `Bendahara`) | MEMBER (`Staff EEO`) |
| :--- | :--- | :--- |
| **Visibilitas Nominal Sponsorship (`Rp`) & Total Deal** | **Diizinkan** (Dashboard, Detail Partner, Naskah MoU, Log) | **Disembunyikan / Diredaksi** (diganti *"Deal yang berhasil"* / teks rahasia) |
| **Kolom Grade (`Platinum`, `Gold`, `Silver`) di Daftar Sponsorship** | **Tampil** | **Disembunyikan** |
| **Tab `3. Pitching & Grading`** | **Akses Penuh** (atur Grade, Nominal, Accept/Decline, tambah Benefit) | **Tidak Dapat Diakses** (tab disembunyikan) |
| **Menu `Persetujuan Edit` (Approval Staff)** | **Akses Penuh** (`Setujui & Terapkan` / `Tolak` dengan alasan) | **Tidak Tampil di Sidebar** |
| **Pembaruan Contact Person (CP)** | Diterapkan langsung ke database | Mengajukan *Edit Request* ke Manager |
| **Buat Event Baru (`+ Event Baru`)** | **Diizinkan** | **Tidak Diizinkan** |
| **Kelola & Finalisasi Template MoU** | **Buat, Edit Template, & Tandai MoU Selesai** | Hanya melihat template & pratinjau naskah tanpa nominal `Rp` |
| **Input Proposal Baru, Follow Up D+3/D+7, Meeting, Checklist Benefit, Impor Spreadsheet, Log Aktivitas** | **Diizinkan** | **Diizinkan** (nominal `Rp` pada Log diredaksi otomatis) |

---

## 4. Akun Uji Prototype (`public/data/users.json`)

- **Manager EEO (`admin`)**: `abcd.manager@bncc.net` / password: `eeo2026` (atau `nathan.manager@bncc.net` / `eeo2026`)
- **Bendahara (`admin`)**: `bendahara@bncc.net` / password: `eeo2026`
- **Staff EEO (`member`)**: `dhina.staff@bncc.net` / password: `eeo2026` (atau `staff.eeo@bncc.net` / `eeo2026`)

---

## 5. Menjalankan Secara Lokal & Deploy GitHub Pages

```bash
npm install
npm run dev        # Menjalankan dev server di port 3000
npm run lint       # Cek TypeScript (tsc --noEmit)
npm run build      # Build produksi ke folder dist/ untuk GitHub Pages
```
