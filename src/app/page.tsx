import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustCards from "@/components/TrustCards";
import ServiceSpotlight from "@/components/ServiceSpotlight";
import Services from "@/components/Services";
import ProcessSteps from "@/components/ProcessSteps";
import Faq from "@/components/Faq";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustCards />
        <ServiceSpotlight />
        <Services />
        <ProcessSteps />
        <Faq />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
