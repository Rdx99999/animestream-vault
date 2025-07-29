import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { animeAPI } from '@/lib/api';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Grid, List, Loader2, ChevronDown } from 'lucide-react';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

const STATUSES = ['Ongoing', 'Completed', 'Hiatus', 'Upcoming'];
const TYPES = ['TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music'];

export const BrowsePage = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [sortOrder, setSortOrder] = useState<number>(-1);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const itemsPerPage = 24;

  const { data: animeData, isLoading } = useQuery({
    queryKey: ['browse-anime', selectedGenres, selectedStatus, selectedType, sortBy, sortOrder, currentPage],
    queryFn: () => animeAPI.getFiltered({
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      status: selectedStatus || undefined,
      type: selectedType || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      limit: itemsPerPage,
      skip: currentPage * itemsPerPage,
    }),
    staleTime: 300000,
  });

  const anime = animeData?.data || [];

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedStatus('');
    setSelectedType('');
    setSortBy('rating');
    setSortOrder(-1);
    setCurrentPage(0);
  };

  const hasFilters = selectedGenres.length > 0 || selectedStatus || selectedType;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Anime</h1>
            <p className="text-muted-foreground">
              Discover anime by genre, status, and more
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </CardTitle>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Genres */}
                <div>
                  <h3 className="font-semibold mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((genre) => (
                      <Button
                        key={genre}
                        variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleGenre(genre)}
                        className="text-xs"
                      >
                        {genre}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="font-semibold mb-3">Status</h3>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div>
                  <h3 className="font-semibold mb-3">Type</h3>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      {TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="font-semibold mb-3">Sort By</h3>
                  <div className="space-y-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="releaseDate">Release Date</SelectItem>
                        <SelectItem value="title.english">Title</SelectItem>
                        <SelectItem value="createdAt">Added Date</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortOrder.toString()} onValueChange={(value) => setSortOrder(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">Descending</SelectItem>
                        <SelectItem value="1">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Filters */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2">
                {selectedGenres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre} ×
                  </Badge>
                ))}
                {selectedStatus && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSelectedStatus('')}
                  >
                    {selectedStatus} ×
                  </Badge>
                )}
                {selectedType && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSelectedType('')}
                  >
                    {selectedType} ×
                  </Badge>
                )}
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-lg">Loading anime...</span>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && anime.length > 0 && (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5' 
                    : 'grid-cols-1'
                }`}>
                  {anime.map((item) => (
                    <AnimeCard 
                      key={item.id} 
                      anime={item} 
                      size={viewMode === 'grid' ? 'md' : 'lg'} 
                    />
                  ))}
                </div>

                {/* Load More */}
                {anime.length === itemsPerPage && (
                  <div className="text-center">
                    <Button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="glow-hover"
                    >
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {!isLoading && anime.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <h3 className="text-xl font-semibold">No anime found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters to see more results
                </p>
                {hasFilters && (
                  <Button onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};