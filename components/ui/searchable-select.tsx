'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SearchableSelectOption {
  value: string;
  label: string;
  brand?: string;
  price?: number;
  searchTerms?: string[];
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options = [],
  value,
  onValueChange,
  placeholder = "Seçim yapın...",
  searchPlaceholder = "Ara...",
  emptyMessage = "Sonuç bulunamadı.",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Add safety check for options
  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50",
            !selectedOption && "text-gray-400",
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-col items-start max-w-full">
            {selectedOption ? (
              <>
                <span className="truncate">{selectedOption.label}</span>
                {selectedOption.price && (
                  <span className="text-xs text-green-400">
                    ₺{selectedOption.price.toLocaleString('tr-TR')}
                  </span>
                )}
              </>
            ) : (
              placeholder
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-gray-800 border-gray-600">
        <Command className="bg-gray-800">
          <div className="flex items-center border-b border-gray-600 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-gray-400" />
            <CommandInput 
              placeholder={searchPlaceholder}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandEmpty className="py-6 text-center text-sm text-gray-400">
            {emptyMessage}
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {safeOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onValueChange(option.value === value ? "" : option.value);
                  setOpen(false);
                }}
                className="cursor-pointer hover:bg-gray-700 text-white"
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{option.label}</span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 text-green-400",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    {option.brand && (
                      <span className="text-blue-400">{option.brand}</span>
                    )}
                    {option.price && (
                      <span className="text-green-400">
                        ₺{option.price.toLocaleString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}