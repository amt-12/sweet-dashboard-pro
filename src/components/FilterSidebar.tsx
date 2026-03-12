import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";

export interface FilterState {
  category: string[];
  flavor: string[];
  type: string[];
  occasion: string[];
  priceRange: [number, number];
  weight: string[];
  delivery: string[];
  rating: number | null;
  dietary: string[];
  shape: string[];
  theme: string[];
}

const initialFilters: FilterState = {
  category: [],
  flavor: [],
  type: [],
  occasion: [],
  priceRange: [200, 2000],
  weight: [],
  delivery: [],
  rating: null,
  dietary: [],
  shape: [],
  theme: [],
};

const filterOptions = {
  category: ["Cakes", "Cupcakes", "Pastries", "Cookies", "Donuts", "Pies & Tarts", "Gift Hampers", "Chocolates"],
  flavor: ["Chocolate", "Vanilla", "Red Velvet", "Butterscotch", "Black Forest", "Pineapple", "Strawberry", "Coffee", "Mango"],
  type: ["Eggless", "Egg Cake", "Vegan Cake", "Sugar-Free Cake", "Gluten-Free Cake", "Designer Cake", "Photo Cake", "Fondant Cake", "Theme Cake"],
  occasion: ["Birthday", "Anniversary", "Valentine's Day", "Baby Shower", "Graduation", "Christmas", "Diwali", "Party"],
  weight: ["500g", "1 Kg", "1.5 Kg", "2 Kg", "3 Kg+"],
  delivery: ["Same Day Delivery", "Midnight Delivery", "Express Delivery", "Schedule Delivery"],
  dietary: ["Eggless", "Vegan", "Sugar-Free", "Gluten-Free"],
  shape: ["Round", "Heart Shape", "Square", "Cartoon Shape", "Number Cake"],
  theme: ["Kids Theme", "Superhero Theme", "Princess Theme", "Football Theme", "Wedding Theme"],
};

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function FilterSidebar({ onFilterChange, className, isOpen, onClose }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleCheckboxChange = (section: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const current = prev[section] as string[];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      
      const newFilters = { ...prev, [section]: updated };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const handlePriceChange = (value: number[]) => {
    // In Slider component, value is number[]. Here we need [number, number].
    // Since we initialized as [200, 2000], and slider is dual thumb, it should be fine.
    // However, if the slider returns less than 2 items, we need to be careful.
    // Assuming shadcn slider with 2 values works as expected.
    const newFilters = { ...filters, priceRange: value as [number, number] };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onFilterChange?.(initialFilters);
  };

  return (
    <div className={`bg-white border-r border-[#D4A373]/20 ${className}`}>
      <div className="p-4 border-b border-[#F5ECD7] flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-2 text-[#3E2723]">
          <Filter size={20} />
          <h2 className="font-playfair font-bold text-xl">Filters</h2>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={clearFilters}
            className="text-xs font-bold text-[#8D6E63] hover:text-[#D4A373] underline"
          >
            Clear All
          </button>
          {onClose && (
            <button onClick={onClose} className="md:hidden text-[#3E2723]">
              <X size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2">
        <Accordion type="multiple" defaultValue={["category", "price", "flavor"]} className="w-full">
          
          {/* Price Range */}
          <AccordionItem value="price" className="border-b border-[#D4A373]/20">
            <AccordionTrigger className="text-[#3E2723] font-semibold hover:no-underline hover:text-[#D4A373] py-3">Price Range</AccordionTrigger>
            <AccordionContent className="pt-4 px-2">
              <Slider
                defaultValue={[200, 2000]}
                max={5000}
                min={0}
                step={50}
                value={filters.priceRange}
                onValueChange={handlePriceChange}
                className="mb-4"
              />
              <div className="flex justify-between text-sm font-bold text-[#8D6E63]">
                <span className="bg-[#D4A373]/10 px-2 py-0.5 rounded-lg">₹{filters.priceRange[0]}</span>
                <span className="bg-[#D4A373]/10 px-2 py-0.5 rounded-lg">₹{filters.priceRange[1]}</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Dynamic Checkbox Sections */}
          {Object.entries(filterOptions).map(([key, options]) => (
            <AccordionItem value={key} key={key} className="border-b border-[#D4A373]/20">
              <AccordionTrigger className="capitalize text-[#3E2723] font-semibold hover:no-underline hover:text-[#D4A373] py-3">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  {options.map((option) => (
                    <div
                      key={option}
                      className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        (filters[key as keyof FilterState] as string[]).includes(option)
                          ? "bg-[#3E2723]/8 "
                          : "hover:bg-[#D4A373]/10"
                      }`}
                    >
                      <Checkbox 
                        id={`${key}-${option}`} 
                        checked={(filters[key as keyof FilterState] as string[]).includes(option)}
                        onCheckedChange={() => handleCheckboxChange(key as keyof FilterState, option)}
                        className="border-[#D4A373] data-[state=checked]:bg-[#3E2723] data-[state=checked]:border-[#3E2723]"
                      />
                      <label
                        htmlFor={`${key}-${option}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#5D4037] cursor-pointer w-full"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}

          {/* Ratings */}
          <AccordionItem value="ratings" className="border-b-0">
            <AccordionTrigger className="text-[#3E2723] font-semibold hover:no-underline hover:text-[#D4A373] py-3">Ratings</AccordionTrigger>
            <AccordionContent>
               <div className="space-y-1.5 pt-1">
                  {[4, 3, 2, 1].map((rating) => (
                    <div
                      key={rating}
                      className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        filters.rating === rating ? "bg-[#3E2723]/8" : "hover:bg-[#D4A373]/10"
                      }`}
                    >
                      <Checkbox 
                        id={`rating-${rating}`}
                        checked={filters.rating === rating}
                        onCheckedChange={(checked) => {
                             setFilters(prev => {
                                 const newVal = checked ? rating : null;
                                 const newFilters = { ...prev, rating: newVal };
                                 onFilterChange?.(newFilters);
                                 return newFilters;
                             });
                        }}
                        className="border-[#D4A373] data-[state=checked]:bg-[#3E2723] data-[state=checked]:border-[#3E2723]"
                      />
                      <label htmlFor={`rating-${rating}`} className="text-sm font-medium text-[#5D4037] flex items-center gap-1 cursor-pointer w-full">
                        <span className="text-[#FFB800]">{"★".repeat(rating)}{"☆".repeat(4 - rating)}</span>
                        <span className="text-[#8D6E63]">& above</span>
                      </label>
                    </div>
                  ))}
               </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </div>
  );
}
