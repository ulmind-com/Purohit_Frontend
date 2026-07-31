"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Banknote, Building, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setupPayout } from "@/lib/api/purohits";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/api/axios";
import type { PurohitResponse } from "@/types";

const upiSchema = z.object({
  upi_id: z.string().regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI ID format (e.g. name@bank)"),
});

const bankSchema = z.object({
  account_number: z.string().min(5, "Account number too short"),
  confirm_account_number: z.string(),
  ifsc_code: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code format"),
}).refine((data) => data.account_number === data.confirm_account_number, {
  message: "Account numbers don't match",
  path: ["confirm_account_number"],
});

export default function PaymentSettingsPage() {
  const profile = useAuthStore((s) => s.profile) as PurohitResponse | null;
  const setProfile = useAuthStore((s) => s.setProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upiForm = useForm<z.infer<typeof upiSchema>>({
    resolver: zodResolver(upiSchema),
    defaultValues: {
      upi_id: profile?.upi_id || "",
    },
  });

  const bankForm = useForm<z.infer<typeof bankSchema>>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      account_number: profile?.bank_account_number || "",
      confirm_account_number: profile?.bank_account_number || "",
      ifsc_code: profile?.ifsc_code || "",
    },
  });

  async function onSubmitUpi(values: z.infer<typeof upiSchema>) {
    try {
      setIsSubmitting(true);
      await setupPayout({
        payout_method: "UPI",
        upi_id: values.upi_id,
      });
      toast.success("UPI ID Verified & Linked", {
        description: "Your payouts will now be automatically sent to this UPI ID.",
      });
      // Optionally re-fetch profile or update store
      if (profile) {
        setProfile({ ...profile, payout_method: "UPI", upi_id: values.upi_id });
      }
    } catch (error) {
      toast.error("Setup Failed", {
        description: error instanceof ApiError ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmitBank(values: z.infer<typeof bankSchema>) {
    try {
      setIsSubmitting(true);
      await setupPayout({
        payout_method: "BANK",
        bank_account_number: values.account_number,
        ifsc_code: values.ifsc_code,
      });
      toast.success("Bank Account Verified & Linked", {
        description: "Your payouts will now be automatically routed via IMPS/NEFT.",
      });
      if (profile) {
        setProfile({ 
          ...profile, 
          payout_method: "BANK", 
          bank_account_number: values.account_number,
          ifsc_code: values.ifsc_code 
        });
      }
    } catch (error) {
      toast.error("Setup Failed", {
        description: error instanceof ApiError ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payout Settings</h2>
        <p className="text-muted-foreground mt-2">
          Configure where you want to receive your earnings. Payouts are sent automatically via RazorpayX instantly after a Puja completes.
        </p>
      </div>

      <Tabs defaultValue={profile?.payout_method === "BANK" ? "bank" : "upi"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upi" className="gap-2">
            <Banknote className="size-4" /> UPI (Instant)
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-2">
            <Building className="size-4" /> Bank Transfer
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upi">
          <Card>
            <CardHeader>
              <CardTitle>UPI Details</CardTitle>
              <CardDescription>
                Enter your preferred UPI ID (e.g. PhonePe, GPay, Paytm). 
                Zero-friction, instant 95% automated payouts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...upiForm}>
                <form onSubmit={upiForm.handleSubmit(onSubmitUpi)} className="space-y-6">
                  <FormField
                    control={upiForm.control}
                    name="upi_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UPI ID</FormLabel>
                        <FormControl>
                          <Input placeholder="yourname@okicici" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-saffron-600 hover:bg-saffron-700">
                    {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Save UPI ID
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Details</CardTitle>
              <CardDescription>
                Enter your standard bank account details for NEFT/IMPS transfers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...bankForm}>
                <form onSubmit={bankForm.handleSubmit(onSubmitBank)} className="space-y-6">
                  <FormField
                    control={bankForm.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bankForm.control}
                    name="confirm_account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account number again" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bankForm.control}
                    name="ifsc_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                          <Input placeholder="SBIN0001234" className="uppercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-saffron-600 hover:bg-saffron-700">
                    {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Save Bank Details
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
