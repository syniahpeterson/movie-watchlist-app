import { useState, useEffect } from "react";
import useMovies from "./hooks/useMovies";
import useMovieSearch from "./hooks/useMovieSearch";
import "./App.css";

// OMDB API key for searching movies
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

// Form to add a movie by title
const MovieInput = ({ addMovie }) => {
  const [newMovieTitle, setNewMovieTitle] = useState("");

  const handleSubmit = () => {
    if (newMovieTitle.trim() === "") return;
    addMovie(newMovieTitle);
    setNewMovieTitle("");
  };

  return (
    <div className="movie-input">
      <input
        className="input"
        type="text"
        name="new-movie"
        id="new-movie"
        placeholder="Enter Movie Title"
        value={newMovieTitle}
        onChange={(e) => setNewMovieTitle(e.target.value)}
      />
      <button className="btn primary" onClick={handleSubmit}>
        Add Movie
      </button>
    </div>
  );
};

// Search input (controlled) to query OMDB
const MovieSearch = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="movie-search">
      <input
        className="search-input"
        type="text"
        name="movie-search"
        id="movie-search"
        placeholder="Search movies..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

// Displays search results, and shows loading/error/no-results only
// after the user has entered a query.
const SearchResults = ({ results, addMovie, loading, error, searchQuery }) => {
  // Only show messages after the user has typed a search
  const hasQuery = searchQuery && searchQuery.trim() !== "";

  // Debounce visible loading message to avoid flicker
  const [showLoading, setShowLoading] = useState(false);
  useEffect(() => {
    let t;
    if (loading && hasQuery) {
      t = setTimeout(() => setShowLoading(true), 300);
    } else {
      setShowLoading(false);
    }
    return () => clearTimeout(t);
  }, [loading, hasQuery]);

  if (showLoading) return <p className="muted">Searching movies...</p>;
  if (error) return hasQuery ? <p className="muted">Error: {error}</p> : null;

  // Only show "No results" after the user has entered a query
  if (!results.length) {
    return hasQuery ? <p className="muted">No results found</p> : null;
  }

  return (
    <ul className="search-results">
      {results.map((movie, i) => (
        <SearchItem
          key={`${movie.imdbID}-${i}`}
          movie={movie}
          addMovie={addMovie}
        />
      ))}
    </ul>
  );
};

// Single search result row
const SearchItem = ({ movie, addMovie }) => {
  return (
    <li className="search-item">
      <div className="search-meta">
        <strong>{movie.Title}</strong>
        <span className="muted">({movie.Year})</span>
      </div>
      <button className="btn" onClick={() => addMovie(movie.Title)}>
        Add
      </button>
    </li>
  );
};

// List of saved movies
const MovieList = ({ movies, toggleMovie, deleteMovie, rateMovie }) => {
  return (
    <ul className="movie-list">
      {movies.map((movie) => (
        <MovieItem
          key={movie.id}
          movie={movie}
          toggleMovie={toggleMovie}
          deleteMovie={deleteMovie}
          rateMovie={rateMovie}
        />
      ))}
    </ul>
  );
};

// Row for a saved movie with actions (watch, rate, delete)
const MovieItem = ({ movie, toggleMovie, deleteMovie, rateMovie }) => {
  return (
    <li className={`movie-item ${movie.watched ? "watched" : ""}`}>
      <div className="movie-main">
        <span className="movie-title">{movie.title}</span>
        <div className="movie-actions">
          <button className="btn" onClick={() => toggleMovie(movie.id)}>
            {movie.watched ? "Unwatch" : "Watched"}
          </button>
          <select
            className="select"
            name={`rating-${movie.id}`}
            id={`rating-${movie.id}`}
            value={movie.rating ?? ""}
            onChange={(e) => rateMovie(movie.id, Number(e.target.value))}
          >
            <option value="">Rate</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <button className="btn danger" onClick={() => deleteMovie(movie.id)}>
            Delete
          </button>
        </div>
      </div>
    </li>
  );
};

// Buttons to filter the saved list
const FilterControls = ({ filter, setFilter }) => {
  return (
    <div className="filters">
      <button
        className={`btn filter ${filter === "all" ? "active" : ""}`}
        onClick={() => setFilter("all")}
      >
        All
      </button>
      <button
        className={`btn filter ${filter === "watched" ? "active" : ""}`}
        onClick={() => setFilter("watched")}
      >
        Watched
      </button>
      <button
        className={`btn filter ${filter === "unwatched" ? "active" : ""}`}
        onClick={() => setFilter("unwatched")}
      >
        Unwatched
      </button>
    </div>
  );
};

// Small stats panel summarizing the watchlist
const StatsContainer = ({ movies }) => {
  const totalMovies = movies.length;
  const watchedMovies = movies.filter((m) => m.watched).length;
  const unwatchedMovies = totalMovies - watchedMovies;

  const watchProgress =
    totalMovies === 0 ? 0 : ((watchedMovies / totalMovies) * 100).toFixed(1);

  return (
    <div className="stats">
      <h2 className="stats-title">Movie Stats</h2>
      <p>
        Total Movies: <strong>{totalMovies}</strong>
      </p>
      <p>
        Watched Movies: <strong>{watchedMovies}</strong>
      </p>
      <p>
        Unwatched Movies: <strong>{unwatchedMovies}</strong>
      </p>
      <p>
        Watch Progress: <strong>{watchProgress}%</strong>
      </p>
    </div>
  );
};

export default function App() {
  const { movies, addMovie, deleteMovie, toggleMovie, rateMovie } = useMovies();

  const { searchQuery, setSearchQuery, searchResults, loading, error } =
    useMovieSearch(API_KEY);

  const [filter, setFilter] = useState("all");

  const filteredMovies = movies.filter((m) => {
    if (filter === "watched") return m.watched;
    if (filter === "unwatched") return !m.watched;
    return true;
  });

  useEffect(() => {
    document.title = "Movie Watchlist";
  }, []);

  return (
    <div className="movie-app">
      <h1 className="app-title">Movie Watchlist</h1>

      <MovieInput addMovie={addMovie} />

      <MovieSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <SearchResults
        results={searchResults}
        addMovie={addMovie}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
      />

      <FilterControls filter={filter} setFilter={setFilter} />

      <MovieList
        movies={filteredMovies}
        toggleMovie={toggleMovie}
        deleteMovie={deleteMovie}
        rateMovie={rateMovie}
      />

      <StatsContainer movies={movies} />
    </div>
  );
}
