const express = require('express');
const router = express.Router();
const db = require('../db');

router.get("/products", (req, res) => {
    let sqlQuery = `SELECT * FROM produit`;

    console.log("Requête SQL exécutée :", sqlQuery);
    db.query(sqlQuery, (err, result) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json({ message: "Erreur du serveur" });
        }
        res.json(result);
    });
});

// Récupérer un produit spécifique
router.get('/products/:id', (req, res) => {
    const query = 'SELECT * FROM products WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(404).send();
        }
        res.send(result[0]);
    });
});

module.exports = router;
