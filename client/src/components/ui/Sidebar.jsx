import React from "react";
import { useConfigStore } from "../../store/useConfigStore";

const colors = [
  { name: "Royal Navy", hex: "#153D6F" },
  { name: "Gold Dust", hex: "#E0B13E" },
  { name: "Crimson", hex: "#DC2626" },
  { name: "Matte Black", hex: "#18181B" },
  { name: "Emerald", hex: "#059669" },
];

const materials = [
  { id: "standard", name: "Standard Matte", extra: 0 },
  { id: "metallic", name: "Metallic Finish", extra: 25 },
  { id: "glossy", name: "High Gloss", extra: 15 },
];

export default function Sidebar() {
  React.useEffect(() => {
    useConfigStore.getState().loadProduct();
    useConfigStore.getState().loadDesigns();
  }, []);
  const {
    color,
    material,
    setColor,
    setMaterial,
    getTotalPrice,
    saveConfiguration,
    saving,
    saveSuccess,
    saveError,
    designs,
    designsError,
    productError,
    loadDesign,
    deleteDesign,
  } = useConfigStore();

  return (
    <aside className="config-sidebar bg-slate-900/90 backdrop-blur-md text-white p-6 rounded-2xl shadow-2xl border border-slate-800 flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Product Studio</h2>
        <p className="text-sm text-slate-400">Customize materials & colors</p>
      </div>

      {/* Color Selection */}
      <div>
        <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 block">
          Body Color
        </label>
        <div className="flex gap-3">
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => setColor(c.hex)}
              className={`w-9 h-9 rounded-full transition-transform border-2 ${
                color === c.hex
                  ? "scale-110 border-white"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Material Finish Selection */}
      <div>
        <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 block">
          Material Finish
        </label>
        <div className="flex flex-col gap-2">
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={() => setMaterial(m.id, m.extra)}
              className={`flex justify-between items-center p-3 rounded-lg border text-sm transition-all ${
                material === m.id
                  ? "bg-blue-600/20 border-blue-500 text-white font-medium"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span>{m.name}</span>
              <span className="text-xs text-slate-400">
                {m.extra > 0 ? `+$${m.extra}` : "Free"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing and Action */}
      <div className="pt-4 border-t border-slate-800 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Total Price</span>
          <span className="text-2xl font-bold text-emerald-400">
            ${getTotalPrice().toFixed(2)}
          </span>
        </div>

        <button
          onClick={saveConfiguration}
          disabled={saving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
        >
          {saving ? "Saving to Database..." : "Save Configuration"}
        </button>

        {saveSuccess && (
          <p className="text-xs text-center text-emerald-400 font-medium">
            Saved!
          </p>
        )}
        {saveError && <p role="alert" className="text-xs text-center text-rose-400">{saveError}</p>}
        {productError && <p role="alert" className="text-xs text-center text-rose-400">{productError}</p>}
      </div>

      <section className="pt-4 border-t border-slate-800">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold">My Designs</h3>
          <button className="text-xs text-slate-400 hover:text-white" onClick={() => useConfigStore.getState().loadDesigns()}>Refresh</button>
        </div>
        {designsError && <p role="alert" className="text-xs text-rose-400 mb-2">{designsError}</p>}
        {designs.length === 0 ? <p className="text-xs text-slate-500">Your saved designs will appear here.</p> : (
          <ul className="design-list flex flex-col gap-2">
            {designs.map((design) => (
              <li key={design.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/70">
                <button onClick={() => loadDesign(design)} className="flex min-w-0 flex-1 items-center gap-3 text-left" title="Load this design">
                  <span className="w-6 h-6 rounded-full border border-white/30 shrink-0" style={{ backgroundColor: design.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium">{({ standard: "Standard Matte", metallic: "Metallic Finish", glossy: "High Gloss" })[design.material] || design.material} - ${Number(design.totalPrice).toFixed(2)}</span>
                    <span className="block text-[10px] text-slate-400">{new Date(`${design.createdAt}Z`).toLocaleString()}</span>
                  </span>
                </button>
                <button onClick={() => deleteDesign(design.id)} className="px-2 py-1 text-xs text-slate-400 hover:text-rose-400" aria-label="Delete saved design">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
