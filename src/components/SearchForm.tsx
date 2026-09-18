import { useState, type SubmitEventHandler } from 'react';
import { ALL_FIELDS, SEARCH_CATEGORIES } from '@/types/searchCategories';

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

    const query = field.keyword ? `${field.keyword}:${term}` : term;
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        aria-label="Search field"
      >
        {FIELDS.map((f) => (
          <option key={f.keyword || 'all'} value={f.keyword}>
            {f.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={text}
        placeholder={field.placeholder}
        onChange={(e) => setText(e.target.value)}
      />

      <button type="submit">Search</button>
    </form>
  );
};

export default SearchForm;