import { useState } from "react";
import { useListPlants, useGetFeaturedPlants, getListPlantsQueryKey } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
// useQuery retained for city recommendations
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Leaf, ShieldCheck, Truck, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";
import { cardVariants, RevealMotion } from "@/components/motion";

const CATEGORIES = [
  { label: "Indoor", image: "/cat-indoor.png", query: "Indoor" },
  { label: "Outdoor", image: "/cat-outdoor.png", query: "Outdoor" },
  { label: "Succulents", image: "/cat-succulents.jpg", query: "Succulents" },
  { label: "Flowering", image: "/cat-flowering.png", query: "Flowering" },
  { label: "Air-Purifying", image: "/cat-air-purifying.png", query: "Air-Purifying" },
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
    { query: { enabled: !!searchedCity, queryKey: getListPlantsQueryKey({ city: searchedCity }) } }
  );

  return (
    <div className="w-full">
      {/* Hero — magazine split */}
      <section className="relative flex min-h-[680px] md:min-h-[780px] overflow-hidden bg-[#FAFAF8]">

        {/* LEFT — text content, 55% */}
        <div className="relative z-10 flex w-full md:w-[55%] flex-col justify-center px-8 sm:px-14 lg:px-20 py-20">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-[#6B8F3E]/30 bg-[#EDF4E9] px-4 py-1.5 text-sm font-medium text-[#1B3D2A]"
          >
            <Leaf size={13} />
            Pakistan's #1 Plant Delivery Platform
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 font-serif text-5xl font-bold leading-[1.1] tracking-tight text-[#1B3D2A] md:text-6xl lg:text-[4.25rem]"
          >
            Bring nature home.{" "}
            <span className="text-[#4A7C3F]">Keep it thriving.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.35, ease: "easeOut" }}
            className="mb-10 max-w-lg text-lg leading-relaxed text-[#1B3D2A]/60"
          >
            Pakistan's smart plant delivery &amp; care platform. Discover the perfect plants for your space and climate.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/shop">
              <Button
                size="lg"
                className="h-13 bg-[#1B3D2A] px-9 text-base text-white shadow-md hover:bg-[#2a5a3e]"
              >
                Shop Plants
              </Button>
            </Link>
            <Link href="/hire">
              <Button
                size="lg"
                variant="outline"
                className="h-13 border-[#1B3D2A]/30 px-9 text-base text-[#1B3D2A] hover:bg-[#EDF4E9] hover:border-[#1B3D2A]/50"
              >
                Hire a Pro
              </Button>
            </Link>
          </motion.div>

          {/* Subtle stat strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="mt-14 flex gap-10 border-t border-[#1B3D2A]/10 pt-8"
          >
            {[["500+", "Plant varieties"], ["20k+", "Happy customers"], ["7-day", "Guarantee"]].map(([val, label]) => (
              <div key={label}>
                <p className="font-serif text-2xl font-bold text-[#1B3D2A]">{val}</p>
                <p className="text-sm text-[#1B3D2A]/55">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — hero image, 45% */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="hidden md:block md:w-[45%] relative"
        >
          {/* left-edge gradient fade blending into page */}
          <div
            className="absolute inset-y-0 left-0 z-10 w-full pointer-events-none"
            style={{ background: "linear-gradient(to right, rgba(250,250,248,1) 0%, rgba(250,250,248,0.97) 8%, rgba(250,250,248,0.88) 18%, rgba(250,250,248,0.65) 28%, rgba(250,250,248,0.38) 40%, rgba(250,250,248,0.14) 54%, rgba(250,250,248,0) 68%)" }}
          />
          <img
            src="/hero-section.jpg"
            alt="Beautiful living room with lush indoor plants"
            className="h-full w-full object-cover object-center"
            style={{ borderRadius: "2.5rem 0 0 2.5rem", transform: "scaleX(-1)" }}
          />
        </motion.div>
      </section>

      {/* City search */}
      <section className="bg-primary/5 border-y py-16">
        <div className="container mx-auto px-5 md:px-20 text-center max-w-2xl">
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
                    {recommendations?.slice(0, 4).map((plant, index) => (
                      <Link key={plant.id} href={`/plant/${plant.id}`}>
                        <motion.div
                          custom={index}
                          variants={cardVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, amount: .12 }}
                          className="plant-card group relative rounded-2xl overflow-hidden bg-card border cursor-pointer hover:shadow-md hover:border-primary/40 transition-all duration-200"
                        >
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <img
                            src={plant.imageUrl || "https://placehold.co/400x400/4A7C3F/FFFFFF?text=Plant"}
                            alt={plant.name}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-3">
                            <p className="font-semibold text-sm truncate">{plant.name}</p>
                            <p className="text-primary text-sm font-bold mt-1">Rs. {plant.price.toLocaleString()}</p>
                          </div>
                        </motion.div>
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
      <section className="container mx-auto px-5 md:px-20 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-3">Shop by Category</h2>
          <p className="text-muted-foreground text-lg">Find the right plant for your space</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.label} href={`/shop?category=${cat.query}`}>
              <div className="plant-card group relative aspect-square rounded-3xl overflow-hidden bg-muted cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Bottom gradient — label shows exactly once */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-4 inset-x-0 text-center text-white font-bold text-base md:text-lg drop-shadow-md px-2">
                  {cat.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Plants */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-5 md:px-20">
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
              {featured?.map((plant, index) => (
                <Link key={plant.id} href={`/plant/${plant.id}`}>
                  <motion.div
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: .12 }}
                    className="plant-card group bg-card rounded-2xl overflow-hidden cursor-pointer border hover:shadow-lg hover:border-primary/40 transition-all duration-200"
                  >
                    <div className="relative overflow-hidden bg-[#F0F5EC]">
                      <img
                        src={plant.imageUrl || "https://placehold.co/800x800/4A7C3F/FFFFFF?text=Plant"}
                        alt={plant.name}
                        className="w-full h-64 object-contain group-hover:scale-105 transition-transform duration-500"
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
                        <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium group-hover:bg-primary group-hover:text-white transition-all duration-200 inline-block">View Details →</span>
                      </div>
                    </div>
                  </motion.div>
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
      <section className="container mx-auto px-5 md:px-20 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-3">Why Choose Leafly?</h2>
          <p className="text-muted-foreground text-lg">Pakistan's most trusted plant partner</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map(f => (
            <div key={f.title} className="text-center group p-6 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-primary/5 hover:shadow-md transition-all duration-200 cursor-default">
              <div className="floating-leaf w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-200">
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
        <div className="container mx-auto px-5 md:px-20 max-w-2xl">
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

