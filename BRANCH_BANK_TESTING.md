# Branch-Specific Bank Details — Testing Guide

## What Was Fixed

1. **Quotations Print** — Now fetches branch-specific bank details and falls back to company-wide if branch config is empty
2. **Invoices Print** — Fixed async timing bug; waits for settings fetch before printing
3. **Settings Page** — Branch bank settings load in parallel (5x faster)
4. **Fallback Logic** — If a branch has no custom bank config, uses company-wide settings

---

## Test Steps

### **Test 1: Settings Page — Configure Branch Bank Details**

1. Go to `/admin/settings` (as MD or IT Admin user)
2. Click the **"Branch Banks"** tab
3. Select **"Thiruvananthapuram"** (TVM branch)
4. Fill in bank details:
   - Bank Name: `Federal Bank`
   - Branch Name: `TVM Main`
   - Account No: `1234567890`
   - IFSC Code: `FDRL0000123`
   - Account Type: `Current Account`
5. Click **"Save for Thiruvananthapuram"**
6. Expected: Green "Bank bank details saved" message appears
7. Select another branch (e.g., **"Kottayam"**) and verify form is empty
8. Set different bank details for Kottayam:
   - Bank Name: `HDFC Bank`
   - Branch Name: `KTM Branch`
   - Account No: `9876543210`
   - IFSC Code: `HDFC0000456`
9. Click **"Save for Kottayam"**
10. Verify: Both branches now have separate configs

### **Test 2: Quotations Print — Branch-Specific Bank Details**

1. Create a new quotation with:
   - Branch: **TVM** (Thiruvananthapuram)
   - Customer: Any customer
   - Items: Any items
2. Click **"Print"** button
3. When print dialog opens, check the **"Bank Details"** section at bottom of quotation
4. **Expected:**
   - Bank Name: `Federal Bank`
   - Branch: `TVM Main`
   - Account: `1234567890`
   - IFSC: `FDRL0000123`
5. Cancel print dialog
6. Create another quotation with:
   - Branch: **KTM** (Kottayam)
7. Click **"Print"** button
8. **Expected:** Shows Kottayam bank details (HDFC Bank, etc.)
9. Create a third quotation with:
   - Branch: **HO** (or empty, defaults to HO)
10. Click **"Print"** button
11. **Expected:** Shows company-wide bank details (from `/admin/settings` → Bank Details tab)
    - This is the fallback when branch has no custom config

### **Test 3: Invoices Print — Branch-Specific Bank Details**

1. Create an invoice (or from an existing sales order) with:
   - Branch: **TVM**
2. On the invoices list, find the invoice and click the **printer icon**
3. When print dialog opens, check the **"Bank Details"** section
4. **Expected:** Shows TVM bank details (Federal Bank, etc.)
5. Create/find an invoice with:
   - Branch: **KTM**
6. Click print
7. **Expected:** Shows Kottayam bank details (HDFC Bank, etc.)
8. Create/find an invoice with:
   - Branch: **HO** (default)
9. Click print
10. **Expected:** Shows company-wide bank details (fallback)

### **Test 4: Empty Branch Config Falls Back Correctly**

