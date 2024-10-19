const bcrypt = require('bcryptjs');

// Mot de passe à hacher
const password = 'password'; // Tu peux remplacer "password" par le mot de passe que tu veux hacher

// Génération du hash du mot de passe
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`Mot de passe haché: ${hash}`);
});
