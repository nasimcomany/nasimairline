# گردش کار توسعه — بعد از تغییر چه کنم؟

این سند برای کار روزمره روی پروژه نسیم ایر است:  
تغییرات کد، ری‌استارت، و به‌خصوص **تغییرات دیتابیس (Migration)**.

---

## ۱. قبل از هر کار

```powershell
cd c:\Users\HAMID-PC\Desktop\SampleProjects\nasimairline
.\venv\Scripts\Activate.ps1
```

پروژه را در حالت توسعه بالا بیاورید (یک‌بار در روز کافی است):

```powershell
.\start-dev.ps1
```

| لایه | آدرس | hot reload |
|------|------|------------|
| React | http://localhost:3000 | معمولاً خودکار |
| Django | http://127.0.0.1:8000 | معمولاً خودکار |

---

## ۲. بعد از هر نوع تغییر — چه دستوری؟

### الف) فقط فرانت (`frontend/src/...`)

| کار | لازم است؟ |
|-----|-----------|
| ذخیره فایل | کافی است؛ `npm start` خودش reload می‌کند |
| دستور اضافه | معمولاً **نه** |
| اگر صفحه عجیب شد | در مرورگر Hard Refresh: `Ctrl+Shift+R` |
| اگر compile خراب بود | ترمینال فرانت را ببندید و دوباره `npm start` |

```powershell
cd frontend
npm start
```

### ب) فقط بک‌اند Python (`views.py`, `serializers.py`, `urls.py`, …)

| کار | لازم است؟ |
|-----|-----------|
| ذخیره فایل | معمولاً `runserver` خودش reload می‌کند |
| دستور migrate | **فقط اگر مدل/DB عوض شده** |
| ری‌استارت دستی | اگر reload نشد: `Ctrl+C` بعد دوباره `runserver` |

```powershell
.\venv\Scripts\Activate.ps1
python manage.py runserver 8000
```

### ج) تغییر `settings.py` یا `.env`

- سرور Django را **حتماً یک‌بار ری‌استارت** کنید (`Ctrl+C` → `runserver` دوباره).
- تغییر env فرانت (`frontend/.env`) → ری‌استارت `npm start`.

### د) پکیج جدید Python

```powershell
.\venv\Scripts\Activate.ps1
pip install نام-پکیج
# بهتر است در requirements.txt هم اضافه شود
python manage.py runserver 8000
```

### هـ) پکیج جدید npm

```powershell
cd frontend
npm install نام-پکیج
# اگر سرور باز بود، یک‌بار متوقف و دوباره npm start
```

### و) تغییر مدل / دیتابیس

→ بخش **۳ و ۴** همین فایل (migration).

---

## ۳. اجرای مجدد پروژه (ری‌استارت کامل)

وقتی همه چیز به هم ریخت یا صبح دوباره شروع می‌کنید:

```powershell
# بستن سرورهای قبلی (در ترمینال‌ها Ctrl+C)
cd c:\Users\HAMID-PC\Desktop\SampleProjects\nasimairline
.\venv\Scripts\Activate.ps1
.\start-dev.ps1
```

یا دستی:

```powershell
# ترمینال ۱
.\venv\Scripts\Activate.ps1
python manage.py runserver 8000

# ترمینال ۲
cd frontend
npm start
```

چک سریع:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/health/" -UseBasicParsing
```

---

## ۴. Migration — ساخت و اعمال

در Django وقتی **مدل** (`models.py`) عوض می‌شود، اسکیما DB خودکار عوض نمی‌شود. باید migration بسازید و اعمال کنید.

### جریان استاندارد

```text
تغییر models.py
    → makemigrations   (ساخت فایل migration)
    → migrate          (اعمال روی دیتابیس)
    → در صورت نیاز ری‌استارت runserver
```

### دستور ساخت migration

از ریشه پروژه با venv فعال:

```powershell
# همه اپ‌ها
python manage.py makemigrations

# فقط یک اپ مشخص (پیشنهادی)
python manage.py makemigrations flights
python manage.py makemigrations bookings
python manage.py makemigrations accounts
```

خروجی موفق چیزی شبیه:

```text
Migrations for 'flights':
  flights/migrations/0004_....py
    - Add field ...
