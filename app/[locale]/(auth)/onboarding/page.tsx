"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, User, BookOpen } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useFirebaseOnboard } from "@/hooks/useAuth";
import type { FirebaseOnboardPayload } from "@/types";

interface OnboardData {
  firebase_uid: string;
  email: string;
  name: string;
  picture?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const onboardMutation = useFirebaseOnboard();
  const [onboardData, setOnboardData] = useState<OnboardData | null>(null);
  const [selectedRole, setSelectedRole] = useState<"user" | "purohit" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("firebase_onboard_data");
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      setOnboardData(JSON.parse(raw));
    } catch {
      router.replace("/login");
    }
  }, [router]);

  function handleSubmit() {
    if (!onboardData || !selectedRole || !phoneNumber) {
      toast.error("Please fill in all fields");
      return;
    }
    if (phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const payload: FirebaseOnboardPayload = {
      firebase_uid: onboardData.firebase_uid,
      email: onboardData.email,
      name: onboardData.name,
      picture: onboardData.picture,
      role: selectedRole,
      phone_number: phoneNumber,
    };
    onboardMutation.mutate(payload);
  }

  if (!onboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome, {onboardData.name}!</CardTitle>
          <CardDescription>
            How would you like to join our platform?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selection Cards */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole("user")}
              className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${
                selectedRole === "user"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <div className={`rounded-full p-3 ${
                selectedRole === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                <User className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold">যজমান</p>
                <p className="text-xs text-muted-foreground">Devotee</p>
              </div>
              {selectedRole === "user" && (
                <motion.div
                  layoutId="check"
                  className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole("purohit")}
              className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${
                selectedRole === "purohit"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <div className={`rounded-full p-3 ${
                selectedRole === "purohit" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold">পুরোহিত</p>
                <p className="text-xs text-muted-foreground">Purohit</p>
              </div>
              {selectedRole === "purohit" && (
                <motion.div
                  layoutId="check"
                  className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            size="lg"
            disabled={!selectedRole || !phoneNumber || onboardMutation.isPending}
            onClick={handleSubmit}
          >
            {onboardMutation.isPending && (
              <Loader2 className="size-4 animate-spin mr-2" />
            )}
            Get Started
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
