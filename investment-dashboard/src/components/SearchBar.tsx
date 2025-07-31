// src/components/SearchBar.tsx
import React from 'react';
import './SearchBar.css';

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
};

export default function SearchBar({ query, onQueryChange }: Props) {
  return (
    <input
      className="search-input"
      type="text"
      placeholder="Search stocks..."
      value={query}
      onChange={e => onQueryChange(e.target.value)}
    />
  );
}
