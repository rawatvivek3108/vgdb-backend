import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ✅ Allow CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://vgdb-frontend.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => res.send("Backend with Prisma is running 🚀"));

// ✅ Message route
app.get("/api/message", (req, res) => res.json({ message: "Hello from the Prisma-powered backend!" })
);

// ✅ Get all games
app.get("/api/games", async (req, res) => 
{
  try {
    const games = await prisma.game.findMany();
    res.json(games);
  } catch (err) {
    console.error("Error fetching games:", err);
    res.status(500).json({error: "Failed to fetch games"});
  }
});

// ✅ Add a new game
app.post("/api/games", async (req, res) => {
  try {
    const {name, favorite = false} = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({error: "Game name is required"});
    }

    const game = await prisma.game.create({
      data: {name: name.trim(), favorite},
    });

    res.status(201).json(game);
  } catch (err){
    console.error("Error adding game:", err);
    res.status(500).json({error: "Failed to add game"});
  }
});

// ✅ Update a game (toggle favorite)
app.put("/api/games/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const updates = req.body;
    
    const updated = await prisma.game.update({
      where: {id},
      data: updates,
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating game:" , err);
    res.status(404).json({error: "Game not found"});
  }
});

// ✅ Delete a game
app.delete("/api/games/:id", async (req, res) => {
  try {
    const {id} = req.params;

    await prisma.game.delete({
      where: {id},
    });

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting game:", err);
    res.status(404).json({error:"Game not found"});
  }
});

// ✅ Clear all games (optional)
app.delete("/api/games", async (req, res) => {
  try {
    await prisma.game.deleteMany();
    res.status(204).send();
  } catch (err) {
    console.error("Error clearing games:", err);
    res.status(500).json({error: "Failed to clear games"});
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