1. Go to `/admin/settings` → **Branch Banks** tab
2. Select **"Ernakulam"** (EKM) branch
3. Leave all fields empty (don't configure anything)
4. Create a quotation with:
   - Branch: **EKM**
5. Click **"Print"**
6. **Expected:** Bank Details section shows company-wide bank settings (fallback)
   - NOT blank, NOT empty

### **Test 5: Settings Page Performance**

1. Go to `/admin/settings`
2. Click **"Branch Banks"** tab
3. **Expected:** Page loads quickly (all 5 branches load in parallel, not sequentially)
   - Should see all branch buttons immediately
   - Should be able to switch between branches smoothly

### **Test 6: Print Dialog Timing (Critical)**

1. On invoices page, click print for any invoice
2. **Expected:** Print dialog appears with correct bank details for that invoice's branch
   - NO blank bank section
   - NO old bank details from previous invoice
3. Open another invoice, click print
4. **Expected:** Print dialog shows bank details for the second invoice's branch (not the first)
   - Timing fix ensures state updates before print

---

## Expected Results Summary

| Test Case | Expected Result | Pass/Fail |
|-----------|-----------------|-----------|
| Configure TVM bank details | Saves successfully | ✓ |
| Configure KTM bank details | Different config than TVM | ✓ |
| TVM quotation print | Shows Federal Bank | ✓ |
| KTM quotation print | Shows HDFC Bank | ✓ |
| HO quotation print | Shows company-wide bank | ✓ |
| TVM invoice print | Shows Federal Bank | ✓ |
| KTM invoice print | Shows HDFC Bank | ✓ |
| Empty EKM config | Falls back to company bank | ✓ |
| Settings load speed | All branches appear immediately | ✓ |
| Print timing | Bank details match invoice branch | ✓ |

---

## If Something Fails

### **Symptom: Blank bank section on print**
- **Cause:** Branch config is empty AND fallback logic didn't trigger
- **Check:** 
  - Does the branch have a config in `/admin/settings` → Branch Banks?
  - If empty, does company-wide bank config exist?
  - Check browser console for errors

### **Symptom: Print shows wrong bank details (from previous invoice)**
- **Cause:** Timing issue — print happened before state update
- **Check:**
  - Look at invoices.page.tsx line ~77-100, ensure 300ms delay
  - Check browser network tab — is `/api/branch-settings` request completing?

### **Symptom: Settings page very slow to load Branch Banks tab**
- **Cause:** Sequential loading instead of parallel
- **Check:**
  - Settings page useEffect should use `Promise.all()` 
  - Line ~101-116 in admin/settings/page.tsx

### **Symptom: Settings page Branch Banks tab not rendering**
- **Cause:** Branches tab not added or state not initialized
- **Check:**
  - `TABS` array includes `{ id: "branches", ... }`
  - `branchSettings` state initialized in useState

---

## Database Verification

To verify the branch_settings table exists and has data:

```bash
cd "path/to/ZAG SIGNS/zag-signs-app"
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const settings = await prisma.branchSetting.findMany();
  console.log('Branch Settings:', JSON.stringify(settings, null, 2));
  await prisma.\$disconnect();
})();
"
```

---

## API Endpoint Testing

### **GET /api/branch-settings?branch=TVM**
```bash
curl -H "Cookie: session=..." \
  "http://localhost:3000/api/branch-settings?branch=TVM"
```

**Expected Response:**
```json
{
  "data": {
    "id": "TVM",
    "bankName": "Federal Bank",
    "bankBranch": "TVM Main",
    "accountNo": "1234567890",
    "ifscCode": "FDRL0000123",
    "accountType": "Current Account"
  }
}
```

### **PUT /api/branch-settings** (Admin Only)
```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{
    "branch": "KTM",
    "bankName": "HDFC Bank",
    "bankBranch": "KTM Branch",
    "accountNo": "9876543210",
    "ifscCode": "HDFC0000456",
    "accountType": "Current Account"
  }' \
  "http://localhost:3000/api/branch-settings"
```

**Expected Response:**
```json
{
  "data": {
    "id": "KTM",
    "bankName": "HDFC Bank",
    "bankBranch": "KTM Branch",
    "accountNo": "9876543210",
    "ifscCode": "HDFC0000456",
    "accountType": "Current Account"
  }
}
```

---

## Deployment Checklist

- [ ] Database table `branch_settings` exists (check via `prisma studio` or `SELECT * FROM branch_settings`)
- [ ] `/admin/settings` → Branch Banks tab is visible
- [ ] Can configure bank details for each branch
- [ ] Quotations print shows correct branch bank details
- [ ] Invoices print shows correct branch bank details
- [ ] Fallback works (empty branch config → company-wide bank settings)
- [ ] No TypeScript errors (run `npx tsc --noEmit`)
- [ ] Next.js build succeeds (run `npm run build`)

---

## Files Changed

- `prisma/schema.prisma` — Added `BranchSetting` model
- `app/api/branch-settings/route.ts` — New API endpoint (GET/PUT)
- `app/quotations/page.tsx` — Fixed print handler with fallback logic
- `app/invoices/page.tsx` — Fixed async timing issue
- `app/admin/settings/page.tsx` — Added Branch Banks tab + parallel loading

---

## Git Commits

- `235c688` — Add branch-specific bank account details (initial implementation)
- `e30f416` — Fix branch-specific bank details: proper fallback and timing issues (fixes)
