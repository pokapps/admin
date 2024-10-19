document.addEventListener("DOMContentLoaded", function() {
    // Exemple de données de tables avec le nombre de sièges disponibles et occupés
    let tables = [
        {name: "Table 1", blinds: "2/5", minBuyIn: 100, seatsAvailable: 3, seatsTaken: 5},
        {name: "Table 2", blinds: "1/2", minBuyIn: 50, seatsAvailable: 1, seatsTaken: 5},
        {name: "Table 3", blinds: "5/10", minBuyIn: 200, seatsAvailable: 0, seatsTaken: 6} // Table pleine
    ];

    // Référence vers la section des joueurs en attente
    const waitlistPlayers = document.getElementById('waitlist-players');

    // Fonction pour afficher les tables sur la page
    function renderTables() {
        const tablesGrid = document.querySelector('.tables-grid'); // Section des tables
        tablesGrid.innerHTML = ''; // Réinitialise l'affichage des tables

        tables.forEach((table, index) => {
            const tableCard = document.createElement('div');
            tableCard.className = `table-card ${table.seatsAvailable > 0 ? 'available' : 'full'}`;
            tableCard.innerHTML = `
                <h3>${table.name}</h3>
                <p>Blinds: ${table.blinds}</p>
                <p>Min Buy-in: $${table.minBuyIn}</p>
                <p>Seats Available: ${table.seatsAvailable}</p>
                <p>Seats Taken: ${table.seatsTaken}</p>
                <button class="delete-table-btn">Supprimer</button> <!-- Bouton Supprimer -->
            `;
            tablesGrid.appendChild(tableCard);

            // Gestion du bouton "Supprimer" pour chaque table
            tableCard.querySelector('.delete-table-btn').addEventListener('click', function() {
                deleteTable(index); // Appel de la fonction pour supprimer la table
            });
        });
    }

    // Fonction pour ajouter un joueur à la liste d'attente
    function addPlayerToWaitlist(playerName) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${playerName}
            <button class="take-seat-btn">Take Seat</button>
            <button class="remove-btn">Supprimer</button>
        `;
        waitlistPlayers.appendChild(listItem);

        // Gestion des boutons Take Seat et Supprimer
        listItem.querySelector('.take-seat-btn').addEventListener('click', function() {
            assignPlayerToTable(playerName);
            waitlistPlayers.removeChild(listItem); // Retirer le joueur de la liste d'attente
        });

        listItem.querySelector('.remove-btn').addEventListener('click', function() {
            waitlistPlayers.removeChild(listItem); // Supprimer un joueur de la liste d'attente
        });
    }

    // Fonction pour assigner un joueur à une place libre sur une table
    function assignPlayerToTable(playerName) {
        const availableTable = tables.find(table => table.seatsAvailable > 0); // Chercher une table avec des places libres
        if (availableTable) {
            availableTable.seatsAvailable--; // Réduire le nombre de places disponibles
            availableTable.seatsTaken++; // Augmenter le nombre de places occupées
            renderTables();  // Mettre à jour l'affichage des tables

            // Enregistrer l'événement (check-in) dans le fichier CSV via le serveur (à ajouter si nécessaire)
            logEventToServer(playerName, 'check-in', availableTable.name);

            alert(`${playerName} a été assigné à ${availableTable.name}`);
        } else {
            alert('Aucune place disponible.');
        }
    }

    // Fonction pour envoyer l'événement au serveur pour l'enregistrement dans le CSV
    function logEventToServer(playerName, action, tableName) {
        fetch('/api/event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playerName: playerName,
                action: action,
                tableName: tableName
            })
        })
        .then(response => {
            if (response.ok) {
                console.log('Événement enregistré avec succès.');
            } else {
                console.error('Erreur lors de l\'enregistrement de l\'événement.');
            }
        })
        .catch(error => {
            console.error('Erreur réseau :', error);
        });
    }

    // Fonction pour supprimer une table
    function deleteTable(index) {
        const tableToDelete = tables[index]; // Table sélectionnée
        tables.splice(index, 1); // Supprimer la table de la liste
        renderTables(); // Mettre à jour l'affichage
        alert(`Table ${tableToDelete.name} supprimée avec succès.`);
    }

    // Événement pour ajouter un joueur à la liste d'attente
    document.getElementById('add-waitlist').addEventListener('click', function() {
        const playerName = prompt('Entrez le nom du joueur :');
        if (playerName) {
            addPlayerToWaitlist(playerName);
        }
    });

    // Initialiser l'affichage des tables au chargement de la page
    renderTables();
});
