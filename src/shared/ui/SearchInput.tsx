import { Search, X } from 'lucide-react'
import './SearchInput.css'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel: string
}

// Shared by the Quran and Duas list pages (and anywhere else a local filter
// is enough) — both search over data that's already fully loaded in memory,
// so this is a plain controlled input with no debounce or async lookup.
export function SearchInput({ value, onChange, placeholder, ariaLabel }: SearchInputProps) {
  return (
    <div className="search-input">
      <Search size={16} aria-hidden="true" className="search-input__icon" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="search-input__field"
      />
      {value && (
        <button
          type="button"
          className="search-input__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
