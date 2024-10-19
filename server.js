const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json()); // Permet la gestion du JSON dans les requêtes

// Servir les fichiers statiques depuis le dossier public
app.use(express.static(path.join(__dirname, 'public')));

const SECRET_KEY = "votre_secret_jwt";  // Clé pour le token JWT

// Connexion à la base de données SQLite pour les utilisateurs
const db = new sqlite3.Database(path.join(__dirname, 'db', 'users.db'), (err) => {
    if (err) {
        console.error('Erreur de connexion à SQLite:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
    }
});

// Middleware pour activer CORS et autoriser les requêtes POST
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

// Middleware pour vérifier le token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Accès non autorisé' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token invalide' });
        req.user = user;
        next();
    });
}

// Route pour s'inscrire (ajout d'un nouvel utilisateur)
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe sont requis' });
    }

    // Vérification si l'utilisateur existe déjà
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return res.status(500).json({ message: 'Erreur du serveur' });
        if (row) return res.status(400).json({ message: 'Utilisateur déjà existant' });

        // Hasher le mot de passe
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ message: 'Erreur lors du hashage du mot de passe' });

            // Insérer l'utilisateur dans la base de données
            db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, 'user'], (err) => {
                if (err) return res.status(500).json({ message: 'Erreur lors de l’inscription' });
                res.json({ message: 'Utilisateur créé avec succès' });
            });
        });
    });
});

// Route de connexion pour générer un token JWT
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Recherche de l'utilisateur dans la base de données
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) return res.status(500).json({ message: 'Erreur du serveur' });
        if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé' });

        // Comparaison des mots de passe
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(400).json({ message: 'Mot de passe incorrect' });
            }

            // Générer le token JWT
            const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ token });
        });
    });
});

// Protéger la page index.html avec le middleware d'authentification
app.get('/index.html', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
