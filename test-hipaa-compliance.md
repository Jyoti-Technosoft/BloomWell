# HIPAA Compliance Testing Guide

## 1. Test Secure Logging (No PHI Exposure)

### Test Profile API
```bash
# Test GET profile (should log without PHI)
curl -X GET "http://localhost:3000/api/user/profile" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Check logs - should see:
# INFO: Profile access attempt {userId: "abc12345"}
# NOT: console.log('User email: user@example.com')
```

### Test Evaluation Submission
```bash
# Submit evaluation with sensitive data
curl -X POST "http://localhost:3000/api/evaluations" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "medicineId": "test-medicine",
    "medicineName": "Test Medicine",
    "lastFourSSN": "1234",
    "medicalConditions": ["Test condition"],
    "primaryGoal": "Weight Loss"
  }'

# Check logs - should see encrypted data stored, not plain text
```

## 2. Test Encryption/Decryption

### Create test script
```javascript
// test-encryption.js
const { encryptField, decryptField, encryptSensitiveFields } = require('./app/lib/encryption');

// Test basic encryption
const sensitiveData = "SSN-123-45-6789";
const encrypted = encryptField(sensitiveData);
const decrypted = decryptField(encrypted);

console.log('Original:', sensitiveData);
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', sensitiveData === decrypted);

// Test field-level encryption
const testData = {
  name: "John Doe",
  lastFourSSN: "1234",
  medicalHistory: "Diabetes, Hypertension"
};

const encryptedData = encryptSensitiveFields(testData);
console.log('Encrypted object:', encryptedData);
```

## 3. Test Session Timeout

### Manual Test
1. Login to the application
2. Wait 15 minutes
3. Try to access a protected page
4. Should be redirected to login page

### Automated Test
```javascript
// In browser console
setTimeout(() => {
  fetch('/api/user/profile')
    .then(res => res.json())
    .then(data => console.log('Session still active:', data))
    .catch(err => console.log('Session expired:', err));
}, 16 * 60 * 1000); // 16 minutes
```

## 4. Test Audit Logging

### Check Audit Trail
```sql
-- If you implement audit table in database
SELECT * FROM audit_logs 
WHERE action LIKE '%EVALUATION%' 
ORDER BY timestamp DESC 
LIMIT 10;

-- Should see entries like:
-- EVALUATION_SUBMITTED
-- PROFILE_ACCESSED
-- BOOKING_CANCELLED
```

## 5. Test Privacy Policy

### Verify HIPAA Content
1. Visit `/privacy` page
2. Check for these sections:
   - ✅ HIPAA Notice of Privacy Practices
   - ✅ Protected Health Information (PHI)
   - ✅ Your Rights Regarding Your PHI
   - ✅ Security Measures
   - ✅ Breach Notification
   - ✅ Contact Information

## 6. Test Database Encryption

### Check Encrypted Data
```sql
-- Check evaluations table for encrypted data
SELECT responses FROM evaluations 
WHERE created_at > NOW() - INTERVAL '1 hour'
LIMIT 1;

-- Should see encrypted JSON like:
-- {"lastFourSSN": {"encrypted": "abc123...", "iv": "def456...", "tag": "ghi789..."}}
```

## 7. Performance Testing

### Test Encryption Performance
```javascript
// Test encryption doesn't slow down the app
const start = Date.now();
for(let i = 0; i < 1000; i++) {
  encryptSensitiveFields(testData);
}
const end = Date.now();
console.log(`1000 encryptions took ${end - start}ms`);
```

## 8. Security Testing

### Test Input Validation
```bash
# Test malicious input
curl -X POST "http://localhost:3000/api/evaluations" \
  -H "Content-Type: application/json" \
  -d '{"lastFourSSN": "<script>alert(1)</script>"}'

# Should be sanitized/rejected
```

## 9. Environment Variables Check

### Verify Required Variables
```bash
# Check if encryption key is set
echo $ENCRYPTION_KEY
# Should be a 64-character hex string

# Check JWT secret
echo $JWT_SECRET
# Should be at least 32 characters
```

## 10. End-to-End Test

### Complete User Journey
1. Register new user
2. Complete medical questionnaire
3. Submit evaluation
4. Check profile
5. Cancel booking
6. Verify all actions are logged securely

## Expected Results

### ✅ Working Correctly
- No PHI in console logs
- All sensitive data encrypted in database
- Sessions timeout after 15 minutes
- Audit trail created for all PHI access
- Privacy policy shows HIPAA compliance

### ❌ Issues to Fix
- PHI visible in logs → Check secure-logger.ts imports
- Data not encrypted → Check ENCRYPTION_KEY environment variable
- Sessions not timing out → Check NextAuth configuration
- No audit logs → Check auditLog() function calls
