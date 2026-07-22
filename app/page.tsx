"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarClock, MapPinned, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: MapPinned,
    title: "Real-time matching",
    description:
      "Your request broadcasts instantly to every verified Purohit within range — first to accept, locks the booking.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Purohits",
    description:
      "Every Purohit is vetted for expertise — Marriage, Griha Pravesh, Satyanarayan Katha and more.",
  },
  {
    icon: CalendarClock,
    title: "Transparent Dakshina",
    description:
      "See the offered Dakshina upfront. No back-and-forth, no surprises on ceremony day.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden bg-radial-glow">
        <section className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-16 text-center sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
          >
            <Sparkles className="size-3.5 text-saffron-500" />
            Now matching in 12 cities
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            Book a <span className="saffron-gradient-text">Purohit</span>
            <br />
            the moment you need one.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            An Uber-like platform connecting Yajmans with verified Purohits in
            real time — for Puja, weddings, Griha Pravesh and every sacred
            ceremony in between.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button size="lg" className="text-base" asChild>
              <Link href="/signup">Book a ceremony</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link href="/signup">Join as a Purohit</Link>
            </Button>
          </motion.div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-24 sm:grid-cols-3 sm:px-6 lg:px-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card className="glass-panel h-full">
                <CardContent className="pt-6">
                  <div className="saffron-gradient mb-4 flex size-10 items-center justify-center rounded-xl text-white">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Purohit Booking System. All rights reserved.
      </footer>
    </div>
  );
}
