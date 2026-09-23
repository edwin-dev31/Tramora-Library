import { useState, type SubmitEventHandler } from 'react';
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
  onSearch: (query: string) => void;
}

const FIELDS = [ALL_FIELDS, ...SEARCH_CATEGORIES];

const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState(ALL_FIELDS.keyword);

  const field = FIELDS.find((f) => f.keyword === keyword) ?? ALL_FIELDS;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const term = text.trim();
    if (!term) return;

    const query = field.keyword === 'all' ? term : `${field.keyword}:${term}`;
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Select
        value={keyword}
        onValueChange={setKeyword}
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
