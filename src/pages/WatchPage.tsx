import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { animeAPI, episodeAPI } from '@/lib/api';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Eye, Calendar } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const WatchPage = () => {
  const { slug, seasonEpisode } = useParams<{ slug: string; seasonEpisode: string }>();
  const navigate = useNavigate();

  // Parse season and episode from URL
  const parseSeasonEpisode = (seasonEpisode: string) => {
    const match = seasonEpisode?.match(/season-(\d+)\/episode-(\d+)/);
    if (match) {
      return {
        seasonNumber: parseInt(match[1]),
        episodeNumber: parseInt(match[2]),
      };
    }
    return null;
  };

  const params = parseSeasonEpisode(seasonEpisode || '');
  
  if (!params) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Invalid episode URL</h1>
          <Button onClick={() => navigate('/')}>Go back home</Button>
        </div>
      </div>
    );
  }

  const { seasonNumber, episodeNumber } = params;

  // Get anime details
  const { data: animeData, isLoading: animeLoading } = useQuery({
    queryKey: ['anime', slug],
    queryFn: () => animeAPI.getBySlug(slug!),
    enabled: !!slug,
  });

  const anime = animeData?.data;

  // Get all episodes for the season
  const { data: episodesData, isLoading: episodesLoading } = useQuery({
    queryKey: ['episodes', anime?.id, seasonNumber],
    queryFn: () => episodeAPI.getBySeason(anime!.id, seasonNumber),
    enabled: !!anime?.id,
  });

  const episodes = episodesData?.data || [];
  const currentEpisode = episodes.find(ep => ep.episodeNumber === episodeNumber);
  const currentIndex = episodes.findIndex(ep => ep.episodeNumber === episodeNumber);

  // Navigation helpers
  const hasNext = currentIndex < episodes.length - 1;
  const hasPrevious = currentIndex > 0;

  const goToEpisode = (episodeNum: number) => {
    navigate(`/watch/${slug}/season-${seasonNumber}/episode-${episodeNum}`);
  };

  const handleNext = () => {
    if (hasNext) {
      goToEpisode(episodes[currentIndex + 1].episodeNumber);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      goToEpisode(episodes[currentIndex - 1].episodeNumber);
    }
  };

  if (animeLoading || episodesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-lg">Loading episode...</span>
        </div>
      </div>
    );
  }

  if (!anime || !currentEpisode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Episode not found</h1>
          <Button onClick={() => navigate(`/anime/${slug}`)}>
            Back to anime details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 z-40 glass border-b border-border/50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/anime/${slug}`)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-semibold">{anime.title.english}</h1>
              <p className="text-sm text-muted-foreground">
                Season {seasonNumber}, Episode {episodeNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={!hasNext}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3 space-y-6">
            <VideoPlayer
              episode={currentEpisode}
              onNext={hasNext ? handleNext : undefined}
              onPrevious={hasPrevious ? handlePrevious : undefined}
            />

            {/* Episode Info */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Episode {currentEpisode.episodeNumber}: {currentEpisode.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{Math.floor(currentEpisode.durationSeconds / 60)}m</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{currentEpisode.viewCount.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(currentEpisode.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {currentEpisode.episodeType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {currentEpisode.description}
                </p>

                {/* Video metadata */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {currentEpisode.availableQualities.map((quality) => (
                    <Badge key={quality} variant="outline" className="text-xs">
                      {quality}
                    </Badge>
                  ))}
                  {currentEpisode.availableAudios.map((audio) => (
                    <Badge key={audio} variant="outline" className="text-xs">
                      🔊 {audio}
                    </Badge>
                  ))}
                  {currentEpisode.availableSubtitles.map((subtitle) => (
                    <Badge key={subtitle} variant="outline" className="text-xs">
                      💬 {subtitle}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Episode List */}
          <div className="lg:col-span-1">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  Season {seasonNumber} Episodes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {episodes.map((episode) => (
                    <button
                      key={episode.id}
                      onClick={() => goToEpisode(episode.episodeNumber)}
                      className={`w-full p-3 text-left hover:bg-primary/10 transition-smooth border-b border-border/50 last:border-b-0 ${
                        episode.id === currentEpisode.id ? 'bg-primary/20' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={episode.thumbnail}
                          alt={episode.title}
                          className="w-16 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">
                            {episode.episodeNumber}. {episode.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.floor(episode.durationSeconds / 60)}m
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};