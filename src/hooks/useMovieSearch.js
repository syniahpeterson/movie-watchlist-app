import { useState, useEffect } from "react";

// Hook to search OMDB and expose a debounced `searchQuery`
export default function useMovieSearch(apiKey) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce the user input to avoid firing requests on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch movies when the debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${apiKey}&s=${debouncedQuery}`,
        );

        const data = await res.json();

        if (data.Response !== "True") {
          setSearchResults([]);
          setError(data.Error);
        } else {
          setSearchResults(data.Search);
        }
      } catch (err) {
        setError("Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [debouncedQuery]);

  return { searchQuery, setSearchQuery, searchResults, loading, error };
}
