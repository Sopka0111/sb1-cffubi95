import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Calendar, ChevronDown, History, Clock, MapPin, Bus, School, User, Settings2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

interface SearchBarProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  isFilterOpen: boolean;
  onFilterToggle: () => void;
}

const filterCategories = [
  {
    name: 'Match Category',
    options: ['A', 'B', 'C', 'D', 'E'],
    icon: MapPin,
    description: 'Filter by route category'
  },
  {
    name: 'Garage',
    options: ['North Garage', 'South Garage', 'East Garage', 'West Garage'],
    icon: Bus,
    description: 'Filter by garage location'
  },
  {
    name: 'School',
    options: ['Elementary', 'Middle School', 'High School', 'Special Ed Center'],
    icon: School,
    description: 'Filter by school type'
  },
  {
    name: 'Vehicle Type',
    options: ['Regular Bus', 'Special Ed Bus', 'Mini Bus', 'Van'],
    icon: Bus,
    description: 'Filter by vehicle type'
  },
  {
    name: 'AM vs PM',
    options: ['AM Routes', 'PM Routes', 'Mid-Day Routes'],
    icon: Clock,
    description: 'Filter by time of day'
  },
  {
    name: 'SPED/GenEd',
    options: ['Special Education', 'General Education'],
    icon: User,
    description: 'Filter by education type'
  }
];

const recentSearches = [
  { text: 'Route 123', type: 'route' },
  { text: 'John Smith', type: 'driver' },
  { text: 'Delayed Routes', type: 'status' },
  { text: 'GPS Issues', type: 'issue' }
];

export default function SearchBar({
  timeRange,
  onTimeRangeChange,
  isFilterOpen,
  onFilterToggle
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    inputRef.current?.focus();
  };

  const handleFilterSelect = (category: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category] 
        ? prev[category].includes(value)
          ? prev[category].filter(v => v !== value)
          : [...prev[category], value]
        : [value]
    }));
  };

  const getSelectedFilterCount = () => {
    return Object.values(selectedFilters).reduce((count, values) => count + values.length, 0);
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setExpandedCategory(null);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div 
        className={`flex items-center h-9 bg-white border rounded-lg transition-all ${
          isSearchFocused 
            ? 'border-purple-500 ring-2 ring-purple-100' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={handleSearchFocus}
      >
        {/* Search Input */}
        <div className="flex items-center flex-1 px-3">
          <Search className="text-gray-400 flex-shrink-0" size={16} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search routes, drivers, or issues..."
            className="flex-1 px-3 py-2 text-sm border-none focus:ring-0 bg-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-2 border-l border-gray-200">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900"
              >
                <Filter size={12} />
                <span>Filters</span>
                {getSelectedFilterCount() > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded-full">
                    {getSelectedFilterCount()}
                  </span>
                )}
                <ChevronDown size={10} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                  {getSelectedFilterCount() > 0 && (
                    <button 
                      onClick={clearFilters}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="py-2 max-h-[400px] overflow-y-auto">
                {filterCategories.map((category) => (
                  <div key={category.name} className="px-3">
                    <button
                      onClick={() => setExpandedCategory(
                        expandedCategory === category.name ? null : category.name
                      )}
                      className="w-full flex items-center justify-between py-2 text-sm hover:bg-gray-50 rounded transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <category.icon size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-700">{category.name}</span>
                        {selectedFilters[category.name]?.length > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded-full">
                            {selectedFilters[category.name].length}
                          </span>
                        )}
                      </div>
                      <ChevronDown 
                        size={14} 
                        className={`text-gray-400 transition-transform ${
                          expandedCategory === category.name ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>

                    {expandedCategory === category.name && (
                      <div className="mt-1 mb-3 pl-6">
                        <p className="text-xs text-gray-500 mb-2">{category.description}</p>
                        <div className="grid grid-cols-2 gap-1">
                          {category.options.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleFilterSelect(category.name, option)}
                              className={`px-2 py-1.5 text-xs font-medium rounded-lg text-left ${
                                selectedFilters[category.name]?.includes(option)
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Range */}
        <div className="px-2 border-l border-gray-200">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-[10px] font-medium text-gray-700 hover:text-gray-900">
                <Calendar size={12} />
                <span>{timeRange}</span>
                <ChevronDown size={10} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="p-2 space-y-1">
                {['1D', '1W', '1M', '3M', 'YTD'].map((range) => (
                  <button
                    key={range}
                    onClick={() => onTimeRangeChange(range)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded ${
                      timeRange === range
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {range}
                    {timeRange === range && (
                      <div className="w-2 h-2 rounded-full bg-purple-600" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {isSearchFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {searchQuery ? (
            <div className="p-2">
              <div className="p-2 text-sm text-gray-500">
                Press enter to search for "{searchQuery}"
              </div>
            </div>
          ) : (
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">
                Recent Searches
              </div>
              <div className="mt-1 space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    className="w-full px-2 py-1.5 text-sm text-left text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2"
                    onClick={() => setSearchQuery(search.text)}
                  >
                    <History size={14} className="text-gray-400" />
                    {search.text}
                    <span className="ml-auto text-xs text-gray-400 capitalize">{search.type}</span>
                  </button>
                ))}
              </div>
              <div className="p-2 bg-gray-50 border-t border-gray-200 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded flex items-center justify-center gap-1.5">
                    <Settings2 size={12} />
                    Advanced Search
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded flex items-center justify-center gap-1.5">
                    <History size={12} />
                    Search History
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}