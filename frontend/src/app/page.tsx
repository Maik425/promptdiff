import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { DemoSection } from "@/components/landing/DemoSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CurlExample } from "@/components/landing/CurlExample";
import { ModelsGrid } from "@/components/landing/ModelsGrid";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <DemoSection />
        <HowItWorks />
        <CurlExample />
        <ModelsGrid />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
