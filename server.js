import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import Book from "./models/Book.js";

dotenv.config();

const app = express();

// Render provides PORT automatically
const PORT = process.env.PORT || 5000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// ===============================
// AUTH ROUTES
// ===============================

app.use("/api/auth", authRoutes);

// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Spicer Backend Server is running!",
  });
});

// ===============================
// GET ALL BOOKS
// ===============================

app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);

    res.status(500).json({
      message: "Failed to fetch books",
      error: error.message,
    });
  }
});

// ===============================
// GET SINGLE BOOK
// ===============================

app.get("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book:", error);

    res.status(500).json({
      message: "Failed to fetch book",
      error: error.message,
    });
  }
});

// ===============================
// ADD BOOK
// ===============================

app.post("/api/books", async (req, res) => {
  try {
    const { title, author, category, status } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({
        message: "Title, author and category are required",
      });
    }

    const book = new Book({
      title,
      author,
      category,
      status: status || "Available",
    });

    const savedBook = await book.save();

    res.status(201).json({
      message: "Book added successfully",
      book: savedBook,
    });
  } catch (error) {
    console.error("Error adding book:", error);

    res.status(500).json({
      message: "Failed to add book",
      error: error.message,
    });
  }
});

// ===============================
// UPDATE BOOK
// ===============================

app.put("/api/books/:id", async (req, res) => {
  try {
    const { title, author, category, status } = req.body;

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        category,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBook) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("Error updating book:", error);

    res.status(500).json({
      message: "Failed to update book",
      error: error.message,
    });
  }
});

// ===============================
// DELETE BOOK
// ===============================

app.delete("/api/books/:id", async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book deleted successfully",
      book: deletedBook,
    });
  } catch (error) {
    console.error("Error deleting book:", error);

    res.status(500).json({
      message: "Failed to delete book",
      error: error.message,
    });
  }
});

// ===============================
// MONGODB CONNECTION
// ===============================

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not set in environment variables");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    // ===============================
    // START SERVER
    // ===============================

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });