import { Hero } from "@/components/Hero";
import {
  Activities,
  Compliance,
  ContactCta,
  Formulas,
  Method,
} from "@/components/Sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Activities />
      <Formulas />
      <Method />
      <Compliance />
      <ContactCta />
    </>
  );
}
