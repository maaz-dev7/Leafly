import { useState } from "react";
import { useListPlants } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function Shop() {
  const [category, setCategory] = useState<string>();
  const [city, setCity] = useState<string>();
  const [difficulty, setDifficulty] = useState<string>();

  const { data: plants, isLoading } = useListPlants({
    category: category !== "all" ? category : undefined,
    city: city !== "all" ? city : undefined,
    difficulty: difficulty !== "all" ? difficulty : undefined,
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif mb-8 text-primary">Shop Plants</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Select value={category || "all"} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Indoor">Indoor</SelectItem>
            <SelectItem value="Outdoor">Outdoor</SelectItem>
          </SelectContent>
        </Select>

        <Select value={city || "all"} onValueChange={setCity}>
          <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Your City" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            <SelectItem value="Lahore">Lahore</SelectItem>
            <SelectItem value="Karachi">Karachi</SelectItem>
            <SelectItem value="Islamabad">Islamabad</SelectItem>
          </SelectContent>
        </Select>

        <Select value={difficulty || "all"} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Care Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {plants?.filter(p => p.isAvailable).map(plant => (
            <Link key={plant.id} href={`/plant/${plant.id}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-none bg-card hover:-translate-y-1">
                <img src={plant.imageUrl || "https://placehold.co/400x400/1D9E75/white?text=Leafly"} alt={plant.name} className="w-full h-64 object-cover rounded-t-lg" />
                <CardContent className="p-4">
                  <h3 className="font-serif text-lg">{plant.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{plant.category} • {plant.difficulty}</p>
                  <p className="text-primary font-bold">Rs. {plant.price}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {plants?.filter(p => p.isAvailable).length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No plants found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
