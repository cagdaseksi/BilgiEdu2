# BilgiEdu2

React Native Community CLI ile oluşturulmuş boş mobil uygulama. Android ve iOS native projeleri hazırdır.

## Çalıştırma

Proje klasöründe Metro sunucusunu başlatın:

```sh
npm start
```

Başka bir terminalde iOS simülatöründe çalıştırın:

```sh
npm run ios
```

Android emülatörü veya bağlı Android cihaz için:

```sh
npm run android
```

Bu proje Metro için **8082** portunu kullanır.

## Geliştirme

Başlangıç ekranı `App.tsx` dosyasında bulunan boş, beyaz bir ekrandır. Kaydettiğiniz değişiklikler Fast Refresh ile görüntülenir.

Bağımlılıkları yeniden kurmak için:

```sh
npm ci
cd ios
bundle install
bundle exec pod install
cd ..
```

Kod kontrolü:

```sh
npm run lint
npx tsc --noEmit
npm test -- --runInBand
```

Kurulum referansı: [React Native Community CLI](https://github.com/react-native-community/cli/blob/main/docs/init.md).
