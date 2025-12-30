import React, { useState, useEffect, useRef } from 'react';
import Input from '../form/input/InputField';

interface AutocompleteProps {
  data: string[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (selectedItem: string) => void; // called when selecting an existing item
  onNoMatchClick?: (value: string) => void; // called when clicking "Add +", passes current input value
  onInput?: (value: string) => void;
  isLoading?: boolean | string;
  customInputClass?: string;
}

const AutocompleteSelect: React.FC<AutocompleteProps> = ({
  data,
  value,
  onChange,
  onSelect,
  onNoMatchClick,
  onInput,
  isLoading = false,
  customInputClass,
}) => {
  const [filteredData, setFilteredData] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const defaultClass =
    "bg-gray-50 border w-full border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
  const inputClass = customInputClass ?? defaultClass;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (typeof onInput === 'function') {
      onInput(inputValue);
    }

    if (inputValue.trim() === '') {
      setFilteredData([]);
      setIsOpen(false);
    } else {
      const filtered = data.filter((item) =>
        item.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredData(filtered);
      setIsOpen(true);
    }
  };

  const handleItemClick = (item: string) => {
    setIsOpen(false);
    onChange(item);
    onSelect(item);
  };

  // Check if current input exactly matches any item (case-insensitive)
  const hasExactMatch = data.some(
    (item) => item.toLowerCase() === (value || '').toLowerCase().trim()
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          type="text"
          className={inputClass}
          value={value ?? ''}
          onChange={handleInputChange}
          autoComplete="off"
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center border items-center mt-2 w-full z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-600 absolute py-2">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {/* Dropdown with suggestions + optional Add button */}
      {isOpen && (
        <div className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-full dark:bg-gray-800 absolute mt-1 max-h-[200px] overflow-y-auto">
          {/* Suggestions list */}
          {filteredData.length > 0 && (
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
              {filteredData.map((item, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600/70 dark:hover:text-white"
                    onClick={() => handleItemClick(item)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Show "Add +" button only if input is not empty and no exact match */}
          {value.trim() !== '' && !hasExactMatch && typeof onNoMatchClick === 'function' && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
              <button
                type="button"
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 w-full"
                onClick={() => onNoMatchClick(value.trim())}
              >
                Add &quot;{value.trim()}&quot; +
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteSelect;