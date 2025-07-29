import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { animeAPI, episodeAPI } from '@/lib/api';
import { Play, Star, Calendar, Clock, Users, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const AnimeDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: animeData, isLoading: animeLoading, error: animeError } = useQuery({
    queryKey: ['anime', slug],
    queryFn: () => animeAPI.getBySlug(slug!),
    enabled: !!slug,
    staleTime: 300000,
  });

  const anime = animeData?.data;

  // Get episodes for the first season
  const { data: episodesData, isLoading: episodesLoading } = useQuery({
    queryKey: ['episodes', anime?.id, 1],
    queryFn: () => episodeAPI.getBySeason(anime!.id, 1),
    enabled: !!anime?.id,
    staleTime: 300000,
  });

  const episodes = episodesData?.data || [];

  if (animeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-lg">Loading anime details...</span>
        </div>
      </div>
    );
  }

  if (animeError || !anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Anime not found</h1>
          <Button onClick={() => navigate('/')}>
            Go back home
          </Button>
        </div>
      </div>
    );
  }

  const handleWatchNow = () => {
    if (episodes.length > 0) {
      navigate(`/watch/${anime.slug}/season-1/episode-1`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={anime.coverImage || anime.thumbnail}
            alt={anime.title.english}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 md:px-6 pb-12">
            <div className="max-w-4xl">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Poster */}
                <div className="flex-shrink-0">
                  <img
                    src={anime.thumbnail}
                    alt={anime.title.english}
                    className="w-48 h-72 object-cover rounded-xl glass-card"
                  />
                </div>

                {/* Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-2">
                      {anime.title.english}
                    </h1>
                    {anime.title.japanese && (
                      <p className="text-lg text-muted-foreground">
                        {anime.title.japanese}
                      </p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-anime-gold" fill="currentColor" />
                      <span className="font-bold text-lg">{anime.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(anime.releaseDate).getFullYear()}</span>
                    </div>
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {anime.status}
                    </Badge>
                    <Badge variant="outline">
                      {anime.type}
                    </Badge>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <Badge key={genre} variant="outline" className="glass">
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      size="lg" 
                      className="bg-gradient-primary glow-hover"
                      onClick={handleWatchNow}
                      disabled={episodes.length === 0}
                    >
                      <Play className="w-5 h-5 mr-2" fill="currentColor" />
                      Watch Now
                    </Button>
                    <Button variant="outline" size="lg" className="glass">
                      <Info className="w-5 h-5 mr-2" />
                      Add to List
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Description */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Synopsis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {anime.description}
                </p>
              </CardContent>
            </Card>

            {/* Seasons */}
            {anime.seasons.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Seasons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {anime.seasons.map((season) => (
                      <div key={season.id} className="glass p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">{season.title}</h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Season {season.seasonNumber}</span>
                          <span>{season.totalEpisodes} episodes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="episodes" className="space-y-4">
            {episodesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : episodes.length > 0 ? (
              <div className="grid gap-4">
                {episodes.map((episode) => (
                  <Card 
                    key={episode.id} 
                    className="glass-card hover:glass glow-hover cursor-pointer"
                    onClick={() => navigate(`/watch/${anime.slug}/season-${episode.seasonNumber}/episode-${episode.episodeNumber}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={episode.thumbnail}
                          alt={episode.title}
                          className="w-32 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold">
                              Episode {episode.episodeNumber}: {episode.title}
                            </h3>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{Math.floor(episode.durationSeconds / 60)}m</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {episode.description}
                          </p>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{episode.viewCount.toLocaleString()} views</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No episodes available yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{anime.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{anime.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Release Date:</span>
                    <span>{new Date(anime.releaseDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-anime-gold" fill="currentColor" />
                      <span>{anime.rating}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {anime.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};