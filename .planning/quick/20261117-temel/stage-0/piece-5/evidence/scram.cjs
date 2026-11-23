// Computes a PostgreSQL SCRAM-SHA-256 verifier on the client (RFC 5802/7677, PG's stored format).
// Usage: node scram.js <password>   (ASCII password: SASLprep is the identity)
const c = require('crypto');
const pw = process.argv[2];
const iter = 4096;
const salt = c.randomBytes(16);
const salted = c.pbkdf2Sync(Buffer.from(pw, 'utf8'), salt, iter, 32, 'sha256');
const clientKey = c.createHmac('sha256', salted).update('Client Key').digest();
const storedKey = c.createHash('sha256').update(clientKey).digest();
const serverKey = c.createHmac('sha256', salted).update('Server Key').digest();
process.stdout.write(`SCRAM-SHA-256$${iter}:${salt.toString('base64')}$${storedKey.toString('base64')}:${serverKey.toString('base64')}`);
