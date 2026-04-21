# Backend Tasarım Kararları

## Modül Yapısı

Klasik NestJS modül yapısı: `auth`, `agents`, `transactions`, `dashboard`. İş mantığını controller'lardan ayırmak için `domain/` klasöründe iki ayrı servis var — `CommissionService` ve `StageTransitionService`. Mongoose ve NestJS bağımlılıklarından bağımsız oldukları için test yazmak da kolay oluyor.

## Aşama Geçişleri

`StageTransitionService` geçerli geçişleri bir map olarak tutuyor:

```
agreement → earnest_money → title_deed → completed
```

Geriye dönüş ve aşama atlama yasak. Completed'a geçince finansal döküm otomatik hesaplanıp transaction'a yazılıyor.

## Komisyon Hesabı

- Ajans her zaman **%50** alıyor
- Kalan **%50** danışman havuzuna gidiyor
- Listeleyen ve satan danışman aynıysa havuzun tamamını o alıyor
- Farklılarsa ikiye eşit bölünüyor (%25 + %25)

## Finansal Döküm Nerede Tutuluyor?

Transaction dökümanının içine gömdüm. Ayrı collection gereksiz karmaşıklık, dinamik hesaplama ise servis bedeli sonradan değişirse geçmiş veriyi bozar. Gömülü tutmak bu problemlerin ikisini de çözüyor — completed'a geçince hesaplanıp kaydediliyor, sonra değişmiyor.

## Veri Modelleri

### Transaction
```
propertyTitle, propertyAddress, clientName
totalServiceFee, currency
listingAgentId → Agent (ref)
sellingAgentId → Agent (ref)
stage: agreement | earnest_money | title_deed | completed
payments: PaymentRecord[]
financialBreakdown: FinancialBreakdown (sadece completed'da dolu)
```

### PaymentRecord (subdocument)
```
type: earnest_money | service_fee | other
amount, status: pending | received
date, note
```

Ödemeler subdocument olarak gömülü çünkü bağımsız sorgulanma ihtiyaçları yok.

### Agent
```
fullName, email, phone
```

## Testler

`CommissionService` ve `StageTransitionService` için unit testler yazıldı. Bu iki servis tüm finansal ve iş kuralı mantığını içerdiğinden test kapsamı açısından en kritik yerler bunlar.

```bash
bun test
```
