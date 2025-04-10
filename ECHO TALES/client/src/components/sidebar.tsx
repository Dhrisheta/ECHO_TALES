import { FC } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Mic2, 
  History, 
  Settings, 
  HelpCircle, 
  User,
  Book,
  Sparkles
} from 'lucide-react';

const Sidebar: FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="hidden md:flex md:w-64 bg-white shadow-md flex-col h-screen">
      <div className="p-4 border-b border-neutral-200">
        <h1 className="font-heading font-semibold text-2xl text-primary">Echo Tales</h1>
        <p className="text-sm text-neutral-300">Interactive Story Studio</p>
      </div>
      
      <nav className="p-2 flex-1">
        <ul>
          <li className="mb-1">
            <Link href="/" className={`flex items-center p-3 rounded-lg ${isActive('/') ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral-300 hover:bg-neutral-100'}`}>
              <Book className="mr-3 h-5 w-5" />
              <span>Story Generator</span>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/voice" className={`flex items-center p-3 rounded-lg ${isActive('/voice') ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral-300 hover:bg-neutral-100'}`}>
              <Mic2 className="mr-3 h-5 w-5" />
              <span>Voice Studio</span>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/history" className={`flex items-center p-3 rounded-lg ${isActive('/history') ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral-300 hover:bg-neutral-100'}`}>
              <History className="mr-3 h-5 w-5" />
              <span>My Stories</span>
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/settings" className={`flex items-center p-3 rounded-lg ${isActive('/settings') ? 'bg-primary bg-opacity-10 text-primary' : 'text-neutral-300 hover:bg-neutral-100'}`}>
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
  );
};

export default Sidebar;
