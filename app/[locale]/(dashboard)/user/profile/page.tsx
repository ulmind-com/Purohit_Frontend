"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { updateMyProfile } from "@/lib/api/users";
import { 
  User, Mail, Phone, MapPin, Home, Briefcase,
  Loader2, Trash2, Camera, Plus, Map, Calendar, Clock
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormMessage, FormLabel
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserResponse, UserUpdatePayload } from "@/types";
import { ProfileFormSkeleton } from "@/components/shared/loading-skeletons";
import { GotraCombobox, RashiSelect } from "@/components/shared/astrology-inputs";

const familyMemberSchema = z.object({
  member_id: z.string().optional(),
  name: z.string().min(2, "Name required"),
  relation: z.string().min(2, "Relation required"),
  gotra: z.string().nullable().optional(),
  rashi: z.string().nullable().optional(),
});

const addressSchema = z.object({
  address_id: z.string().optional(),
  tag: z.string().min(1, "Tag required"),
  flat: z.string().nullable().optional(),
  area: z.string().min(1, "Area required"),
  city: z.string().min(1, "City required"),
  pincode: z.string().min(4, "Pincode required"),
  is_default: z.boolean().optional(),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
});

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  gotra: z.string().nullable().optional(),
  rashi: z.string().nullable().optional(),
  dob: z.string().nullable().optional(),
  birth_time: z.string().nullable().optional(),
  birth_place: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }).nullable().optional(),
  family_members: z.array(familyMemberSchema).optional(),
  saved_addresses: z.array(addressSchema).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function UserProfilePage() {
  const profile = useAuthStore((s) => s.profile) as UserResponse | null;
  const setProfile = useAuthStore((s) => s.setProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      gotra: "",
      rashi: "",
      dob: "",
      birth_time: "",
      birth_place: null,
      family_members: [],
      saved_addresses: [],
    },
  });

  const { fields: familyFields, append: appendFamily, remove: removeFamily } = useFieldArray({
    control: form.control,
    name: "family_members",
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control: form.control,
    name: "saved_addresses",
  });

  const formControl = form.control as any;

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.mobile_number,
        gotra: profile.gotra || "",
        rashi: profile.rashi || "",
        dob: profile.dob || "",
        birth_time: profile.birth_time || "",
        birth_place: profile.birth_place,
        family_members: profile.family_members || [],
        saved_addresses: profile.saved_addresses || [],
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: UserUpdatePayload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        gotra: data.gotra || null,
        rashi: data.rashi || null,
        dob: data.dob || null,
        birth_time: data.birth_time || null,
        birth_place: data.birth_place || null,
        // Remove undefined optional fields before sending to API
        family_members: data.family_members?.map(fm => ({
          member_id: fm.member_id || crypto.randomUUID(),
          name: fm.name,
          relation: fm.relation,
          gotra: fm.gotra || null,
          rashi: fm.rashi || null,
        })) || [],
        saved_addresses: data.saved_addresses?.map(addr => ({
          address_id: addr.address_id || crypto.randomUUID(),
          tag: addr.tag,
          flat: addr.flat || null,
          area: addr.area,
          city: addr.city,
          pincode: addr.pincode,
          is_default: addr.is_default ?? false,
          location: addr.location,
        })) || [],
      };
      
      const updated = await updateMyProfile(payload);
      setProfile(updated);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/users/me/profile-picture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${useAuthStore.getState().accessToken || ""}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");
      const updatedUser = await response.json();
      setProfile(updatedUser);
      toast.success("Profile picture updated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const currentName = form.watch("name");
  const currentEmail = form.watch("email");

  if (!profile) return <ProfileFormSkeleton />;

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-12">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* HERO SECTION */}
        <motion.div variants={fadeSlideUp} initial="hidden" animate="show" className="flex flex-col items-center justify-center pt-6 pb-2 space-y-4 text-center">
          <div className="relative group cursor-pointer" onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF7A00] to-[#FF004D] blur-md opacity-30 animate-pulse"></div>
            <Avatar className="w-24 h-24 border-2 border-background shadow-xl relative z-10 overflow-hidden transition-all duration-300">
              <AvatarImage src={profile.profile_picture || ""} alt="Profile" className={isUploadingPhoto ? "opacity-50 blur-sm" : ""} />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-[#FF7A00] to-[#FF004D] text-white">
                {getInitials(currentName || "User")}
              </AvatarFallback>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingPhoto ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
              </div>
            </Avatar>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{currentName}</h1>
            <p className="text-muted-foreground font-medium">{currentEmail}</p>
          </div>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-12 rounded-xl bg-muted/50 p-1">
                <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Personal Info</TabsTrigger>
                <TabsTrigger value="family" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Family & Sankalp</TabsTrigger>
                <TabsTrigger value="addresses" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Addresses</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-6">
                <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Personal Information</CardTitle>
                    <CardDescription>Update your contact and astrological details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField control={formControl} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={formControl} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={formControl} name="gotra" render={({ field }) => (
                        <FormItem><FormLabel>Gotra (Optional)</FormLabel><FormControl><GotraCombobox value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={formControl} name="rashi" render={({ field }) => (
                        <FormItem><FormLabel>Rashi (Optional)</FormLabel><FormControl><RashiSelect value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={formControl} name="dob" render={({ field }) => (
                        <FormItem><FormLabel>Date of Birth (YYYY-MM-DD)</FormLabel><FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={formControl} name="birth_time" render={({ field }) => (
                        <FormItem><FormLabel>Time of Birth (HH:MM)</FormLabel><FormControl><Input type="time" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="family" className="mt-6">
                <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Family Members</CardTitle>
                    <CardDescription>Add family members for dynamic Sankalp inclusion during Pujas.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AnimatePresence>
                      {familyFields.map((field, index) => (
                        <motion.div key={field.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 border rounded-xl bg-background space-y-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Member {index + 1}</h4>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeFamily(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={formControl} name={`family_members.${index}.name`} render={({ field }) => (
                              <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={formControl} name={`family_members.${index}.relation`} render={({ field }) => (
                              <FormItem><FormLabel>Relation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={formControl} name={`family_members.${index}.gotra`} render={({ field }) => (
                              <FormItem><FormLabel>Gotra</FormLabel><FormControl><GotraCombobox value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={formControl} name={`family_members.${index}.rashi`} render={({ field }) => (
                              <FormItem><FormLabel>Rashi</FormLabel><FormControl><RashiSelect value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendFamily({ name: "", relation: "", gotra: "", rashi: "" })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Family Member
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses" className="mt-6">
                <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Saved Addresses</CardTitle>
                    <CardDescription>Manage your locations for offline Pujas.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AnimatePresence>
                      {addressFields.map((field, index) => (
                        <motion.div key={field.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 border rounded-xl bg-background space-y-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Address {index + 1}</h4>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeAddress(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={formControl} name={`saved_addresses.${index}.tag`} render={({ field }) => (
                              <FormItem><FormLabel>Tag (e.g. Home, Office)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={formControl} name={`saved_addresses.${index}.area`} render={({ field }) => (
                              <FormItem><FormLabel>Area / Street</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={formControl} name={`saved_addresses.${index}.city`} render={({ field }) => (
                              <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={formControl} name={`saved_addresses.${index}.pincode`} render={({ field }) => (
                              <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                          {/* Note: In a real app we'd have a Map picker here to get lat/lng. For now, hardcode mock or let user know. */}
                          <div className="text-xs text-muted-foreground flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            Coordinate selection would happen via a Map component here. Default coordinates will be used.
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendAddress({ tag: "", area: "", city: "", pincode: "", is_default: false, location: { type: "Point", coordinates: [88.3639, 22.5726] } })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Address
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-12 px-8 bg-gradient-to-r from-[#FF7A00] to-[#FF004D] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold">
                {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving Profile...</> : "Save Complete Profile"}
              </Button>
            </div>
          </form>
        </Form>

      </div>
    </div>
  );
}
