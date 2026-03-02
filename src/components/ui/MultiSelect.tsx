
import { useState, useRef, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

type Option = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
};

const MultiSelect = ({ options, selected, onChange, label }: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  return (
    <div className="relative" ref={ref}>
      <label className="label">{label}</label>
      <div
        className="input mt-1 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selected.length === 0 ? (
            <span className="text-gray-400">Select roles</span>
          ) : (
            selected.map((value) => {
              const option = options.find((o) => o.value === value);
              return (
                <span
                  key={value}
                  className="badge badge-soft flex items-center gap-1"
                >
                  {option?.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(value);
                    }}
                  >
                    <MdClose />
                  </button>
                </span>
              );
            })
          )}
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border">
          <ul className="max-h-60 overflow-auto">
            {options.map((option) => (
              <li
                key={option.value}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                  selected.includes(option.value) ? 'bg-gray-200' : ''
                }`}
                onClick={() => handleToggle(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
