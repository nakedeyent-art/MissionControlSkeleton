import { TOTP, generateSecret, generateURI } from 'otplib';
console.log('generateSecret type:', typeof generateSecret);
console.log('generateURI type:', typeof generateURI);
const secret = generateSecret();
console.log('secret:', secret);
const uri = generateURI({ service: 'Test', account: 'test@test.com', secret });
console.log('uri:', uri);
