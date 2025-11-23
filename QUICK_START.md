# راهنمای سریع - اتصال فرانت‌اند به بک‌اند

## 🚀 Setup سریع

### مرحله 1: Build کردن فرانت‌اند

```bash
cd frontend
npm install
npm run build
cd ..
```

### مرحله 2: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### مرحله 3: اجرای Django

```bash
python manage.py runserver
```

حالا برو به `http://127.0.0.1:8000` و فرانت‌اند رو ببین! 🎉

---

## 📝 استفاده از Script خودکار

برای راحتی، یک script Python ساختم که همه کارها رو خودکار می‌کنه:

```bash
python build_frontend.py
```

این script:
1. React رو build می‌کنه
2. `index.html` رو به `staticfiles` کپی می‌کنه
3. Static files رو collect می‌کنه

---

## 🔧 نحوه کار

### در Localhost:
- Django روی `http://127.0.0.1:8000` اجرا می‌شه
- فرانت‌اند از Django serve می‌شه
- API calls به `/api/` می‌رن
- همه routes به React app می‌رن (SPA)

### در Production:
- همین مراحل رو انجام می‌دی
- از Gunicorn یا WSGI server استفاده می‌کنی
- همه چیز از یک سرور serve می‌شه

---

## 📋 چک‌لیست

- [ ] `npm run build` اجرا شده
- [ ] `collectstatic` اجرا شده
- [ ] `index.html` در `staticfiles` هست
- [ ] Django در حال اجراست
- [ ] می‌تونی به `http://127.0.0.1:8000` دسترسی داشته باشی

---

## 🐛 مشکلات رایج

### صفحه سفید نمایش داده می‌شه
**راه‌حل:** 
1. چک کن که `npm run build` اجرا شده
2. چک کن که `collectstatic` اجرا شده
3. Console مرورگر رو چک کن (F12)

### API calls کار نمی‌کنن
**راه‌حل:**
- در production، API URL خودکار به `/api` تغییر می‌کنه
- در development، از `http://127.0.0.1:8000/api` استفاده می‌کنه

---

## ✅ همه چیز آماده است!

حالا می‌تونی:
- ✅ در localhost با `python manage.py runserver` فرانت‌اند رو ببینی
- ✅ روی هر host Django deploy کنی
- ✅ همه چیز از یک سرور serve بشه

