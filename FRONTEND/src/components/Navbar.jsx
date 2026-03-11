import React from "react";
import { EnvelopeIcon, PresentationChartLineIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-8 py-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30 text-white">
            <EnvelopeIcon className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Email Telemetry
          </span>
        </div>

        {/* Links / Icons */}
        <div className="flex items-center space-x-6 text-slate-400">
          <a href="#" className="hover:text-white transition-colors flex items-center space-x-2">
            <PresentationChartLineIcon className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          {/* Add more links if needed */}
        </div>

        {/* User Profile / Action */}
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-sm font-semibold text-white shadow-lg border-2 border-slate-800">
            VT
          </div>
        </div>
      </div>
    </nav>
  );
}
