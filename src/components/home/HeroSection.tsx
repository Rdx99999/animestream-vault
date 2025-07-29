import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { animeAPI } from '@/lib/api';
import { Play, Info, Star, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: trendingAnime } = useQuery({
    queryKey: ['trending-anime', 5],
    queryFn: () => animeAPI.getTrending(5),
    staleTime: 300000,
  });

  const featuredAnime = trendingAnime?.data || [];
  const currentAnime = featuredAnime[currentIndex];

  // Auto-rotate featured anime
  useEffect(() => {
    if (featuredAnime.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredAnime.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [featuredAnime.length]);

  if (!currentAnime) {
    return (
      <div className="relative h-[70vh] bg-gradient-to-r from-muted/20 to-muted/10 animate-pulse" />
    );
  }

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentAnime.coverImage || currentAnime.thumbnail}
          alt={currentAnime.title.english}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold">
                {currentAnime.title.english}
              </h1>
              {currentAnime.title.japanese && (
                <p className="text-lg md:text-xl text-muted-foreground jp-text">
                  {currentAnime.title.japanese}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-anime-gold" fill="currentColor" />
                <span className="font-medium">{currentAnime.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(currentAnime.releaseDate).getFullYear()}</span>
              </div>
              <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                {currentAnime.status}
              </span>
              <span className="px-2 py-1 bg-muted/20 rounded-full text-xs">
                {currentAnime.type}
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {currentAnime.genres.slice(0, 4).map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 glass rounded-full text-xs font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm md:text-base line-clamp-3 max-w-xl">
              {currentAnime.description}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-gradient-primary glow-hover"
                onClick={() => {
                  // Navigate to first episode of first season
                  if (currentAnime.seasons[0]) {
                    navigate(`/watch/${currentAnime.slug}/season-${currentAnime.seasons[0].seasonNumber}/episode-1`);
                  }
                }}
              >
                <Play className="w-5 h-5 mr-2" fill="currentColor" />
                Watch Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="glass border-border/50 glow-hover"
                onClick={() => navigate(`/anime/${currentAnime.slug}`)}
              >
                <Info className="w-5 h-5 mr-2" />
                More Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      {featuredAnime.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {featuredAnime.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-smooth ${
                index === currentIndex ? 'bg-primary' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};