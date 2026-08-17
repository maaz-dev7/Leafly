import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";

export default function Contact() {
  const { data: contact } = useQuery({
    queryKey: ["contact"],
    queryFn: () => fetch("/api/contact").then(r => r.json()),
    staleTime: 60_000,
  });

  const items = [
    { icon: Mail, label: "Email Us", value: contact?.email, href: `mailto:${contact?.email}` },
    { icon: Phone, label: "Call / WhatsApp", value: contact?.phone, href: `tel:${contact?.phone}` },
    { icon: MapPin, label: "Our Office", value: contact?.address, href: undefined },
    { icon: Clock, label: "Business Hours", value: contact?.hours, href: undefined },
  ];

  return (
    <div className="container mx-auto px-5 md:px-20 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-5">
          <MessageCircle size={14} /> Get In Touch
        </div>
        <h1 className="text-5xl font-serif font-bold mb-4 text-[#1B3D2A] dark:text-white">Contact Us</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          We're here to help you grow. Whether you have a question about a plant, an order, or just need some gardening advice — reach out anytime.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
        {items.map(({ icon: Icon, label, value, href }) => (
          <div
            key={label}
            className="bg-card border border-border/60 rounded-2xl p-6 text-center hover:border-primary/40 hover:shadow-lg transition-all group"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
              <Icon className="text-primary" size={24} />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
            {href ? (
              <a href={href} className="font-semibold text-sm hover:text-primary transition-colors leading-snug block">
                {value || "—"}
              </a>
            ) : (
              <p className="font-semibold text-sm leading-snug">{value || "—"}</p>
            )}
          </div>
        ))}
      </div>

      {/* Map / visual placeholder */}
      <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden border bg-[#EDF4E9]/60 flex items-center justify-center h-64 md:h-80">
        <div className="text-center text-[#1B3D2A]/50 space-y-2">
          <MapPin size={40} className="mx-auto opacity-40" />
          <p className="text-sm font-medium">Visit us at our office</p>
          {contact?.address && (
            <p className="text-sm text-muted-foreground max-w-xs">{contact.address}</p>
          )}
        </div>
      </div>
    </div>
  );
}
