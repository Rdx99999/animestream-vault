import { useQuery } from '@tanstack/react-query';
import { animeAPI } from '@/lib/api';
import { Loader2, Search } from 'lucide-react';

interface SearchSuggestionsProps {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
}

export const SearchSuggestions = ({ query, onSuggestionClick }: SearchSuggestionsProps) => {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => animeAPI.getSuggestions(query),
    enabled: query.length >= 2,
    staleTime: 300000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 glass-card rounded-lg p-4 z-50">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Searching...</span>
        </div>
      </div>
    );
  }

  if (!suggestions?.data || suggestions.data.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 glass-card rounded-lg overflow-hidden z-50 max-h-64 overflow-y-auto">
      {suggestions.data.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-smooth flex items-center space-x-3"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{suggestion}</span>
        </button>
      ))}
    </div>
  );
};