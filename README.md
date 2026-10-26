# arrow. — React Native ok bulmacası

[GitHub kaynak kodu](https://github.com/cagdaseksi/BilgiEdu2) · [TestFlight beta](https://testflight.apple.com/join/7x6bR88c)

TestFlight dağıtımı App Store Connect’teki **BilgiEdu** kaydını (`com.sourspark.bilgiedu`) kullanır. Dış testte oynanabilir build’in Apple tarafından beta için onaylanmış olması gerekir.

React Native Community CLI ile oluşturulmuş TypeScript mobil uygulaması. Native Android ve iOS projeleri içerir.

## Ekranlar

- **Ana sayfa:** oyun başlangıcı, son açılan seviye, tamamlanan seviye sayısı ve kurallar.
- **Seviyeler:** 30'arlı sayfalama, sıralı kilit açma, en iyi yıldızlar ve ilerleme.
- **Oyun:** dokunulabilir oklar, çıkış animasyonu, çarpışma kontrolü, üç can, üç ipucu, duraklatma, yeniden deneme ve seviye sonu.

Tamamlanan seviyeler ve en iyi sonuçlar AsyncStorage ile cihazda saklanır. Süre sınırı veya sunucu bağlantısı yoktur. Tamamlanmamış bir tahtadan çıkıldığında o tahta yeniden başlar.

## Arşiv verisinin kullanımı

`ArrowPuzzle_1.11.0_Analysis.zip` arşivindeki `arrowsequence.dat` dosyasından, ilk 4 baytlık sürüm başlığı atlanarak 1.055 adet little-endian uint32 seviye kimliği içe aktarılmıştır. Sıra `src/data/levelCatalog.json` içinde korunur.

**Arşiv ekran görüntüsü veya dışa aktarılmış oyun grafiği içermiyor.** `arrowsdata.dat` ve diğer ikili dosyalardaki ok koordinatları çözülmüş değildir. Ekranlar ve vektör çizimleri bu uygulama için hazırlanmıştır. Tahtalar, içe aktarılan kimlikleri kullanan deterministik bir üreticiyle oluşturulur; orijinal APK'nın birebir tahtaları değildir.

Üretici her oku, kendisinden önce oluşturulan oklara göre çıkışı açık olacak şekilde yerleştirir. Bu nedenle ters üretim sırası her zaman bir çözümdür. Testler katalogdaki tüm tahtalarda koordinat sınırlarını, çakışmasız yerleşimi, ok yönünü ve tam çözümü doğrular.

## Çalıştırma

```sh
npm ci
npm start
```

Başka bir terminalde:

```sh
npm run ios
# veya Android emülatörü / bağlı cihazla:
npm run android
```

Metro **8082** portunu kullanır. iOS debug bundle adresi de bu porta ayarlanmıştır.

Yeni native bağımlılıklar veya temiz kurulum sonrasında:

```sh
cd ios
bundle install
bundle exec pod install
cd ..
```

## Kontroller

```sh
npm run lint
npx tsc --noEmit
npm test -- --runInBand
```

Temel dosyalar: `App.tsx`, `src/screens/`, `src/game/engine.ts`, `src/state/progress.ts`.

## iOS beta dağıtımı

TestFlight hazırlığı, yerel arşiv kontrolleri ve dağıtım adımları `distribution/testflight/README.md` dosyasında. Release sürümünü Metro olmadan denemek için `npm run ios:release` kullanın.
