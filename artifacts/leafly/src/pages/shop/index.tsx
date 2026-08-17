import { useState, useMemo } from "react";
import { useListPlants } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cardVariants } from "@/components/motion";

const CATEGORIES = ["Indoor", "Outdoor", "Succulents", "Flowering", "Air-Purifying"];
const CITIES = ["Lahore", "Karachi", "Islamabad", "Peshawar", "Quetta", "Multan", "Faisalabad"];

export default function Shop() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialCategory = params.get("category") || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>(initialCategory);
  const [city, setCity] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");

  const hasFilters = !!(searchTerm || (category && category !== "all") || (city && city !== "all") || (difficulty && difficulty !== "all"));

  const clearFilters = () => {
    setSearchTerm("");
    setCategory("");
    setCity("");
    setDifficulty("");
  };

  const { data: plants, isLoading } = useListPlants({
    category: category && category !== "all" ? category : undefined,
    city: city && city !== "all" ? city : undefined,
    difficulty: difficulty && difficulty !== "all" ? difficulty : undefined,
  });

  const filtered = useMemo(() => {
    if (!plants) return [];
    if (!searchTerm) return plants;
    const q = searchTerm.toLowerCase();
    return plants.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.scientificName?.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [plants, searchTerm]);

  return (
    <div className="container mx-auto px-5 md:px-20 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Plant Shop</h1>
        <p className="text-muted-foreground">Find your perfect green companion.</p>
      </div>

      {/* Search + Filters — no wrapper card */}
      <div className="flex flex-wrap gap-3 items-center mb-8">
        {/* Search bar — compact width */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search plants…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-background"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="h-6 w-px bg-border hidden sm:block" />

        <Select value={category || "all"} onValueChange={setCategory}>
          <SelectTrigger className="w-[150px] h-10 hover:border-primary/50 transition-colors cursor-pointer">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={difficulty || "all"} onValueChange={setDifficulty}>
          <SelectTrigger className="w-[150px] h-10 hover:border-primary/50 transition-colors cursor-pointer">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Difficulty</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Expert">Expert</SelectItem>
          </SelectContent>
        </Select>

        <Select value={city || "all"} onValueChange={setCity}>
          <SelectTrigger className="w-[150px] h-10 hover:border-primary/50 transition-colors cursor-pointer">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
            <X size={14} /> Clear
          </Button>
        )}

        {!isLoading && (
          <span className="ml-auto text-sm text-muted-foreground">{filtered.length} plant{filtered.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Plant grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <div className="text-6xl mb-4">🌿</div>
          <h3 className="text-xl font-semibold mb-2">No plants found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your filters or search term.</p>
          <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((plant, index) => (
            <Link key={plant.id} href={`/plant/${plant.id}`}>
              <motion.div
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: .12 }}
                className="plant-card group bg-card rounded-2xl overflow-hidden cursor-pointer border h-full flex flex-col hover:shadow-lg hover:border-primary/40 transition-all duration-200"
              >
                <div className="relative overflow-hidden bg-[#F0F5EC]">
                  <img
                    src={plant.imageUrl || "https://placehold.co/400x400/4A7C3F/FFFFFF?text=Plant"}
                    alt={plant.name}
                    className="w-full h-52 object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {!plant.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary" className="text-sm font-semibold">Out of Stock</Badge>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      plant.difficulty === "Easy" ? "bg-[#4A7C3F]/15 text-[#1B3D2A]" :
                      plant.difficulty === "Medium" ? "bg-[#6B8F3E]/20 text-[#1B3D2A]" :
                      "bg-[#1B3D2A]/10 text-[#1B3D2A]"
                    }`}>
                      {plant.difficulty}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{plant.category}</p>
                  <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-2">{plant.name}</h3>
                  <p className="text-sm text-muted-foreground italic mb-4 flex-1">{plant.scientificName}</p>
                  <div className="flex flex-col gap-2 mt-auto">
                    <p className="text-primary font-bold text-lg">Rs. {plant.price.toLocaleString()}</p>
                    <span className="text-xs font-semibold bg-primary/10 text-primary py-1.5 rounded-full group-hover:bg-primary group-hover:text-white transition-all duration-200 text-center w-full">
                      View Details →
                    </span>
                  </div>
                </CardContent>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
