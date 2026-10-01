import Preloader from "@/components/Preloader";
import FX from "@/components/FX";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import SpiderSense from "@/components/SpiderSense";
import Origin from "@/components/Origin";
import Motive from "@/components/Motive";
import Powers from "@/components/Powers";
import CaseFiles from "@/components/CaseFiles";
import Variants from "@/components/Variants";
import UnderTheMask from "@/components/UnderTheMask";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Preloader />
      <FX />
      <Nav />
      <main id="main">
        <Hero />
        <SpiderSense />
        <Origin />
        <Motive />
        <Powers />
        <CaseFiles />
        <Variants />
        <UnderTheMask />
        <Contact />
      </main>
    </>
  );
}
