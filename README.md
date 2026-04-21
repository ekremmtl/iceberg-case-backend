# Iceberg Case Backend

NestJS + MongoDB Atlas ile yazılmış emlak işlem ve komisyon yönetim API'si.

## Kurulum

```bash
npm install
```

## Çalıştırma

```bash
npm run start:dev
```

## Testler

```bash
npm test
```

## Kullanılmayan Kod Analizi

```bash
npx knip
```

## API Endpoint'leri

| Method | Path                                  | Açıklama          |
| ------ | ------------------------------------- | ----------------- |
| POST   | /auth/login                           | Giriş             |
| GET    | /auth/me                              | Mevcut kullanıcı  |
| GET    | /agents                               | Tüm danışmanlar   |
| POST   | /agents                               | Danışman oluştur  |
| PATCH  | /agents/:id                           | Danışman güncelle |
| DELETE | /agents/:id                           | Danışman sil      |
| GET    | /transactions                         | Tüm işlemler      |
| POST   | /transactions                         | İşlem oluştur     |
| GET    | /transactions/:id                     | İşlem detayı      |
| PATCH  | /transactions/:id                     | İşlem güncelle    |
| DELETE | /transactions/:id                     | İşlem sil         |
| PATCH  | /transactions/:id/stage               | Aşama ilerlet     |
| POST   | /transactions/:id/payments            | Ödeme ekle        |
| PATCH  | /transactions/:id/payments/:paymentId | Ödeme güncelle    |
| DELETE | /transactions/:id/payments/:paymentId | Ödeme sil         |
| GET    | /transactions/:id/financial-breakdown | Finansal döküm    |
| GET    | /dashboard/summary                    | Dashboard özeti   |
