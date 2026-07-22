"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Home, 
  Briefcase,
  MoreVertical,
  Loader2,
  Trash2,
  Edit2,
  Camera
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserResponse, Address } from "@/types";
import { ProfileFormSkeleton } from "@/components/shared/loading-skeletons";

// Zod Validation Schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// Animation Variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

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
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.mobile_number || "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.mobile_number,
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast.success("Profile updated successfully!");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // We use a direct fetch here to upload. Adjust auth headers if necessary (e.g., retrieving token from cookies or state)
      // Assuming Next.js app handles the token in cookies or via an interceptor in a real setup.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/users/me/profile-picture`, {
        method: "POST",
        headers: {
          // If you store token in localStorage or cookies, add it here.
          "Authorization": `Bearer ${useAuthStore.getState().accessToken || ""}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const updatedUser = await response.json();
      setProfile(updatedUser);
      toast.success("Profile picture updated!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong uploading the image");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const currentName = form.watch("name");
  const currentEmail = form.watch("email");

  if (!profile) {
    return <ProfileFormSkeleton />;
  }

  const renderIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("home")) return <Home className="w-5 h-5 text-muted-foreground" />;
    if (t.includes("work") || t.includes("office")) return <Briefcase className="w-5 h-5 text-muted-foreground" />;
    return <MapPin className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-12">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-3xl mx-auto p-4 md:p-8 space-y-8"
      >
        
        {/* HERO SECTION */}
        <motion.div variants={fadeSlideUp} className="flex flex-col items-center justify-center pt-6 pb-2 space-y-4 text-center">
          <div className="relative group cursor-pointer" onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF7A00] to-[#FF004D] blur-md opacity-30 animate-pulse"></div>
            <Avatar className="w-24 h-24 border-2 border-background shadow-xl relative z-10 overflow-hidden transition-all duration-300">
              <AvatarImage src={profile.profile_picture || ""} alt="Profile" className={isUploadingPhoto ? "opacity-50 blur-sm" : ""} />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-[#FF7A00] to-[#FF004D] text-white">
                {getInitials(currentName || "User")}
              </AvatarFallback>
              
              {/* Hover/Loading Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingPhoto ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </Avatar>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{currentName}</h1>
            <p className="text-muted-foreground font-medium">{currentEmail}</p>
          </div>
        </motion.div>

        {/* ACCOUNT DETAILS FORM */}
        <motion.div variants={fadeSlideUp}>
          <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl">Account Details</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative flex items-center">
                            <User className="absolute left-3.5 h-5 w-5 text-muted-foreground" />
                            <Input 
                              placeholder="Full Name" 
                              className="pl-11 focus-visible:ring-[#FF7A00]" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Mail className="absolute left-3.5 h-5 w-5 text-muted-foreground" />
                            <Input 
                              type="email"
                              placeholder="Email Address" 
                              className="pl-11 focus-visible:ring-[#FF7A00]" 
                              disabled
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Phone className="absolute left-3.5 h-5 w-5 text-muted-foreground" />
                            <Input 
                              type="tel"
                              placeholder="Phone Number" 
                              className="pl-11 focus-visible:ring-[#FF7A00]" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-2 md:flex md:justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full md:w-auto bg-gradient-to-r from-[#FF7A00] to-[#FF004D] hover:opacity-90 text-white font-medium shadow-md transition-opacity"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        {/* SAVED ADDRESSES */}
        <motion.div variants={fadeSlideUp}>
          <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Saved Addresses</CardTitle>
                  <CardDescription>Manage locations for Puja services.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!profile.addresses || profile.addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-border/60 rounded-xl bg-muted/30">
                  <MapPin className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground text-sm mb-4">No saved addresses found.</p>
                  <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
                    Add New Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {profile.addresses.map((address) => (
                      <motion.div
                        key={address.address_id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors group"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 border border-border/40 mr-4">
                          {renderIcon(address.title)}
                        </div>
                        <div className="flex-1 min-w-0 mr-4">
                          <h4 className="font-semibold text-foreground capitalize truncate">{address.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                            {address.street}, {address.city}, {address.state} {address.zip_code}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => { toast.info("Delete functionality coming soon") }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <div className="pt-3">
                    <Button variant="outline" className="w-full border-dashed border-2 text-muted-foreground hover:text-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      Add New Address
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
      </motion.div>
    </div>
  );
}
