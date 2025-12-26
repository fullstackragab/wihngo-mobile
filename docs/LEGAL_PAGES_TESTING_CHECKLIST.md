# Legal Pages Implementation Checklist

Use this checklist to verify the Privacy Policy and Terms of Service implementation is complete and working correctly.

## ✅ Pre-Testing Setup

- [ ] App is running (`npm start` or `expo start`)
- [ ] You have access to both iOS and Android devices/simulators
- [ ] You can navigate to the Profile tab

## 📱 Functional Testing

### Privacy Policy Screen

- [ ] **Navigation**

  - [ ] Go to Profile → Settings → Privacy Policy
  - [ ] Screen opens successfully
  - [ ] Header shows "Privacy Policy" title
  - [ ] Back button (←) is visible

- [ ] **Content Display**

  - [ ] "Last updated" date is visible at top
  - [ ] All sections are visible:
    - [ ] "Who we are"
    - [ ] "What data we collect"
    - [ ] "Why we collect this data"
    - [ ] "Legal basis"
    - [ ] "Data sharing"
    - [ ] "Data retention"
    - [ ] "Your rights"
    - [ ] "Contact"
  - [ ] Bullet points display correctly
  - [ ] Footer text is visible
  - [ ] Content is scrollable

- [ ] **Interactivity**
  - [ ] Tap back button → Returns to Settings
  - [ ] Tap `privacy@wihngo.com` → Opens email app
  - [ ] Scroll to bottom → All content visible

### Terms of Service Screen

- [ ] **Navigation**

  - [ ] Go to Profile → Settings → Terms of Service
  - [ ] Screen opens successfully
  - [ ] Header shows "Terms of Service" title
  - [ ] Back button (←) is visible

- [ ] **Content Display**

  - [ ] "Last updated" date is visible at top
  - [ ] All sections are visible:
    - [ ] "Platform role"
    - [ ] "App usage"
    - [ ] "User content"
    - [ ] "Community guidelines"
    - [ ] "Support and payments"
    - [ ] "No guarantees"
    - [ ] "Limitation of liability"
    - [ ] "Account termination"
    - [ ] "Governing law"
    - [ ] "Changes to terms"
    - [ ] "Contact"
  - [ ] Bullet points display correctly
  - [ ] Footer text is visible
  - [ ] Content is scrollable

- [ ] **Interactivity**
  - [ ] Tap back button → Returns to Settings
  - [ ] Tap `support@wihngo.com` → Opens email app
  - [ ] Scroll to bottom → All content visible

### Settings Integration

- [ ] **Settings Screen**
  - [ ] Go to Profile → Settings
  - [ ] Scroll to "Support" section
  - [ ] "Terms of Service" button is visible
  - [ ] "Privacy Policy" button is visible
  - [ ] Both buttons have chevron (>) indicator

## 🌍 Translation Testing

Test with at least 3 different languages:

### English (en) - Default

- [ ] Settings → Language → English
- [ ] Open Privacy Policy → Content in English
- [ ] Open Terms of Service → Content in English

### Spanish (es) - Complete Translation

- [ ] Settings → Language → Español
- [ ] Open Privacy Policy → Content in Spanish
- [ ] Open Terms of Service → Content in Spanish
- [ ] Verify translations look natural

### French (fr) - Complete Translation

- [ ] Settings → Language → Français
- [ ] Open Privacy Policy → Content in French
- [ ] Open Terms of Service → Content in French
- [ ] Verify translations look natural

### Other Language (e.g., German, Japanese, Arabic)

- [ ] Settings → Language → [Any other language]
- [ ] Open Privacy Policy → Content appears (may be in English)
- [ ] Open Terms of Service → Content appears (may be in English)
- [ ] No crashes or blank screens

## 📐 Layout & Design Testing

### Privacy Policy Screen

- [ ] Text is readable (not too small/large)
- [ ] Proper spacing between sections
- [ ] Sections have bold titles
- [ ] Bullet points are indented
- [ ] Email link is blue/teal colored
- [ ] Footer is separated by line
- [ ] No text cutoff or overflow

### Terms of Service Screen

- [ ] Text is readable (not too small/large)
- [ ] Proper spacing between sections
- [ ] Sections have bold titles
- [ ] Bullet points are indented
- [ ] Email link is blue/teal colored
- [ ] Footer is separated by line
- [ ] No text cutoff or overflow

## 📱 Device Testing

### iOS

- [ ] iPhone (various models if possible)
- [ ] iPad (if applicable)
- [ ] Both portrait and landscape orientations
- [ ] Email links open iOS Mail app

### Android

- [ ] Android phone (various models if possible)
- [ ] Android tablet (if applicable)
- [ ] Both portrait and landscape orientations
- [ ] Email links open default email app

## 🐛 Error Scenarios

- [ ] **No Internet Connection**

  - [ ] Legal pages still load (static content)
  - [ ] No crash or error messages

