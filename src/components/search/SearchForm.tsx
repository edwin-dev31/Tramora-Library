import { useState, type SubmitEventHandler } from 'react';
import type { SearchField, SearchOptions } from '@/types/books';
import { ALL_FIELDS, SEARCH_CATEGORIES } from './searchCategories';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFormProps {
  onSearch: (options: SearchOptions) => void;
}

const FIELDS = [ALL_FIELDS, ...SEARCH_CATEGORIES];

const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState<SearchField>(ALL_FIELDS.keyword);

  const field = FIELDS.find((f) => f.keyword === keyword) ?? ALL_FIELDS;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const term = text.trim();
    if (!term) return;

    onSearch({ query: term, field: field.keyword });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Select
        value={keyword}
        onValueChange={(value) => setKeyword(value as SearchField)}
      >
        <SelectTrigger aria-label="Search field">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FIELDS.map((f) => (
            <SelectItem key={f.keyword} value={f.keyword}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="text"
        value={text}
        placeholder={field.placeholder}
        onChange={(e) => setText(e.target.value)}
      />

      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  );
};

export default SearchForm;
