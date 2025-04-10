import { FC } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, Mic2, History, Settings, User, Book, Sparkles } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const MobileHeader: FC = () => {
  const [location] = useLocation();
  
  return (
    <header className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between">
      <h1 className="font-heading font-semibold text-xl text-primary">Echo Tales</h1>
      <Sheet>
        <SheetTrigger asChild>
          <button type="button" className="p-2">
            <Menu />
          </button>
        </SheetTrigger>
        <SheetContent side="right">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="font-heading font-semibold text-xl text-primary">Echo Tales</h2>
              <p className="text-sm text-neutral-300">Interactive Story Studio</p>
            </div>
            
            <nav className="p-2 flex-1">
              <ul>
                <li className="mb-1">
                  <Link href="/" className={`flex items-center p-3 rounded-lg ${location === '/' ? 'text-primary bg-primary bg-opacity-10' : 'text-neutral-300 hover:bg-neutral-100'}`}>
                    <Book className="mr-3 h-5 w-5" />
                    <span>Story Generator</span>
                  </Link>
                </li>
                <li className="mb-1">
                  <Link href="/voice" className={`flex items-center p-3 rounded-lg ${location === '/voice' ? 'text-primary bg-primary bg-opacity-10' : 'text-neutral-300 hover:bg-neutral-100'}`}>
                    <Mic2 className="mr-3 h-5 w-5" />
                    <span>Voice Studio</span>
                  </Link>
                </li>
                <li className="mb-1">
                  <Link href="/history" className={`flex items-center p-3 rounded-lg ${location === '/history' ? 'text-primary bg-primary bg-opacity-10' : 'text-neutral-300 hover:bg-neutral-100'}`}>
                    <History className="mr-3 h-5 w-5" />
                    <span>My Stories</span>
                  </Link>
                </li>
                <li className="mb-1">
                  <Link href="/settings" className={`flex items-center p-3 rounded-lg ${location === '/settings' ? 'text-primary bg-primary bg-opacity-10' : 'text-neutral-300 hover:bg-neutral-100'}`}>
                    <Settings className="mr-3 h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </li>
              </ul>
            </nav>
            
            <div className="p-4 border-t border-neutral-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">Guest User</p>
                  <p className="text-xs text-neutral-300">Free Plan</p>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export const MobileBottomNav: FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="md:hidden bg-white border-t border-neutral-200 px-4 py-2">
      <div className="flex justify-around">
        <Link href="/" className={`flex flex-col items-center py-1 ${isActive('/') ? 'text-primary' : 'text-neutral-300'}`}>
          <Book className="h-6 w-6" />
          <span className="text-xs mt-1">Stories</span>
        </Link>
        <Link href="/voice" className={`flex flex-col items-center py-1 ${isActive('/voice') ? 'text-primary' : 'text-neutral-300'}`}>
          <Mic2 className="h-6 w-6" />
          <span className="text-xs mt-1">Voices</span>
        </Link>
        <Link href="/history" className={`flex flex-col items-center py-1 ${isActive('/history') ? 'text-primary' : 'text-neutral-300'}`}>
          <History className="h-6 w-6" />
          <span className="text-xs mt-1">Library</span>
        </Link>
        <Link href="/profile" className={`flex flex-col items-center py-1 ${isActive('/profile') ? 'text-primary' : 'text-neutral-300'}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};
