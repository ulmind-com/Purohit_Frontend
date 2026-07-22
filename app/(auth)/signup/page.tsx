"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSignupForm } from "@/components/auth/user-signup-form";
import { PurohitSignupForm } from "@/components/auth/purohit-signup-form";

export default function SignupPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Book a Purohit for your next ceremony, or join as a Purohit to
            start accepting requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">I&apos;m a Yajman</TabsTrigger>
              <TabsTrigger value="purohit">I&apos;m a Purohit</TabsTrigger>
            </TabsList>
            <TabsContent value="user" className="pt-6">
              <UserSignupForm />
            </TabsContent>
            <TabsContent value="purohit" className="pt-6">
              <PurohitSignupForm />
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
