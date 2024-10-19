const bcrypt = require('bcryptjs');

const password = 'nouveauMotDePasse'; // Remplace par le mot de passe que tu souhaites utiliser

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`Mot de passe haché : ${hash}`);
});
