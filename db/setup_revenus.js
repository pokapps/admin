// setup_revenus.js

const sqlite3 = require('sqlite3').verbose();

// Connexion à la base de données revenus.db
const db = new sqlite3.Database('./db/revenus.db', (err) => {
    if (err) {
        console.error('Erreur de connexion à SQLite pour les revenus:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite pour les revenus.');
    }
});

// Créer une table revenus
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS revenus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        montant REAL,
        date TEXT
    )`, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table revenus:', err.message);
        } else {
            console.log('Table revenus créée ou déjà existante.');
        }
    });
});

// Fermer la base de données après les opérations
db.close();
