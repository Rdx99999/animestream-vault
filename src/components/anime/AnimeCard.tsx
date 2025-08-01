import { Anime } from '@/lib/api';
import { Star, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnimeCardProps {
  anime: Anime;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimeCard = ({ anime, size = 'md' }: AnimeCardProps) => {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'w-32 h-48',
    md: 'w-40 h-60',
    lg: 'w-48 h-72'
  };

  const handleClick = () => {
    navigate(`/anime/${anime.slug}`);
  };

  return (
    <div 
      onClick={handleClick}
      className={`anime-card cursor-pointer group ${sizeClasses[size]} flex-shrink-0`}
    >
      {/* Image Container */}
      <div className="relative w-full h-2/3 overflow-hidden rounded-t-2xl">
        <img
          src={anime.thumbnail}
          alt={anime.title.english}
          className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
          loading="lazy"
        />
        
        {/* Overlay with rating */}
        <div className="absolute top-2 right-2 glass px-2 py-1 rounded-lg flex items-center space-x-1">
          <Star className="w-3 h-3 text-anime-gold" fill="currentColor" />
          <span className="text-xs font-medium">{anime.rating.toFixed(1)}</span>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium glass ${
            anime.status === 'Ongoing' ? 'text-anime-green bg-anime-green/10' :
            anime.status === 'Completed' ? 'text-anime-blue bg-anime-blue/10' :
            'text-muted-foreground bg-muted/10'
          }`}>
            {anime.status}
          </span>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
      </div>

      {/* Content */}
      <div className="p-3 h-1/3 flex flex-col min-h-0">
        <div className="flex-1 overflow-hidden min-h-0">
          <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-smooth line-clamp-2 max-h-[2.1rem] overflow-hidden">
            {anime.title.english}
          </h3>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 flex-shrink-0 min-h-[1rem]">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium">
              {anime.releaseDate ? new Date(anime.releaseDate).getFullYear() : 'N/A'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium">{anime.type || 'TV'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};