import RainCanvas from "@/components/home/RainParticles";
import HomePageSection from "@/components/home/HomePageSection";
import { sections } from "@/utils/homepage";

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden bg-background text-foreground">
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <RainCanvas />
      </div>
      <HomePageSection sections={sections} />
    </main>
  );
}
