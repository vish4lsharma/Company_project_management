const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'AdminPlacement@178';
    const hash = await bcrypt.hash(password, 12);
    console.log('Password:', password);
    console.log('Hash:', hash);
}

generateHash();
