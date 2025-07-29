import { useQuery } from '@tanstack/react-query';
import { animeAPI } from '@/lib/api';
import { HeroSection } from '@/components/home/HeroSection';
import { AnimeSlider } from '@/components/anime/AnimeSlider';
import { Loader2 } from 'lucide-react';

export const HomePage = () => {
  // Fetch different categories of anime
  const { data: trendingAnime, isLoading: loadingTrending } = useQuery({
    queryKey: ['trending-anime'],
    queryFn: () => animeAPI.getTrending(20),
    staleTime: 300000,
  });

  const { data: actionAnime, isLoading: loadingAction } = useQuery({
    queryKey: ['action-anime'],
    queryFn: () => animeAPI.getFiltered({ genres: ['Action'], limit: 20 }),
    staleTime: 300000,
  });

  const { data: recentAnime, isLoading: loadingRecent } = useQuery({
    queryKey: ['recent-anime'],
    queryFn: () => animeAPI.getFiltered({ 
      sort_by: 'releaseDate', 
      sort_order: -1, 
      limit: 20 
    }),
    staleTime: 300000,
  });

  const { data: popularAnime, isLoading: loadingPopular } = useQuery({
    queryKey: ['popular-anime'],
    queryFn: () => animeAPI.getFiltered({ 
      sort_by: 'rating', 
      sort_order: -1, 
      limit: 20 
    }),
    staleTime: 300000,
  });

  const { data: romanceAnime, isLoading: loadingRomance } = useQuery({
    queryKey: ['romance-anime'],
    queryFn: () => animeAPI.getFiltered({ genres: ['Romance'], limit: 20 }),
    staleTime: 300000,
  });

  const { data: comedyAnime, isLoading: loadingComedy } = useQuery({
    queryKey: ['comedy-anime'],
    queryFn: () => animeAPI.getFiltered({ genres: ['Comedy'], limit: 20 }),
    staleTime: 300000,
  });

  const isLoading = loadingTrending || loadingAction || loadingRecent || loadingPopular;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-lg">Loading amazing anime...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <HeroSection />

      {/* Content Sections */}
      <div className="space-y-12">
        {/* Trending */}
        {trendingAnime?.data && (
          <AnimeSlider
            title="🔥 Trending Now"
            anime={trendingAnime.data}
            size="lg"
          />
        )}

        {/* Popular */}
        {popularAnime?.data && (
          <AnimeSlider
            title="⭐ Most Popular"
            anime={popularAnime.data}
            size="md"
          />
        )}

        {/* Recent Releases */}
        {recentAnime?.data && (
          <AnimeSlider
            title="🆕 Recent Releases"
            anime={recentAnime.data}
            size="md"
          />
        )}

        {/* Action */}
        {actionAnime?.data && (
          <AnimeSlider
            title="⚔️ Action & Adventure"
            anime={actionAnime.data}
            size="md"
          />
        )}

        {/* Romance */}
        {romanceAnime?.data && (
          <AnimeSlider
            title="💖 Romance"
            anime={romanceAnime.data}
            size="md"
          />
        )}

        {/* Comedy */}
        {comedyAnime?.data && (
          <AnimeSlider
            title="😄 Comedy"
            anime={comedyAnime.data}
            size="md"
          />
        )}
      </div>
    </div>
  );
};