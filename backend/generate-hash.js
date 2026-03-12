import bcrypt from 'bcrypt';

const password = 'admin123';
const hash = await bcrypt.hash(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nCopy this SQL command:\n');
console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@store.com';`);