import { Hero } from "@/components/Hero";
import {
  Activities,
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
      <Activities />
      <Cases />
      <Formulas />
      <Method />
      <Testimonials />
      <Faq />
      <Compliance />
      <ContactCta />
    </>
  );
}
