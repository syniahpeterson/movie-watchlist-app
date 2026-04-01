import { useState, useEffect } from "react";

// Hook managing the user's local movie watchlist (persisted to localStorage)
export default function useMovies() {
  // Initialize from localStorage with defensive parsing
  const [movies, setMovies] = useState(() => {
    const saved = localStorage.getItem("movies");
    if (!saved || saved === "undefined") return [];

    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem("movies");
      return [];
    }
  });

  // Persist movies whenever the list changes
  useEffect(() => {
    localStorage.setItem("movies", JSON.stringify(movies));
  }, [movies]);

  // Add a movie unless it already exists
  const addMovie = (title) => {
    setMovies((prev) => {
      if (prev.some((m) => m.title === title)) return prev;

      return [
        ...prev,
        {
          id: Date.now(),
          title,
          watched: false,
          rating: null,
        },
      ];
    });
  };

  // Toggle watched state
  const toggleMovie = (id) => {
    setMovies((prev) =>
      prev.map((m) => (m.id === id ? { ...m, watched: !m.watched } : m)),
    );
  };

  // Remove a movie
  const deleteMovie = (id) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  // Set numeric rating for a movie
  const rateMovie = (id, rating) => {
    setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, rating } : m)));
  };

  return { movies, addMovie, deleteMovie, toggleMovie, rateMovie };
}
