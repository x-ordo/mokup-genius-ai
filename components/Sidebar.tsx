import React from 'react';
import { AppView } from '../types';
import { LayoutGrid, ImagePlus, Wand2, Upload } from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: AppView.MOCKUP, label: 'Product Mockups', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: AppView.GENERATE, label: 'Generate Assets', icon: <ImagePlus className="w-5 h-5" /> },
    { id: AppView.EDIT, label: 'AI Editor', icon: <Wand2 className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 flex items-center gap-2">
           <Upload className="w-6 h-6 text-indigo-600" />
           MockupGenius
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === item.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 bg-gray-50 m-4 rounded-xl border border-gray-200">
        <p className="text-xs text-gray-500 font-medium mb-1">Powered by</p>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
             Gemini 2.5 Flash
          </span>
          <span className="text-xs text-pink-600 font-semibold flex items-center gap-1">
             Gemini 3 Pro
          </span>
        </div>
      </div>
    </div>
  );
};