```

### دستور اعمال روی دیتابیس

```powershell
python manage.py migrate
```

فقط یک اپ:

```powershell
python manage.py migrate flights
```

### دیدن وضعیت

```powershell
python manage.py showmigrations
python manage.py showmigrations bookings
```

`[X]` = اعمال شده، `[ ]` = هنوز اعمال نشده.

### پیش‌نمایش SQL (اختیاری)

```powershell
python manage.py sqlmigrate flights 0004
```

---

## ۵. نکات مهم هنگام تغییر دیتابیس

### ۵.۱ چه چیزهایی migration می‌خواهند؟

| تغییر | نیاز به makemigrations؟ |
|--------|-------------------------|
| فیلد جدید / حذف فیلد / تغییر نوع فیلد | بله |
| تغییر `null`, `default`, `unique`, `db_index` | بله |
| مدل جدید / حذف مدل | بله |
| تغییر فقط `views` / `serializers` / منطق Python | **خیر** |
| تغییر داده با کد (بدون اسکیما) | معمولاً نه؛ یا data migration |

### ۵.۲ ترتیب امن کار

1. **بکاپ بگیرید** اگر دیتای مهم دارید (حداقل روی ماشین خودتان).  
   نمونه dump:

   ```powershell
   $env:PGPASSWORD = "رمز-شما"
   & "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U postgres -h localhost -d nasim -F c -f backup_nasim.dump
   ```

2. مدل را در `models.py` عوض کنید.
3. `makemigrations` بزنید و فایل ساخته‌شده در `*/migrations/` را **بخوانید**.
4. روی local: `migrate`.
5. پروژه را تست کنید (API مربوطه، ادمین).
6. اگر چند نفر روی پروژه کار می‌کنند: فایل migration را **commit** کنید؛ بقیه فقط `migrate` می‌زنند (دوباره `makemigrations` بی‌دلیل نزنند).

### ۵.۳ قوانین طلایی

- **هرگز** دستی جدول را در pgAdmin عوض نکنید و migration را فراموش نکنید — بعداً Django و DB از هم جدا می‌شوند.
- فایل‌های داخل `migrations/` را **دستکاری بی‌دلیل / حذف** نکنید مگر بلد باشید.
- روی دیتابیس مشترک/پروداکشن اول روی local تست کنید.
- فیلد جدید روی جدول پر از داده:
  - یا `null=True` بگذارید،  
  - یا `default=...` بدهید،  
  - وگرنه migrate خطا می‌دهد.
- حذف فیلد / ستون: اول مطمئن شوید فرانت و API دیگر از آن استفاده نمی‌کنند.
- تغییر نام فیلد: ترجیحاً با `RenameField` در migration (نه حذف+ساخت) تا داده از بین نرود.
- اگر `makemigrations` می‌گوید *No changes detected* ولی فکر می‌کنید مدل عوض شده: فایل را ذخیره کنید، اپ درست را نام ببرید، و مطمئن شوید مدل در `INSTALLED_APPS` است.

### ۵.۴ Data migration (وقتی فقط داده باید عوض شود)

اگر اسکیما ثابت است ولی باید داده را یک‌بار تبدیل کنید:

```powershell
python manage.py makemigrations نام_اپ --empty -n نام_توضیحی
```

بعد داخل فایل، تابع `forwards` بنویسید. این برای کار روزمره کمتر لازم است.

### ۵.۵ برگشت به عقب (احتیاط)

برگشت یک قدم (مثلاً bookings به migration شماره ۲):

```powershell
python manage.py migrate bookings 0002
```

دادهٔ وابسته ممکن است از بین برود — فقط وقتی می‌دانید چه می‌کنید.

### ۵.۶ تداخل migration (دو نفر همزمان)

اگر دو migration با شماره یکسان ساخته شد:

```powershell
python manage.py makemigrations --merge
```

---

## ۶. چک‌لیست سریع بعد از تغییر DB

- [ ] بکاپ (اگر لازم)
- [ ] ویرایش `models.py`
- [ ] `python manage.py makemigrations <app>`
- [ ] مرور فایل migration جدید
- [ ] `python manage.py migrate`
- [ ] `python manage.py check`
- [ ] تست API / ادمین مربوطه
- [ ] اگر فرانت به فیلد جدید وابسته است → تایپ/فرم فرانت را هم آپدیت کنید
- [ ] commit کردن فایل‌های `migrations/*.py` همراه تغییر مدل

---

## ۷. سناریوهای نمونه

### سناریو ۱ — فقط متن دکمه در React

1. فایل TSX را ادیت و ذخیره کنید.  
2. مرورگر خودش آپدیت می‌شود.  
3. **هیچ** دستور Django لازم نیست.

### سناریو ۲ — فیلد جدید روی مدل Booking

```powershell
.\venv\Scripts\Activate.ps1
# بعد از ادیت bookings/models.py:
python manage.py makemigrations bookings
python manage.py migrate
# در صورت نیاز serializer/views/فرانت را هم آپدیت کنید
```

### سناریو ۳ — endpoint جدید بدون تغییر جدول

1. `views.py` + `urls.py` (+ serializer اگر لازم).  
2. ذخیره → runserver reload.  
3. فرانت `services/*.ts` را وصل کنید.  
4. migrate لازم نیست.

### سناریو ۴ — صبح روز بعد / بعد از pull کد دیگران

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt          # اگر وابستگی عوض شده
python manage.py migrate                 # migrationهای جدید دیگران
cd frontend
npm install                              # اگر package.json عوض شده
cd ..
.\start-dev.ps1
```

---

## ۸. خلاصه یک‌خطی

| نوع تغییر | کار شما |
|-----------|---------|
| UI React | ذخیره؛ گاهی Refresh |
| منطق API بدون DB | ذخیره؛ گاهی ری‌استارت runserver |
| مدل / جدول | `makemigrations` → `migrate` |
| .env / settings | ری‌استارت سرور |
| بعد از pull | `migrate` + در صورت نیاز `npm install` / `pip install` |
| اجرای روزانه | `.\start-dev.ps1` |

راهنمای نصب اولیه از صفر: `docs/RUN_LOCAL_FA.md`
