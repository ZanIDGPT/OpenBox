# OpenBox 🤖

Aplikasi Web Chat AI futuristik dengan desain minimalis, animasi dinamis, dan integrasi OpenRouter.ai.

![OpenBox](https://img.shields.io/badge/OpenBox-AI%20Chat-black?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

## ✨ Fitur

- **⚡ Mode Instan** — Respons AI super cepat dengan streaming kata demi kata
- **🧠 Mode Thinking** — Lihat proses berpikir AI secara transparan
- **🔍 Mode Search** — Pencarian web real-time via Perplexity
- **🖼️ Vision** — Unggah gambar dan analisis visual
- **💾 Manajemen Konteks** — Otomatis mengelola memori percakapan
- **🎨 Desain Futuristik** — Efek cahaya, animasi halus, dark/light mode
- **📱 Responsif** — Optimal di HP dan laptop

## 🚀 Deploy ke Vercel

### 1. Fork / Clone Repository

```bash
git clone https://github.com/username/openbox.git
cd openbox
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit `.env` dan tambahkan API key OpenRouter:
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Dapatkan API key di: [https://openrouter.ai/keys](https://openrouter.ai/keys)

### 3. Deploy

```bash
npm i -g vercel
vercel --prod
```

Atau hubungkan repository GitHub ke Vercel dashboard.

### 4. Tambahkan Environment Variable di Vercel

Buka **Project Settings > Environment Variables** dan tambahkan:
- `OPENROUTER_API_KEY` = your-key-here

## 📁 Struktur File

```
openbox/
├── api/
│   └── chat.js          # Vercel Serverless Function (OpenRouter API)
├── index.html           # Landing page
├── login.html           # Halaman login
├── chat.html            # Aplikasi chat utama
├── package.json
├── vercel.json
└── .env.example
```

## 🛠️ Teknologi

- **Frontend:** Vanilla HTML/CSS/JS (no framework)
- **Backend:** Vercel Serverless Functions (Node.js)
- **AI API:** OpenRouter.ai (GPT-4o, DeepSeek R1, Perplexity)
- **Markdown:** Marked.js
- **Syntax Highlight:** Highlight.js
- **Styling:** Custom CSS dengan variabel theming

## 📝 Catatan

- API Key disimpan di **server** (aman), tidak di client
- Riwayat chat tersimpan di **localStorage** browser
- Gambar diencode ke **Base64** untuk dikirim ke API
- Context window otomatis di-manage untuk performa optimal

## 🖼️ Screenshot

_Landing Page, Login, dan Chat Interface dengan desain futuristik hitam-putih._

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.

---

**Dibuat dengan ❤️ untuk masa depan AI.**
