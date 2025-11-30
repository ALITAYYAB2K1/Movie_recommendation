import React, { useState, useEffect } from "react";
import {
  Search,
  Film,
  Star,
  Sparkles,
  Tv,
  ArrowRight,
  ImageOff,
  AlertTriangle,
} from "lucide-react";

// API Key from your python script
const TMDB_API_KEY = "8265bd1679663a7ea12ac168da84d2e8";

export default function App() {
  const [movieData, setMovieData] = useState({});
  const [search, setSearch] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null); // New error state

  // Load the local JSON model
  useEffect(() => {
    // UPDATED: Fetching the correct filename 'movie_recs_campusx.json'
    fetch("/movie_recs_campusx.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`File not found (Status: ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setMovieData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading model:", err);
        setError(
          "Could not load 'movie_recs_campusx.json'. Please ensure the file is in your 'public' folder."
        );
        setLoading(false);
      });
  }, []);

  // Helper function to fetch poster from TMDB
  const fetchPoster = async (movieTitle) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          movieTitle
        )}`
      );
      const data = await response.json();
      const result = data.results?.[0];

      if (result && result.poster_path) {
        return `https://image.tmdb.org/t/p/w500${result.poster_path}`;
      }
      return null;
    } catch (error) {
      console.error("Error fetching poster for:", movieTitle, error);
      return null;
    }
  };

  // Handle Search & Autocomplete
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.length > 1) {
      const matches = Object.keys(movieData)
        .filter((title) => title.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8); // Show top 8 suggestions
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  // Handle Movie Selection
  const handleSelectMovie = async (movieName) => {
    setSearch("");
    setSuggestions([]);
    setSelectedMovie(movieName);
    setLoadingRecs(true);

    const recTitles = movieData[movieName] || [];

    // Fetch all posters in parallel
    const recsWithPosters = await Promise.all(
      recTitles.map(async (title) => {
        const posterUrl = await fetchPoster(title);
        return { title, posterUrl };
      })
    );

    setRecommendations(recsWithPosters);
    setLoadingRecs(false);
  };

  // Generate consistent gradients (Fallback if no image)
  const getGradient = (title) => {
    const gradients = [
      "from-violet-600 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-rose-500 to-red-600",
      "from-amber-500 to-orange-600",
      "from-blue-500 to-cyan-500",
      "from-fuchsia-600 to-pink-600",
    ];
    const index = title.length % gradients.length;
    return gradients[index];
  };

  // Loading State
  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">Loading AI Model...</p>
        </div>
      </div>
    );

  // Error State (Visual Feedback)
  if (error)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-6">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">System Error</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <div className="text-sm text-slate-500 bg-black/50 p-4 rounded-lg font-mono">
            public/movie_recs_campusx.json
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
      {/* Decorative Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => {
              setSelectedMovie(null);
              setRecommendations([]);
            }}
          >
            <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Cine
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Match
              </span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-400">
            <span className="hover:text-white transition-colors cursor-pointer">
              Model: Content-Based
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Dataset: TMDB 5000
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Search Hero Section */}
        <div
          className={`transition-all duration-700 ease-in-out ${
            selectedMovie ? "translate-y-0 opacity-100" : "translate-y-[10vh]"
          }`}
        >
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 relative">
            {/* Conditional Header */}
            {!selectedMovie && (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
                  <Sparkles className="w-3 h-3" /> AI Powered Recommendation
                  Engine
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                  Discover your next
                  <br />
                  obsession.
                </h1>
                <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto">
                  Type a movie you love, and our algorithm will analyze 5,000+
                  films to find your perfect match.
                </p>
              </>
            )}

            {/* Search Input Container */}
            <div className="w-full relative group z-30">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/5 border border-white/10 text-lg placeholder:text-slate-500 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-2xl"
                placeholder="Search for a movie (e.g., Inception)..."
                value={search}
                onChange={handleSearchChange}
              />

              {/* Autocomplete Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {suggestions.map((movie, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectMovie(movie)}
                      className="px-5 py-4 hover:bg-white/5 cursor-pointer flex items-center justify-between group/item border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                          {movie.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-slate-200 group-hover/item:text-white transition-colors">
                          {movie}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover/item:text-blue-400 -translate-x-2 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {selectedMovie && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-white/10 pb-6">
              <div>
                <div className="text-sm text-slate-400 mb-1">Results for</div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  {selectedMovie}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedMovie(null);
                  setRecommendations([]);
                }}
                className="text-sm text-slate-400 hover:text-white hover:underline underline-offset-4"
              >
                Clear Results
              </button>
            </div>

            {loadingRecs ? (
              // Loading Skeleton
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse"
                  ></div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {recommendations.map((movieObj, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectMovie(movieObj.title)}
                    className="group relative bg-[#121212] rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-2 cursor-pointer"
                  >
                    {/* Poster Image or Gradient Fallback */}
                    <div className="aspect-[2/3] w-full relative overflow-hidden">
                      {movieObj.posterUrl ? (
                        <img
                          src={movieObj.posterUrl}
                          alt={movieObj.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${getGradient(
                            movieObj.title
                          )} flex items-center justify-center`}
                        >
                          <ImageOff className="w-10 h-10 text-white/20" />
                        </div>
                      )}

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                      {/* Icon Overlay */}
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Tv className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Content (Positioned over the image bottom) */}
                    <div className="absolute bottom-0 left-0 w-full p-4">
                      <h3 className="text-base font-bold text-white leading-tight drop-shadow-md group-hover:text-blue-400 transition-colors">
                        {movieObj.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-300 uppercase tracking-wider mt-2">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        Match
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white/5 rounded-3xl border border-white/5 border-dashed">
                <p className="text-slate-400 text-lg">
                  No specific recommendations found for this title.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State / Suggestions Tags */}
        {!selectedMovie && (
          <div className="flex flex-wrap justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
            {[
              "The Dark Knight",
              "Inception",
              "Interstellar",
              "Pulp Fiction",
              "The Matrix",
            ].map((tag, i) => (
              <button
                key={i}
                onClick={() => handleSelectMovie(tag)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-sm text-slate-400 hover:text-white transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
