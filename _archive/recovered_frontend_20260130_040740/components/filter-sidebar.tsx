
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FilterSidebarProps {
  filterOptions: Record<string, string[]>;
  activeFilters: Record<string, string[]>;
  onFilterChange: (category: string, value: string) => void;
}

export function FilterSidebar({
  filterOptions,
  activeFilters,
  onFilterChange,
}: FilterSidebarProps) {
  return (
    <aside className="w-64 p-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Filters</h2>
      <Accordion type="multiple" className="w-full">
        {Object.entries(filterOptions).map(([category, options]) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="text-gray-700 dark:text-gray-300 capitalize">
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-2">
                {options.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${category}-${option}`}
                      checked={activeFilters[category]?.includes(option) || false}
                      onCheckedChange={() => onFilterChange(category, option)}
                    />
                    <Label htmlFor={`${category}-${option}`} className="text-gray-800 dark:text-gray-200">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </aside>
  );
}
