import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey'; // Change cette clé pour plus de sécurité

// Route pour récupérer tous les utilisateurs
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Route pour ajouter un utilisateur
app.post('/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    const newUser = await prisma.user.create({
      data: { email, name },
    });
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l’utilisateur' });
  }
});

// 🔹 Route d'inscription
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    res.json({ message: 'Inscription réussie', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l’inscription' });
  }
});

// 🔹 Route de connexion
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }

    // Générer un token JWT
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ message: 'Connexion réussie', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// 🔹 Route pour récupérer le personnage favori de l'utilisateur
app.get('/user/favorite-character/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Retrieve the user's favorite character and image
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user || !user.favoriteCharacter) {
      return res.status(404).json({ error: 'Aucun personnage favori trouvé' });
    }

    res.json({
      favoriteCharacter: user.favoriteCharacter,
      characterImage: user.characterImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération du personnage favori' });
  }
});

// 🔹 Route pour mettre à jour le personnage favori de l'utilisateur
app.post('/user/update-favorite-character', async (req, res) => {
  try {
    const { userId, favoriteCharacter, characterImage } = req.body;

    // Update user's favorite character and image
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { favoriteCharacter, characterImage },
    });

    res.json({ message: 'Personnage favori mis à jour', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du personnage favori' });
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
