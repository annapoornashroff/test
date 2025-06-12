'use client';

import { Filter } from 'lucide-react';

interface RatingFilterProps {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}

export function RatingFilter({ value, onChange, className = '' }: RatingFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value === '' ? null : Number(e.target.value);
    onChange(newValue);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Filter className="text-gray-400 w-5 h-5" />
      <select
        value={value === null ? '' : value.toString()}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg px-4 py-2"
      >
        <option value="">All Ratings</option>
        {[5, 4, 3, 2, 1].map(rating => (
          <option key={rating} value={rating}>
            {rating} Stars
          </option>
        ))}
      </select>
    </div>
  );
} 