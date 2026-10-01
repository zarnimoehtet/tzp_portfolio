import type { Metadata } from "next";

import { getAdminTestimonials } from "@/lib/data/admin";
import { TestimonialManager } from "./testimonial-manager";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const testimonials = await getAdminTestimonials();
  return <TestimonialManager testimonials={testimonials} />;
}
