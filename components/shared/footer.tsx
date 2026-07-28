import Image from "next/image";
import { Link } from "@/navigation";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-md mt-auto z-40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Copy */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-400">
              PujaConnect
            </span>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>

          {/* ULMIND Official Branding */}
          <div className="flex flex-col items-center space-y-3 group">
            <div className="flex items-center text-sm text-slate-400 font-medium tracking-wide">
              Built with <Heart className="size-4 text-red-500 mx-1.5 animate-pulse" /> by
            </div>
            <a 
              href="https://ulmind.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative transition-transform duration-300 group-hover:scale-105"
            >
              <Image 
                src="/images/ulmind-official-logo.png" 
                alt="ULMIND Official Logo" 
                width={120} 
                height={40} 
                className="opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-md"
              />
            </a>
          </div>

          {/* Quick Links */}
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <Link href="/" className="hover:text-amber-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-amber-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-amber-500 transition-colors">
              Contact Us
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
