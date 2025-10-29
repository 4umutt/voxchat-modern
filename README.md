# Discord Sesli Sohbet Uygulaması

Bu proje, Discord benzeri bir sesli sohbet uygulamasıdır. WebRTC teknolojisi kullanarak gerçek zamanlı ses iletişimi sağlar.

## Özellikler

- 🎤 Gerçek zamanlı sesli sohbet
- 🔇 Mikrofon susturma/açma
- 👥 Çevrimiçi kullanıcı listesi
- 🔊 Ses seviyesi kontrolü
- 📱 Responsive tasarım
- 🌐 Tarayıcı tabanlı (kurulum gerektirmez)

## Teknolojiler

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express, Socket.IO
- **WebRTC**: Peer-to-peer ses iletişimi
- **STUN Sunucuları**: Google STUN sunucuları

## Kurulum

### 1. Gereksinimler
- Node.js (v14 veya üzeri)
- Modern web tarayıcısı (Chrome, Firefox, Safari, Edge)
- Mikrofon erişimi

### 2. Projeyi Çalıştırma

```bash
# Proje klasörüne gidin
cd discord-voice-chat

# Bağımlılıkları yükleyin
npm install

# Sunucuyu başlatın
npm start
```

### 3. Uygulamayı Kullanma

1. Tarayıcıda `http://localhost:3000` adresine gidin
2. "Sesli Kanala Katıl" butonuna tıklayın
3. Mikrofon izni verin
4. Başka bir tarayıcı penceresinde aynı adresi açın ve o pencerede de kanala katılın
5. Artık iki pencere arasında sesli iletişim kurabilirsiniz!

## Kullanım Kılavuzu

### Sesli Kanala Katılma
1. **"Sesli Kanala Katıl"** butonuna tıklayın
2. Tarayıcı mikrofon izni isteyecek - **"İzin Ver"** seçeneğini seçin
3. Başarıyla katıldığınızda durum **"Sesli kanala katıldınız"** olarak görünecek

### Kontroller
- **Sustur/Susturmayı Kaldır**: Mikrofonunuzu açıp kapatır
- **Kanaldan Ayrıl**: Sesli kanaldan çıkar ve mikrofonunuzu kapatır
- **Ses Seviyesi**: Diğer kullanıcıların sesini ayarlar

### Çoklu Kullanıcı Testi
1. Aynı bilgisayarda birden fazla tarayıcı penceresi açın
2. Her pencerede `http://localhost:3000` adresine gidin
3. Her pencerede "Sesli Kanala Katıl" butonuna tıklayın
4. Farklı pencerelerde konuşarak ses iletişimini test edin

## Sorun Giderme

### Mikrofon İzni Sorunu
- Tarayıcının adres çubuğundaki mikrofon simgesine tıklayın
- "Her zaman izin ver" seçeneğini seçin
- Sayfayı yenileyin

### Ses Gelmiyorsa
- Ses seviyesi ayarlarını kontrol edin
- Diğer uygulamaların mikrofonunuzu kullanıp kullanmadığını kontrol edin
- Tarayıcı konsolunu açın (F12) ve hata mesajlarını kontrol edin

### Bağlantı Sorunları
- İnternet bağlantınızı kontrol edin
- Firewall veya antivirus yazılımının bağlantıyı engellememesini sağlayın
- Başka bir tarayıcı deneyin

## Geliştirme

### Geliştirme Modu
```bash
# Nodemon ile otomatik yeniden başlatma
npm run dev
```

### Proje Yapısı
```
discord-voice-chat/
├── index.html          # Ana HTML dosyası
├── style.css           # CSS stilleri
├── script.js           # Frontend JavaScript (WebRTC logic)
├── server.js           # Node.js sunucu (Socket.IO signaling)
├── package.json        # Proje bağımlılıkları
└── README.md          # Bu dosya
```

### WebRTC Akışı
1. Kullanıcı "Katıl" butonuna tıklar
2. Mikrofon erişimi alınır
3. Socket.IO ile sunucuya bağlanılır
4. Diğer kullanıcılarla WebRTC peer bağlantıları kurulur
5. ICE candidate'lar ve SDP offer/answer'lar değişilir
6. P2P ses akışı başlar

## Kısıtlamalar

- HTTPS gereksinimi: Gerçek dağıtım için HTTPS gereklidir
- Firewall/NAT: Bazı ağ yapılandırmalarında ek TURN sunucuları gerekebilir
- Tarayıcı desteği: Modern tarayıcılar gereklidir

## Lisans

MIT License

## Destek

Herhangi bir sorun yaşarsanız:
1. Tarayıcı konsolunu kontrol edin
2. Mikrofon izinlerini kontrol edin  
3. Sunucu loglarını inceleyin

---

**Not**: Bu uygulama eğitim amaçlı geliştirilmiştir. Prodüksiyon kullanımı için ek güvenlik önlemleri alınmalıdır.