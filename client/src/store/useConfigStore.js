import { create } from "zustand";
import { api } from "../services/api";

export const useConfigStore = create((set, get) => ({
  color: "#153D6F",
  material: "standard",
  basePrice: 150,
  extraPrice: 0,
  saving: false,
  saveSuccess: false,
  saveError: "",
  designs: [],
  designsError: "",
  productError: "",
  serverTotalPrice: null,

  setColor: (color) => set({ color, serverTotalPrice: null }),

  setMaterial: (material, extra = 0) =>
    set({
      material,
      extraPrice: extra,
      serverTotalPrice: null,
    }),

  getTotalPrice: () => get().serverTotalPrice ?? get().basePrice + get().extraPrice,

  loadProduct: async () => {
    try {
      const data = await api.getProduct();
      if (data.product) set({ basePrice: Number(data.product.base_price), productError: "" });
    } catch (err) {
      set({ productError: err.message });
    }
  },

  loadDesigns: async () => {
    try {
      const data = await api.getConfigurations();
      set({ designs: data.configurations || [], designsError: "" });
    } catch (err) {
      set({ designsError: err.message });
    }
  },

  loadDesign: (design) => set({
    color: design.color,
    material: design.material,
    extraPrice: ({ standard: 0, metallic: 25, glossy: 15 })[design.material] ?? 0,
    serverTotalPrice: Number(design.totalPrice),
    saveError: "",
  }),

  deleteDesign: async (id) => {
    try {
      await api.deleteConfiguration(id);
      set((state) => ({ designs: state.designs.filter((design) => design.id !== id), designsError: "" }));
    } catch (err) {
      set({ designsError: err.message });
    }
  },

  saveConfiguration: async () => {
    set({ saving: true, saveSuccess: false, saveError: "" });
    try {
      const data = await api.saveConfiguration({
        productId: 1,
        color: get().color,
        material: get().material,
      });
      if (data.success) {
        set({ saveSuccess: true, serverTotalPrice: Number(data.totalPrice) });
        setTimeout(() => set({ saveSuccess: false }), 3000);
        get().loadDesigns();
      }
    } catch (err) {
      set({ saveError: err.message || "Could not save your design." });
    } finally {
      set({ saving: false });
    }
  },
}));
