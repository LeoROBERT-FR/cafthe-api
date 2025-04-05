const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const {sign} = require('jsonwebtoken')

router.post('/register', (req, res) => {
    const { name, birthday, phone, email, password, adress } = req.body;

    // Vérifier si l'email existe déjà
    db.query('SELECT * FROM client WHERE Mail_Client = ?', [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: `Erreur SQL: ${err}` });
        }
        if (result.length > 0) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        // Hasher le mot de passe seulement si l'email est unique
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({ message: `Erreur Hashage: ${err}` });
            }
            const moment = require('moment');
            const Date_Inscription_Client = moment().format('YYYY-MM-DD');

            // Insérer le client dans la base de données
            db.query(
                'INSERT INTO client (`Nom_Prenom_Client`, `Date_Naissance_Client`, `Tel_Client`, `Mail_Client`, `MDP_Client`, `Date_Inscription_Client`, `Premiere_Connexion_Client`, `Adresse_Livraison_Client`) VALUES (?,?,?,?,?,?,1,?)',
                [name, birthday, phone, email, hash, Date_Inscription_Client, adress],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: "Erreur lors de l'inscription" });
                    }
                    res.status(201).json({ message: "Inscription réussie", client_id: result.insertId });
                }
            );
        });
    });
});

router.post('/login', (req, res) => {
    console.log("🔹 Requête reçue avec body:", req.body); // Débug 1

    const { email, password } = req.body;
    if (!email || !password) {
        console.log("⚠️ Email ou mot de passe manquant");
        return res.status(400).json({ message: "Veuillez fournir un email et un mot de passe" });
    }

    db.query('SELECT * FROM client WHERE Mail_Client = ?', [email], (err, result) => {
        if (err) {
            console.error("❌ Erreur SQL:", err);
            return res.status(500).json({ message: "Erreur du serveur" });
        }

        console.log("🔹 Résultat SQL:", result); // Débug 2
        if (result.length === 0) {
            console.log("⚠️ Aucun client trouvé");
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        const client = result[0];

        bcrypt.compare(password, client.MDP_Client, (err, isMatch) => {
            if (err) {
                console.error("❌ Erreur bcrypt:", err);
                return res.status(500).json({ message: "Erreur du serveur" });
            }

            if (!isMatch) {
                console.log("⚠️ Mot de passe invalide");
                return res.status(401).json({ message: "Mot de passe invalide" });
            }

            // Générer le token
            const token = sign(
                {id: client.Id_Client, email: client.Mail_Client, adresse: client.Adresse_Livraison_Client},
                process.env.JWT_SECRET,
                {expiresIn: process.env.JWT_EXPIRES_IN}
            )

            console.log("✅ Connexion réussie !");

            // Renvoi du token et des données du client
            res.json({
                token, // Token à renvoyer
                client: { // Données du client
                    id: client.Id_Client,
                    name: client.Nom_Client,
                    email: client.Mail_Client,
                    address: client.Adresse_Livraison_Client
                }
            });
        });
    });
});


module.exports = router;
