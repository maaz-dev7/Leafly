import { useState } from "react";
import { useListPlants, useGetFeaturedPlants } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Leaf, ShieldCheck, Truck, HeartHandshake } from "lucide-react";

const CATEGORIES = [
  { label: "Indoor", image: "https://placehold.co/400x400/1D9E75/white?text=Indoor", query: "Indoor" },
  { label: "Outdoor", image: "https://placehold.co/400x400/2d6a4f/white?text=Outdoor", query: "Outdoor" },
  { label: "Succulents", image: "https://placehold.co/400x400/52b788/white?text=Succulents", query: "Succulents" },
  { label: "Flowering", image: "https://placehold.co/400x400/b7e4c7/1D9E75?text=Flowering", query: "Flowering" },
  { label: "Air-Purifying", image: "https://placehold.co/400x400/74c69d/white?text=Air+Purifying", query: "Air-Purifying" },
];

const FEATURES = [
  { icon: Leaf, title: "Curated for Pakistan", desc: "Every plant is selected for Pakistan's diverse climates — from humid Karachi to cool Islamabad." },
  { icon: Truck, title: "Nationwide Delivery", desc: "2–4 days to Lahore, 7–9 days to all other cities. Safe, secure packaging guaranteed." },
  { icon: HeartHandshake, title: "Expert Care Support", desc: "Real gardeners available to help you keep every plant healthy after delivery." },
  { icon: ShieldCheck, title: "Happiness Guarantee", desc: "Not satisfied? We'll replace your plant within 7 days, no questions asked." },
];

export default function Home() {
  const { data: featured, isLoading: featuredLoading } = useGetFeaturedPlants();
  const [city, setCity] = useState("");
  const [searchedCity, setSearchedCity] = useState("");

  const { data: recommendations, isLoading: recoLoading } = useListPlants(
    { city: searchedCity },
    { query: { enabled: !!searchedCity } }
  );

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://placehold.co/1920x1080/1D9E75/white?text=Leafly+Hero')] bg-cover bg-center opacity-20 dark:opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/60 to-background" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Leaf size={14} />
            Pakistan's #1 Plant Delivery Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-foreground mb-6 leading-tight">
            Bring nature home.{" "}
            <span className="text-primary">Keep it thriving.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Pakistan's smart plant delivery & care platform. Discover the perfect plants for your space and climate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button size="lg" className="text-lg h-13 px-10">Shop Plants</Button>
            </Link>
            <Link href="/hire">
              <Button size="lg" variant="outline" className="text-lg h-13 px-10">Hire a Pro</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* City search */}
      <section className="bg-primary/5 border-y py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-serif font-bold mb-2">Find plants that thrive in your city</h2>
          <p className="text-muted-foreground mb-8">
            Enter your city to see plants perfectly suited for your local climate in Pakistan.
          </p>
          <div className="flex gap-3 justify-center max-w-md mx-auto">
            <Input
              placeholder="e.g. Lahore, Karachi, Islamabad…"
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setSearchedCity(city)}
              className="bg-background"
            />
            <Button onClick={() => setSearchedCity(city)} className="shrink-0">Find Plants</Button>
          </div>

          {searchedCity && (
            <div className="mt-10">
              {recoLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-5 text-left">
                    🌱 Plants for <span className="text-primary">{searchedCity}</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recommendations?.slice(0, 4).map(plant => (
                      <Link key={plant.id} href={`/plant/${plant.id}`}>
                        <div className="group relative rounded-2xl overflow-hidden bg-card border hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1">
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <img
                            src={plant.imageUrl || "https://placehold.co/400x400/1D9E75/white?text=Plant"}
                            alt={plant.name}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-3">
                            <p className="font-semibold text-sm truncate">{plant.name}</p>
                            <p className="text-primary text-sm font-bold mt-1">Rs. {plant.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {recommendations?.length === 0 && (
                      <p className="col-span-full text-muted-foreground py-8">No plants found for "{searchedCity}". Try Lahore, Karachi, or Islamabad.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-3">Shop by Category</h2>
          <p className="text-muted-foreground text-lg">Find the right plant for your space</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.label} href={`/shop?category=${cat.query}`}>
              <div className="group relative aspect-square rounded-3xl overflow-hidden bg-muted cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-bold text-lg text-center px-2">{cat.label}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Plants */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-3">Featured Plants</h2>
            <p className="text-muted-foreground text-lg">Our most loved green companions</p>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map(i => <div key={i} className="h-96 bg-muted animate-pulse rounded-2xl" />)}
            </div>
          ) : featured?.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No featured plants available right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured?.map(plant => (
                <Link key={plant.id} href={`/plant/${plant.id}`}>
                  <div className="group bg-card rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer hover:-translate-y-2 border border-border/50">
                    <div className="relative overflow-hidden">
                      <img
                        src={plant.imageUrl || "https://placehold.co/800x800/1D9E75/white?text=Plant"}
                        alt={plant.name}
                        className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                        {plant.difficulty}
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{plant.category}</p>
                      <h3 className="font-serif text-xl font-bold">{plant.name}</h3>
                      <p className="text-sm text-muted-foreground italic mt-1">{plant.scientificName}</p>
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-primary font-bold text-lg">Rs. {plant.price.toLocaleString()}</p>
                        <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium">View Details →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/shop">
              <Button size="lg" variant="outline" className="px-10">Browse All Plants</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-3">Why Choose Leafly?</h2>
          <p className="text-muted-foreground text-lg">Pakistan's most trusted plant partner</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map(f => (
            <div key={f.title} className="text-center group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-primary text-primary-foreground py-20 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-4xl font-serif font-bold mb-4">Ready to grow something beautiful?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join thousands of plant lovers across Pakistan who trust Leafly for their green journey.
          </p>
          <Link href="/shop">
            <Button size="lg" variant="secondary" className="text-lg px-10">Shop Now</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
