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

      {/* Search + Filters */}
      <div className="bg-card border rounded-2xl p-5 mb-8 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search plants by name, type..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-background"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-3 items-center">
            <SlidersHorizontal size={16} className="text-muted-foreground shrink-0" />

            <Select value={category || "all"} onValueChange={setCategory}>
              <SelectTrigger className="w-[165px] h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={difficulty || "all"} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[165px] h-9">
                <SelectValue placeholder="Care Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Difficulty</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={city || "all"} onValueChange={setCity}>
              <SelectTrigger className="w-[165px] h-9">
                <SelectValue placeholder="City Climate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1.5 text-muted-foreground hover:text-foreground">
                <X size={14} /> Clear Filters
              </Button>
            )}

            {!isLoading && (
              <span className="ml-auto text-sm text-muted-foreground">{filtered.length} plant{filtered.length !== 1 ? "s" : ""} found</span>
            )}
          </div>
        </div>
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
                className="plant-card group bg-card rounded-2xl overflow-hidden cursor-pointer border h-full flex flex-col"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={plant.imageUrl || "https://placehold.co/400x400/4A7C3F/FFFFFF?text=Plant"}
                    alt={plant.name}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
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
                  <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-2 flex-1">{plant.name}</h3>
                  <p className="text-sm text-muted-foreground italic mb-3">{plant.scientificName}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-primary font-bold text-lg">Rs. {plant.price.toLocaleString()}</p>
                    <span className="text-xs text-muted-foreground">{plant.size}</span>
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
