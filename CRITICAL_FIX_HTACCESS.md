# CRITICAL: Update .htaccess on cPanel Server

## The Problem
Your .htaccess on the server is blocking Railway backend URL.

## The Solution
Replace the .htaccess file on cPanel with the correct one.

---

## Option 1: Upload New .htaccess (EASIEST)

1. **cPanel → File Manager**
2. **Go to** `public_html/`
3. **Delete** old `.htaccess`
4. **Upload** new one from: `d:\ygi\YGIholidayhomes\frontend\dist\.htaccess`

---

## Option 2: Edit .htaccess Directly in cPanel

1. **cPanel → File Manager → public_html/**
2. **Right-click** `.htaccess` → **Edit**
3. **Find line 27** (the CSP line - it's one VERY long line)
4. **Look for:** `connect-src 'self' https://api.stripe.com...`
5. **Add this URL** to the connect-src list:
   ```
   https://ygiholidayhomes-production.up.railway.app
   ```

### The connect-src line should look like this:

```apache
connect-src 'self' https://api.stripe.com https://api.exchangerate-api.com https://script.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com https://ygiholidayhomes.com https://www.ygiholidayhomes.com https://ygiholidayhomes.com/backend https://ygiholidayhomes-production.up.railway.app
```

6. **Save** the file

---

## After Updating .htaccess:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Try payment again**

The CSP error should be GONE! ✅

---

## Also Upload New Frontend Files

Upload ALL files from `d:\ygi\YGIholidayhomes\frontend\dist\` to `public_html/`:
- `index.html` (updated - no CSP conflict)
- `assets/` folder
- `.htaccess` (with Railway URL)
- All image folders

---

## Test After Upload

1. Visit: `https://ygiholidayhomes.com`
2. Open DevTools (F12) → Console
3. Should see: `Backend URL: https://ygiholidayhomes-production.up.railway.app`
4. **NO CSP errors!** ✅
5. Try booking → payment should work!

---

**The key is:** The `.htaccess` file MUST have the Railway URL in the connect-src directive!
