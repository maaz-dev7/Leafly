import { useState } from "react";
import { useListPlants, useGetFeaturedPlants } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

export default function Home() {
  const { data: featured } = useGetFeaturedPlants();
  const [city, setCity] = useState("");
  const [searchedCity, setSearchedCity] = useState("");
  
  const { data: recommendations, isLoading } = useListPlants(
    { city: searchedCity },
    { query: { enabled: !!searchedCity } }
  );
  
  return (
    <div className="w-full">
      <div className="bg-primary/5 py-24 text-center px-4">
        <h1 className="text-5xl md:text-6xl font-serif text-primary mb-4">Bring nature home. <br/><span className="text-foreground">Keep it thriving.</span></h1>
        <p className="text-xl text-muted-foreground mb-8">Leafly is your smart plant delivery and care platform.</p>
        <Link href="/shop"><Button size="lg" className="text-lg h-12 px-8">Shop Now</Button></Link>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="bg-secondary/20 p-8 rounded-2xl mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-serif mb-4">Find the Best Plants for Your Climate</h2>
          <div className="flex gap-2 justify-center max-w-md mx-auto">
            <Input 
              placeholder="Enter your city (e.g. Lahore)" 
              value={city}
              onChange={e => setCity(e.target.value)}
              className="bg-background"
            />
            <Button onClick={() => setSearchedCity(city)}>Discover</Button>
          </div>
          
          {searchedCity && (
            <div className="mt-8">
              {isLoading ? (
                <div className="flex justify-center gap-4">
                  <div className="h-48 w-40 bg-muted animate-pulse rounded-lg"></div>
                  <div className="h-48 w-40 bg-muted animate-pulse rounded-lg"></div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium mb-4">Recommended for {searchedCity}:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recommendations?.slice(0, 4).map(plant => (
                      <Link key={plant.id} href={`/plant/${plant.id}`}>
                        <Card className="hover:-translate-y-1 transition-transform cursor-pointer border-none bg-card">
                          <img src={plant.imageUrl || "https://placehold.co/400x400/1D9E75/white"} alt={plant.name} className="w-full h-32 object-cover rounded-t-lg" />
                          <CardContent className="p-3 text-center">
                            <p className="font-serif text-sm font-bold truncate">{plant.name}</p>
                            <p className="text-primary text-xs font-medium">Rs. {plant.price}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    {recommendations?.length === 0 && <p className="col-span-full text-muted-foreground">No specific recommendations found.</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <h2 className="text-3xl font-serif mb-8 text-center">Featured Plants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured?.map(plant => (
            <Link key={plant.id} href={`/plant/${plant.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden border-none bg-secondary/10">
                <img src={plant.imageUrl || "https://placehold.co/400x400/1D9E75/white?text=Leafly"} alt={plant.name} className="w-full h-80 object-cover" />
                <CardContent className="p-6 text-center">
                  <h3 className="font-serif text-2xl">{plant.name}</h3>
                  <p className="text-primary font-bold mt-2 text-lg">Rs. {plant.price}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}