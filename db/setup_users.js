const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./db/users.db', (err) => {
    if (err) {
        console.error('Erreur de connexion à SQLite pour les utilisateurs:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite pour les utilisateurs.');
    }
});

// Créer une table utilisateurs et ajouter un utilisateur admin
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
    )`, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table utilisateurs:', err.message);
        } else {
            console.log('Table utilisateurs créée ou déjà existante.');
        }
    });

    const username = 'admin';
    const password = 'password'; // Mot de passe à personnaliser
    const role = 'admin';

    // Hasher le mot de passe
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Erreur lors du hashage du mot de passe:', err.message);
        } else {
            // Insérer l'utilisateur admin
            db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username, hash, role], function(err) {
                if (err) {
                    console.error('Erreur lors de l\'insertion de l\'utilisateur admin:', err.message);
                } else {
                    console.log('Utilisateur admin créé avec succès.');
                }

                // Fermer la base de données une fois que l'insertion est terminée
                db.close((err) => {
                    if (err) {
                        console.error('Erreur lors de la fermeture de la base de données:', err.message);
                    } else {
                        console.log('Base de données SQLite fermée correctement.');
                    }
                });
            });
        }
    });
});
