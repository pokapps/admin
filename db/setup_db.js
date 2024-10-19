const sqlite3 = require('sqlite3').verbose();

// Connecter à la base de données SQLite
const db = new sqlite3.Database('./revenus.db', (err) => {
    if (err) {
        console.error('Erreur de connexion à SQLite:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
    }
});

// Insérer des données de revenus initiales
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS revenus (
        mois TEXT,
        montant INTEGER
    )`);

    const stmt = db.prepare("INSERT INTO revenus (mois, montant) VALUES (?, ?)");
    
    // Ajouter des revenus pour les 12 derniers mois
    const revenus = [
        ['Jan', 4500], ['Feb', 4200], ['Mar', 5100],
        ['Apr', 6300], ['May', 6900], ['Jun', 7800],
        ['Jul', 8500], ['Aug', 7000], ['Sep', 6500],
        ['Oct', 7200], ['Nov', 7900], ['Dec', 8400]
    ];

    revenus.forEach(([mois, montant]) => {
        stmt.run(mois, montant);
    });

    stmt.finalize();
});

db.close();
