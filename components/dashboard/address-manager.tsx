"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LocationMapPicker, type PickedLocation } from "@/components/map/location-map-picker";
import { addressSchema, type AddressFormValues } from "@/lib/validators/profile";
import { addAddress, removeAddress } from "@/lib/api/users";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/api/axios";
import type { Address, UserResponse } from "@/types";

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState<PickedLocation | null>(null);
  const setProfile = useAuthStore((s) => s.setProfile);
  const profile = useAuthStore((s) => s.profile) as UserResponse | null;

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { title: "", street: "", city: "", state: "", zip_code: "" },
  });

  const addMutation = useMutation({
    mutationFn: addAddress,
    onSuccess: (newAddress) => {
      if (profile) {
        setProfile({ ...profile, addresses: [...profile.addresses, newAddress] });
      }
      toast.success("Address saved");
      setOpen(false);
      form.reset();
      setLocation(null);
    },
    onError: (error) => {
      toast.error("Couldn't save address", {
        description: error instanceof ApiError ? error.message : undefined,
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeAddress,
    onSuccess: (_, addressId) => {
      if (profile) {
        setProfile({
          ...profile,
          addresses: profile.addresses.filter((a) => a.address_id !== addressId),
        });
      }
      toast.success("Address removed");
    },
    onError: (error) => {
      toast.error("Couldn't remove address", {
        description: error instanceof ApiError ? error.message : undefined,
      });
    },
  });

  function onSubmit(values: AddressFormValues) {
    if (!location) {
      toast.error("Pin a location on the map first");
      return;
    }
    addMutation.mutate({
      ...values,
      location: { type: "Point", coordinates: [location.lng, location.lat] },
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Saved addresses</CardTitle>
          <CardDescription>Used to speed up your booking flow.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> Add address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add a new address</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Label</FormLabel>
                        <FormControl>
                          <Input placeholder="Home, Office..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>ZIP / PIN code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel>Pin exact location</FormLabel>
                  <LocationMapPicker
                    className="mt-2"
                    mapHeight="220px"
                    onChange={setLocation}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={addMutation.isPending} className="w-full">
                    Save address
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {addresses.length === 0 && (
          <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            No saved addresses yet.
          </p>
        )}
        {addresses.map((address) => (
          <div
            key={address.address_id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
          >
            <div className="flex items-start gap-2 min-w-0">
              <MapPin className="mt-0.5 size-4 shrink-0 text-saffron-500" />
              <div className="min-w-0">
                <p className="font-medium">{address.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {address.street}, {address.city}, {address.state} {address.zip_code}
                </p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => removeMutation.mutate(address.address_id)}
              disabled={removeMutation.isPending}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
