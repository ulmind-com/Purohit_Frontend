"use client";

import { motion } from "framer-motion";

import { Logo } from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Branding panel */}
      <div className="relative hidden overflow-hidden bg-radial-glow lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="saffron-gradient absolute inset-0 opacity-95" />
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 45%), radial-gradient(circle at 80% 70%, white 0, transparent 40%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Logo className="text-white [&>span:last-child]:text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative z-10 max-w-md text-white"
        >
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Sacred ceremonies, booked in minutes.
          </h1>
          <p className="mt-4 text-white/85">
            Real-time matching with verified Purohits near you — for Puja,
            Griha Pravesh, weddings and every ritual in between.
          </p>

          <div className="mt-10 flex gap-6 text-sm">
            <Stat label="Verified Purohits" value="1,200+" />
            <Stat label="Ceremonies booked" value="8,500+" />
            <Stat label="Avg. match time" value="< 3 min" />
          </div>
        </motion.div>

        <div className="relative z-10 text-xs text-white/70">
          © {new Date().getFullYear()} Purohit Booking System
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-white/70">{label}</div>
    </div>
  );
}
