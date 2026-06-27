"use client";

import dynamic from "next/dynamic";

const HeroChaosCanvas = dynamic(() => import("./HeroChaosCanvas"), { ssr: false });

export default function HeroChaosCanvasLoader() {
  return <HeroChaosCanvas />;
}
