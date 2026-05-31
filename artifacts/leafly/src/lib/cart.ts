import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OrderAddon } from "@workspace/api-client-react";

export interface CartItem {
  plantId: number;
  plantName: string;
  price: number;
  quantity: number;
  variantColor?: string;
  addons: OrderAddon[];
  imageUrl: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (plantId: number, variantColor?: string) => void;
  updateQuantity: (plantId: number, variantColor: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.plantId === item.plantId && i.variantColor === item.variantColor);
        if (existing) {
          return {
            items: state.items.map(i => 
              i.plantId === item.plantId && i.variantColor === item.variantColor
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (plantId, variantColor) => set((state) => ({
        items: state.items.filter(i => !(i.plantId === plantId && i.variantColor === variantColor))
      })),
      updateQuantity: (plantId, variantColor, quantity) => set((state) => ({
        items: state.items.map(i => 
          i.plantId === plantId && i.variantColor === variantColor
            ? { ...i, quantity }
            : i
        )
      })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          const itemTotal = item.price * item.quantity;
          const addonsTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0) * item.quantity;
          return total + itemTotal + addonsTotal;
        }, 0);
      }
    }),
    {
      name: "leafly_cart",
    }
  )
);
