import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { animeAPI } from '@/lib/api';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Loader2, Star } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [minScore, setMinScore] = useState(15);
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', debouncedQuery, useAdvanced, minScore],
    queryFn: () => {
      if (!debouncedQuery.trim()) return Promise.resolve({ data: [] });
      
      if (useAdvanced) {
        return animeAPI.searchAdvanced(debouncedQuery, {
          limit: 50,
          min_score: minScore,
          fuzzy: true,
        });
      } else {
        return animeAPI.search(debouncedQuery, 50);
      }
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 300000,
  });

  const results = searchResults?.data || [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search anime, genres, or characters..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 text-lg h-12 glass border-border/50 focus:border-primary/50"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setUseAdvanced(!useAdvanced)}
              className={`glass ${useAdvanced ? 'bg-primary/20 border-primary/50' : ''}`}
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Advanced Search Controls */}
          {useAdvanced && (
            <div className="glass-card p-4 rounded-lg space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Advanced Search Settings</span>
              </h3>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Minimum Relevance Score:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="accent-primary"
                  />
                  <Badge variant="outline">{minScore}%</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Higher scores = more precise matches. Lower scores = broader results.
              </p>
            </div>
          )}

          {/* Search Info */}
          {debouncedQuery && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Search Results</h1>
                <p className="text-muted-foreground">
                  {isLoading ? 'Searching...' : `Found ${results.length} results for "${debouncedQuery}"`}
                  {useAdvanced && !isLoading && (
                    <span className="ml-2">
                      <Badge variant="secondary" className="text-xs">
                        Advanced Search
                      </Badge>
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-lg">Searching anime...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">Error searching anime</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && debouncedQuery && results.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <h3 className="text-xl font-semibold">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or using different keywords
              </p>
              {useAdvanced && (
                <p className="text-sm text-muted-foreground">
                  Try lowering the minimum relevance score for broader results
                </p>
              )}
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {results.map((anime) => (
                <div key={anime.id} className="relative">
                  <AnimeCard anime={anime} size="md" />
                  {useAdvanced && 'relevanceScore' in anime && anime.relevanceScore && (
                    <div className="absolute top-2 left-2 glass px-2 py-1 rounded-lg">
                      <span className="text-xs font-medium">
                        {Math.round(anime.relevanceScore)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Search Tips */}
          {!debouncedQuery && (
            <div className="text-center py-12 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Search Anime</h2>
                <p className="text-muted-foreground mb-6">
                  Discover your next favorite anime from our vast collection
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="glass-card p-6 text-center">
                  <Search className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Search by Title</h3>
                  <p className="text-sm text-muted-foreground">
                    Find anime by English or Japanese titles
                  </p>
                </div>
                
                <div className="glass-card p-6 text-center">
                  <Filter className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Advanced Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Use relevance scoring for precise results
                  </p>
                </div>
                
                <div className="glass-card p-6 text-center">
                  <Star className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Smart Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Typo-tolerant search with genre matching
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};