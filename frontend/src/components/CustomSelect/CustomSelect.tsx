import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { clampDropdownToViewport, ClampedDropdown } from '../../utils/viewportDropdown';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  dropdownPosition?: 'top' | 'bottom' | 'auto';
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'انتخاب کنید',
  disabled = false,
  className = '',
  style = {},
  dropdownPosition: forcedPosition = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [panel, setPanel] = useState<ClampedDropdown | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const updatePosition = useCallback(() => {
    if (!isOpen || !buttonRef.current) {
      setPanel(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    setPanel(
      clampDropdownToViewport({
        trigger: rect,
        preferredWidth: Math.max(rect.width, 180),
        preferredHeight: Math.min(options.length * 44 + 16, 220),
        preferAbove: forcedPosition === 'top',
        gap: 6,
      }),
    );
  }, [isOpen, options.length, forcedPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative w-full min-w-0 ${className}`} style={{ height: '100%', minHeight: '48px', ...style }}>
      <div className="relative h-full min-w-0">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full h-full min-w-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all bg-white text-base ${
            disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-gray-400'
          }`}
          style={{
            fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif',
            direction: 'rtl',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            paddingRight: '1rem',
            paddingLeft: '3rem',
            fontWeight: 'bold',
            textAlign: 'right',
            minHeight: '48px',
            ...style,
          }}
        >
          <span className={`block truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </button>

        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
      </div>

      {isOpen && !disabled && panel &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[99999] bg-white border border-gray-300 rounded-xl shadow-2xl overflow-y-auto overscroll-contain"
            style={{
              fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif',
              direction: 'rtl',
              fontSize: '13px',
              left: panel.left,
              width: panel.width,
              maxHeight: panel.maxHeight,
              ...(panel.bottom !== undefined ? { bottom: panel.bottom } : { top: panel.top }),
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                data-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-3.5 cursor-pointer transition-colors text-right border-b border-gray-50 last:border-b-0 ${
                  option.value === value
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
                style={{
                  fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif',
                  fontWeight: 'bold',
                }}
              >
                {option.label}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default CustomSelect;