- [ ] **Rapid Navigation**

  - [ ] Quickly tap Privacy Policy → Back → Terms → Back
  - [ ] No crashes or UI glitches

- [ ] **Language Switching**
  - [ ] Change language while on legal page
  - [ ] Content updates or app prompts restart

## 💾 Code Quality

- [ ] **Files Created**

  - [ ] `app/privacy-policy.tsx` exists
  - [ ] `app/terms-of-service.tsx` exists
  - [ ] No TypeScript/JavaScript errors

- [ ] **Files Modified**

  - [ ] `app/settings.tsx` updated correctly
  - [ ] Navigation routes work
  - [ ] No console errors

- [ ] **Translations**
  - [ ] Check `i18n/locales/en.json` has `legal` section
  - [ ] Check `i18n/locales/es.json` has `legal` section
  - [ ] Check `i18n/locales/fr.json` has `legal` section
  - [ ] All other language files have `legal` section

## 📊 Performance

- [ ] **Loading Time**

  - [ ] Privacy Policy opens quickly (< 1 second)
  - [ ] Terms of Service opens quickly (< 1 second)
  - [ ] Scrolling is smooth

- [ ] **Memory Usage**
  - [ ] No memory warnings in console
  - [ ] No memory leaks when opening/closing repeatedly

## ♿ Accessibility

- [ ] Text is legible at standard size
- [ ] Sufficient color contrast
- [ ] Tappable areas are large enough
- [ ] Navigation is intuitive

## 📝 Content Verification

### Privacy Policy

- [ ] Company name: "Wihngo" ✓
- [ ] Location: "European Union" ✓
- [ ] Registration: "Estonia" ✓
- [ ] Contact email: "privacy@wihngo.com" ✓
- [ ] Mentions GDPR ✓
- [ ] Lists user rights ✓

### Terms of Service

- [ ] Company name: "Wihngo" ✓
- [ ] Platform description: "community platform" ✓
- [ ] Not a charity/financial/vet service ✓
- [ ] Contact email: "support@wihngo.com" ✓
- [ ] Governing law: "Estonia and European Union" ✓
- [ ] Community guidelines present ✓

## 🚀 Pre-Production Checklist

### Must Complete Before Launch

- [ ] Legal counsel has reviewed content
- [ ] Set up `privacy@wihngo.com` email address
- [ ] Set up `support@wihngo.com` email address
- [ ] Update "Last updated" date to actual date
- [ ] Estonia company registration details confirmed

### Recommended Before Launch

- [ ] Get professional translations for missing languages
- [ ] Test on at least 5 different devices
- [ ] Have non-technical users test navigation
- [ ] Screenshot legal pages for documentation
- [ ] Create response templates for privacy/support emails

### Optional Enhancements

- [ ] Add "Delete Account" feature
- [ ] Add "Export Data" feature
- [ ] Add "Cookie Notice" if using analytics
- [ ] Implement version history for legal changes
- [ ] Add FAQ section

## ✅ Sign-Off

**Tested By:** ********\_\_\_********  
**Date:** ********\_\_\_********  
**Environment:** ☐ Development ☐ Staging ☐ Production  
**Devices Tested:** ********\_\_\_********

### Test Results

- **Total Tests:** **_ / _**
- **Passed:** \_\_\_
- **Failed:** \_\_\_
- **Blocked:** \_\_\_

### Critical Issues Found

1. ***
2. ***
3. ***

### Non-Critical Issues

1. ***
2. ***
3. ***

### Notes

---

---

---

---

**Approval Status:**

- [ ] ✅ Approved for Production
- [ ] ⚠️ Approved with Minor Issues
- [ ] ❌ Needs Revision

**Approved By:** ********\_\_\_********  
**Date:** ********\_\_\_********  
**Signature:** ********\_\_\_********

---

## 📚 Reference Documents

- [MOBILE_LEGAL_PAGES_IMPLEMENTATION.md](MOBILE_LEGAL_PAGES_IMPLEMENTATION.md) - Full implementation guide
- [LEGAL_PAGES_SUMMARY.md](LEGAL_PAGES_SUMMARY.md) - Quick summary
- [LEGAL_PAGES_DESIGN.md](LEGAL_PAGES_DESIGN.md) - Design specifications

## 🆘 Troubleshooting

### Issue: Legal pages don't open

**Solution:** Check that routes in `settings.tsx` are correct: `/privacy-policy` and `/terms-of-service`

### Issue: Email links don't work

**Solution:** Ensure device has email app configured. Test with `Linking.canOpenURL('mailto:test@test.com')`

### Issue: Content not translated

**Solution:** Check language file has `legal` section. Run `node scripts/add-legal-translations.js`

### Issue: Back button doesn't work

**Solution:** Verify `router.back()` is called in TouchableOpacity onPress handler

### Issue: Text is cut off

**Solution:** Ensure ScrollView has proper contentContainerStyle with padding

---

**Document Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Testing
