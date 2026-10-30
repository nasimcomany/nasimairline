# اپ اندروید هواپیمایی نسیم

شِل Capacitor که همان سایت زنده را باز می‌کند:

`https://nasimairlines.ir`

## پیش‌نیاز

- Node.js
- Android Studio (با JDK 17)
- Android SDK

## راه‌اندازی

```bash
cd mobile
npm install
npx cap add android
npx cap sync android
npx cap open android
```

در Android Studio:

1. Build → Generate Signed Bundle / APK
2. برای **بازار** معمولاً APK
3. برای **Google Play** معمولاً AAB

## نکته فروشگاه‌ها

- **کافه بازار:** این مدل WebView معمولاً قابل قبول‌تر است.
- **Google Play:** اپ‌های صرفاً WebView ممکن است ریجکت شوند؛ اگر ریجکت شد باید Trusted Web Activity (TWA) یا امکانات نیتیو اضافه شود.

## هویت اپ

- `appId`: `ir.nasimairlines.app`
- `appName`: هواپیمایی نسیم

قبل از انتشار، آیکون و اسپلش را در Android Studio عوض کنید.
