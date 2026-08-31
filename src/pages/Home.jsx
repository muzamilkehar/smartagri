import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import FeaturesSection from "../components/FeaturesSection";
import TeamSection from "../components/TeamSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <main className="pt-16">
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <TeamSection />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Home;