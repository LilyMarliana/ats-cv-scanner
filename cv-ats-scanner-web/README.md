# ATS CV Scanner: Frontend

Frontend aplikasi **ATS CV Scanner** yang dibangun menggunakan React, TypeScript, Vite, dan Tailwind CSS.

## Teknologi

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- Lucide React

## Menjalankan Project

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Frontend akan tersedia pada:

```text
http://localhost:5173/
```

## Build

Build aplikasi untuk production:

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

## Lint

Menjalankan ESLint:

```bash
npm run lint
```

## Struktur Frontend

```text
src/
├── components/
│   ├── AtsScoreCard.tsx
│   ├── Badge.tsx
│   ├── ConfirmDialog.tsx
│   ├── CvResultCard.tsx
│   ├── PositionFormModal.tsx
│   ├── StatCard.tsx
│   └── layout/
│       ├── AppLayout.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── lib/
│   └── api.ts
├── pages/
│   ├── BulkUpload.tsx
│   ├── CompareCv.tsx
│   ├── CvDetail.tsx
│   ├── CvHistory.tsx
│   ├── Dashboard.tsx
│   └── Positions.tsx
├── types/
│   ├── compare.ts
│   ├── cv.ts
│   ├── history.ts
│   ├── position.ts
│   └── quality.ts
├── App.tsx
├── index.css
└── main.tsx
```

## Halaman

Frontend saat ini memiliki halaman:

- Dashboard
- Bulk Upload
- Compare CV
- CV Detail
- CV History
- Positions

## Backend

Backend ATS CV Scanner berada pada:

```text
../cv-ats-scanner
```

Konfigurasi komunikasi API berada di:

```text
src/lib/api.ts
```

Pastikan backend tersedia ketika menjalankan fitur yang membutuhkan API.

## Public Assets

Asset publik yang digunakan:

```text
public/
└── favicon.svg
```

File template bawaan Vite yang tidak digunakan telah dibersihkan.
