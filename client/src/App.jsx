import React from "react";
import Scene from "./canvas/Scene";
import Sidebar from "./components/ui/Sidebar";
import { useConfigStore } from "./store/useConfigStore";

export default function App() {
  const { color, material } = useConfigStore();

  return (
    <main className="app-shell w-screen h-screen flex flex-col relative bg-slate-950 font-sans">
      {/* Top Header */}
      <header className="app-header z-10 p-6 flex justify-between items-center pointer-events-none">
        <h1 className="text-white font-bold text-2xl tracking-wide pointer-events-auto">
          Product <span className="text-blue-500">Studio</span>
        </h1>
      </header>

      {/* Main 3D Canvas Viewport */}
      <div className="app-content">
        <Scene customColor={color} material={material} />

        {/* Interactive Customization Sidebar */}
        <Sidebar />
      </div>
    </main>
  );
}
