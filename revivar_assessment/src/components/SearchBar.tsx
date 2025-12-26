import { useState, useEffect, useCallback } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <div className="flex gap-2 w-full max-w-md">
      <Input
        type="text"
        placeholder="Search for images..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
      />
      {query && (
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={isLoading}
        >
          Clear
        </Button>
      )}
    </div>
  );
};