# iOS TestFlight dağıtımı

Oyun: **arrow.** · App Store Connect kaydı: **BilgiEdu** · Apple ID: **6826133987** · Bundle ID: **com.sourspark.bilgiedu** · Sürüm: **1.0.0 (3)** · Minimum iOS: **15.1**.

- [Herkese açık TestFlight bağlantısı](https://testflight.apple.com/join/7x6bR88c)
- [GitHub kaynak kodu](https://github.com/cagdaseksi/BilgiEdu2)
- [App Store Connect](https://appstoreconnect.apple.com/apps/6826133987/distribution)

Dış test grubu **BilgiEdu Testers** olarak adlandırılır. Bağlantının mevcut olması, grupta onaylanmış oynanabilir build bulunduğu anlamına gelmez. İlk dış test build'i Apple beta incelemesine tabidir. Kullanıcıların TestFlight uygulamasını kurması gerekir; UDID toplamak gerekmez.

26 Ekim 2026: **1.0.0 (2)** yüklemesi tamamlandı ve dış test grubuna eklendi. Apple durumu **Waiting for Review**; onay sonrası testçilere otomatik bildirim açık. Public bağlantı herkesin katılımına açık olarak yapılandırıldı; katılım Apple onayından sonra kullanılabilir.

**1.0.0 (3)** okların gövde ve kuyruğunun başı aynı yol boyunca takip ettiği yeni çıkış animasyonunu içerir. Apple'a yükleme ve paket işlemesi tamamlandı; **BilgiEdu Internal** grubunda **Testing** durumunda. Build 2 incelemede olduğu için Apple build 3'ün dış test başvurusunu kabul etmedi; mevcut inceleme tamamlandıktan sonra build 3 yeniden gönderilmelidir.

## Çalıştırma ve yerel kontroller

```sh
npm run lint
npx tsc --noEmit
npm test -- --runInBand
npm run ios:release
bash scripts/ios-testflight.sh verify
```

Release, `main.jsbundle` dosyasını uygulamanın içinde taşır; Metro veya geliştirici bilgisayarına bağlantı gerekmez.

## Arşiv ve IPA

```sh
IOS_TEAM_ID=YBV5NARZ4A npm run ios:archive
IOS_TEAM_ID=YBV5NARZ4A npm run ios:export
```

Sonraki yüklemelerde yeni bir build numarası seçin:

```sh
IOS_TEAM_ID=YBV5NARZ4A IOS_BUILD_NUMBER=4 npm run ios:archive
IOS_TEAM_ID=YBV5NARZ4A IOS_BUILD_NUMBER=4 npm run ios:export
```

Arşiv komutu Xcode otomatik imzalamayı kullanır. Export komutu IPA'yı yerel olarak hazırlar; yükleme veya davet göndermez. Arşiv ve IPA `build/` altında tutulur, Git'e eklenmez. Apple anahtarları, parolalar, inceleme iletişim bilgileri ve tester adresleri depoya yazılmaz.

## TestFlight akışı

1. Release arşivini Xcode Organizer → Distribute App → App Store Connect üzerinden yükleyin. Dış test için TestFlight Internal Only seçmeyin.
2. Build işlemesinin bitmesini bekleyin.
3. `beta-info.json` dosyasındaki açıklama, test ve inceleme notlarını kullanın; gerçek geri bildirim/inceleme iletişim bilgilerini doğrudan App Store Connect'e girin.
4. Yeni build'i mevcut **BilgiEdu Testers** dış test grubuna ekleyin ve beta incelemesine gönderin.
5. Onaydan sonra otomatik bildirimlerle davetleri etkinleştirin.

Tamamlanan seviyeler cihazda kaydedilir. Yarım kalan bir tahta oyundan çıkınca yeniden başlar. Uygulamada reklam veya üçüncü taraf analiz SDK'sı yoktur; TestFlight'ın geri bildirim ve çökme raporları Apple tarafından yönetilir.

Apple kaynakları: [dış test davetleri](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers), [build yükleme](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/).
