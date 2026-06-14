# 💌 Yıldönümü Sürpriz Sitesi

Sevgilinize özel, interaktif bir romantik sürpriz sitesi. "Sweet (Tatlı)" teması: pastel renkler, yuvarlak köşeler, kalpler ve yıldızlar.

---

## 🚀 Hızlı Başlangıç

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` adresine gidin.

---

## 📁 İçerik Özelleştirme (Config Dosyaları)

Tüm kişisel içerik `/config` klasöründe ayrı dosyalarda bulunur. **Kod mantığına dokunmadan** sadece bu dosyaları düzenleyerek siteyi kişiselleştirebilirsiniz.

### `/config/site.ts`
- Partner adı, kendi adınız, yıldönümü tarihi, ana sayfa başlığı

### `/config/counters.ts`
- İlişki başlangıç tarihi (ana büyük sayaç için)
- Kilometre taşları (ilk buluşma, ilk "seni seviyorum", vb.)
- Eğlenceli istatistikler (kaç film izlendi, kaç kahve içildi, vb.)

### `/config/starmap.ts`
- Buluşma tarihi, saati ve yeri
- Burç mesajı (romantik, kişisel)
- Yıldız notları (belirli yıldızlara tıklandığında gösterilir)

### `/config/music.ts`
- Şarkı listesi (Cloudflare R2 URL'leriyle)
- Her şarkı için anı notu

### `/config/love-reasons.ts`
- "Seni sevmemin sebepleri" listesi (istediğiniz kadar ekleyebilirsiniz)

### `/config/quiz.ts`
- Quiz soruları, seçenekler, doğru cevaplar
- Ödül mesajları ve GIF URL'leri (R2'den)
- Sonuç ekranı mesajları

### `/config/bucket-list.ts`
- Birlikte yapmak istediklerinizin listesi
- Her öğe için ikon ve başlık

---

## ☁️ Cloudflare R2 Kurulumu (Müzik ve Medya İçin)

### 1. R2 Bucket Oluşturma

1. Cloudflare Dashboard → R2 → "Create bucket" → `anniversary-site-media`
2. Bucket'ı genel erişime açın: Settings → Public Access → "Allow Access"

### 2. API Token Oluşturma

1. Dashboard → R2 → "Manage R2 API Tokens" → "Create API Token"
2. Permissions: **Object Read & Write**
3. Oluşturulan değerleri kopyalayın

### 3. `.env.local` Oluşturma

Proje klasöründe `.env.local` dosyası oluşturun (`.env.local.example` şablon olarak verilmiştir):

```bash
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=anniversary-site-media
R2_PUBLIC_URL=https://pub-XXXXX.r2.dev
ADMIN_PASSWORD=super-secret-password
```

### 4. Admin Paneli ile Yükleme

`http://localhost:3000/admin` adresine gidin:
- Şifrenizi girin (`.env.local`'daki `ADMIN_PASSWORD`)
- Hedef klasörü seçin (müzik, fotoğraf, video vb.)
- Dosyaları sürükle-bırak ile yükleyin
- URL'yi kopyalayıp config dosyalarına yapıştırın

### 5. Config Dosyalarını Güncelleme

Yüklenen dosyaların URL'lerini kopyalayıp ilgili config dosyasına yapıştırın.

---

## 🛡️ Admin Paneli Güvenliği

- Admin paneli sadece sunucu tarafındaki `ADMIN_PASSWORD` ile korumalıdır
- **`/admin` URL'sini sevgilinizle paylaşmayın!**
- Vercel'de şifreyi Environment Variables olarak ayarlayın
- Production'da daha güçlü bir şifre kullanın

---

## 🗃️ Kova Listesi Durumu

**Varsayılan**: `localStorage` — site kapatıldığında bile kayıtlı kalır, ama sadece o cihazda.

**İsteğe Bağlı Yükseltme — Supabase ile Çapraz Cihaz Senkronizasyonu**:

1. Supabase projesi oluşturun
2. Şu tabloyu oluşturun:
   ```sql
   create table bucket_list_items (
     id text primary key,
     completed boolean default false,
     completed_at timestamptz
   );
   ```
3. `.env.local` dosyasına ekleyin:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_USE_SUPABASE_BUCKET_LIST=true
   ```
4. `@supabase/supabase-js` kütüphanesini yükleyin ve `BucketListSection.tsx`'i Supabase client'ı kullanacak şekilde güncelleyin.

---

## 🌐 Vercel'e Deploy

```bash
npm run build  # önce build'i test edin
```

1. [vercel.com](https://vercel.com)'da yeni proje oluşturun
2. GitHub repo'nuzu bağlayın
3. Ortam değişkenlerini ayarlayın (R2, Supabase)
4. Deploy edin!

---

## 🗺️ Yıldız Haritası — Teknik Notlar

Yıldız haritası, gerçek astronomik hesaplamalar kullanır:
- **Veri**: Proje içine gömülü parlak yıldız kataloğu
- **Hesaplama**: Greenwich Mean Sidereal Time → Local Sidereal Time → Hour Angle → Altitude/Azimuth dönüşümü
- **Projeksiyon**: Stereografik (planisfer görünümü)
- Eğer eksiksiz hesaplamalı harita yerine basit dekoratif bir görünüm tercih edilirse, `StarMap.tsx` bileşenini özelleştirebilirsiniz.

---

## 📋 İçerik Kontrol Listesi (Deploy Öncesi)

- [ ] `config/site.ts` — partner adı, tarihler
- [ ] `config/counters.ts` — gerçek tarihler ve istatistikler
- [ ] `config/starmap.ts` — buluşma tarihi/yeri, burç mesajı
- [ ] `config/music.ts` — gerçek R2 URL'leri ve anı notları
- [ ] `config/love-reasons.ts` — kişisel sebepler
- [ ] `config/quiz.ts` — gerçek sorular ve cevaplar
- [ ] `config/bucket-list.ts` — hayaller listesi
- [ ] R2 bucket kurulumu ve medya yükleme
- [ ] Mobil görünüm testi (375px)
- [ ] Vercel deploy
