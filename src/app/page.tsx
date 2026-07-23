import { Hero } from "@/components/Hero";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import {
  Activities,
  AuditTeaser,
  Compliance,
  ContactCta,
  Formulas,
  Method,
} from "@/components/Sections";
import { Cases } from "@/components/Cases";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BeforeAfterSlider />
      <Activities />
      <Cases />
      <Formulas />
      <Method />
      <AuditTeaser />
      <Testimonials />
      <Faq />
      <Compliance />
      <ContactCta />
    </>
  );
}
