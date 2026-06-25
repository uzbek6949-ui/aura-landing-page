# Aura — landing sahifa

AI yordamida xarajatlarni kuzatib, avtomatik byudjet tuzadigan shaxsiy moliya
ilovasi **Aura** uchun waitlist (erta kirish ro'yxati) landing sahifasi.

Next.js (App Router) + TypeScript + Tailwind CSS asosida qurilgan. Light/dark
rejim, 3 ta til (EN / UZ / RU), ishlaydigan waitlist forma, SEO/Open Graph va
yumshoq scroll animatsiyalari bilan.

## Ishga tushirish

```bash
npm install      # paketlarni o'rnatish (bir marta)
npm run dev      # http://localhost:3000 ochiladi
```

Production uchun: `npm run build` keyin `npm start`.

## Nimani qayerdan o'zgartirish kerak

| Nima | Qayerda |
| --- | --- |
| **Barcha matnlar / tarjimalar** | `messages/en.json`, `messages/uz.json`, `messages/ru.json` |
| **Ranglar, gradient, light/dark tokenlar** | `src/app/globals.css` (yuqoridagi `:root` va `.dark` bloklari) |
| **Brend nomi, navigatsiya, ijtimoiy tarmoqlar** | `src/lib/site.ts` |
| **Logo** | `src/components/ui/Logo.tsx` |
| **Bo'limlar (Hero, Narxlar, FAQ ...)** | `src/components/sections/` |
| **Navbar / Footer** | `src/components/layout/` |
| **Waitlist forma mantiqi** | `src/components/ui/WaitlistForm.tsx` va `src/app/api/waitlist/route.ts` |

### Til qo'shish

1. `messages/<til>.json` faylini yarating (mavjudini nusxalab, tarjima qiling — kalitlar bir xil bo'lsin).
2. `src/i18n/routing.ts` dagi `locales` ro'yxatiga qo'shing.
3. `src/components/ui/LanguageSwitcher.tsx` dagi `LABELS`/`SHORT` ga nom qo'shing.

### Temani o'zgartirish

Standart tema **tizimga qarab** (`system`) tanlanadi. O'zgartirish uchun
`src/app/[locale]/layout.tsx` dagi `defaultTheme="system"` ni `"light"` yoki
`"dark"` ga almashtiring.

## Hali kerak bo'ladigan narsalar

- **Haqiqiy logo** — hozir `Logo.tsx` da oddiy SVG belgi.
- **Haqiqiy sharhlar va rasmlar** — sharhlar (`messages/*.json` → `testimonials`)
  va statistika raqamlari (`stats`) hozircha namuna.
- **Forma backendi** — `src/app/api/waitlist/route.ts` hozir emailni tekshirib,
  faqat konsolga yozadi. Haqiqiy saqlash uchun bu yerga baza yoki email xizmatini
  (Resend, Mailchimp, ConvertKit) ulang.

## Texnologiyalar

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · next-intl · next-themes ·
lucide-react
