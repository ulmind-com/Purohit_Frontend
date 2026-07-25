"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, X, Lock, Loader2, Music, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SecureCloudinaryUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  resourceType?: "image" | "video" | "raw" | "auto";
  accept?: string;
  multiple?: boolean;
  variant?: "audio" | "gallery" | "kyc" | "default";
  maxFiles?: number;
  className?: string;
}

export function SecureCloudinaryUpload({
  value,
  onChange,
  resourceType = "auto",
  accept = "image/*",
  multiple = false,
  variant = "default",
  maxFiles = 5,
  className,
}: SecureCloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    if (multiple && Array.isArray(value) && value.length + filesArray.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    setIsUploading(true);

    try {
      // 1. Get Signature
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/media/generate-signature`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token in localStorage
        },
      });

      if (!res.ok) {
        throw new Error("Failed to get upload signature");
      }

      const { signature, timestamp, api_key, cloud_name } = await res.json();

      const uploadedUrls: string[] = [];

      // 2. Upload to Cloudinary
      for (const file of filesArray) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", api_key);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        // We aren't using upload_preset for signed uploads natively, just signature

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          throw new Error("Upload failed");
        }

        const uploadData = await uploadRes.json();
        uploadedUrls.push(uploadData.secure_url);
      }

      if (multiple) {
        onChange([...(Array.isArray(value) ? value : []), ...uploadedUrls]);
      } else {
        onChange(uploadedUrls[0]);
      }

      toast.success("Upload successful!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during upload. Please try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleRemove = (urlToRemove: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((url) => url !== urlToRemove));
    } else {
      onChange("");
    }
  };

  const renderPreview = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    if (variant === "kyc" && typeof value === "string") {
      return (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-saffron-200 bg-saffron-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-saffron-100 text-saffron-600">
              <Lock className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Document Uploaded Securely</span>
              <span className="text-xs text-muted-foreground">Encrypted and safely stored.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleRemove(value)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      );
    }

    if (variant === "audio" && typeof value === "string") {
      return (
        <div className="mt-4 flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Music className="size-5" />
            </div>
            <audio src={value} controls className="h-10 w-full max-w-[200px] sm:max-w-[300px]" />
          </div>
          <button
            type="button"
            onClick={() => handleRemove(value)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      );
    }

    if (variant === "gallery" && Array.isArray(value)) {
      return (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((url, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border">
              <img src={url} alt="Gallery item" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 backdrop-blur-md transition-opacity hover:bg-black/70 group-hover:opacity-100"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    // Default image preview (single)
    if (typeof value === "string") {
      return (
        <div className="group relative mt-4 aspect-video w-full max-w-sm overflow-hidden rounded-xl border">
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => handleRemove(value)}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-md hover:bg-black/70"
          >
            <X className="size-4" />
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={cn("w-full", className)}>
      {(!value || (Array.isArray(value) && value.length < maxFiles && multiple)) && (
        <div
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 transition-all hover:bg-muted/50",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleUpload(e.target.files as FileList)}
            disabled={isUploading}
          />

          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            {isUploading ? (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            ) : variant === "audio" ? (
              <Music className="size-6 text-muted-foreground" />
            ) : variant === "kyc" ? (
              <Lock className="size-6 text-muted-foreground" />
            ) : (
              <ImageIcon className="size-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium">
              {isUploading ? "Uploading to secure vault..." : "Click to upload or drag and drop"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {variant === "kyc"
                ? "Your document (Aadhaar/Voter ID) is highly encrypted, securely stored, and never shared publicly."
                : `Upload ${multiple ? "multiple files" : "a file"} (${accept})`}
            </p>
          </div>
        </div>
      )}
      
      {renderPreview()}
    </div>
  );
}
