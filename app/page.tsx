import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapIcon, TruckIcon, StoreIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TruckIcon className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-blue-900">DeliverTrack</span>
          </div>
          <div className="flex space-x-2">
            <Link href="/login">
              <Button variant="outline" size="sm">Log in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900 sm:text-5xl">
              Real-Time Delivery Tracking System
            </h1>
            <p className="mt-6 text-xl text-gray-600">
              Connect vendors, delivery partners, and customers with our powerful real-time tracking platform.
            </p>
            <div className="mt-10 flex space-x-4">
              <Link href="/register?role=vendor">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <StoreIcon className="h-5 w-5 mr-2" />
                  For Vendors
                </Button>
              </Link>
              <Link href="/register?role=delivery">
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  For Delivery Partners
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-64 md:h-96 overflow-hidden rounded-xl shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-80"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MapIcon className="h-32 w-32 text-white opacity-75" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <StoreIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Vendor Dashboard</h3>
              <p className="text-gray-600">Assign delivery partners to orders and track their progress in real-time.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Delivery Partner App</h3>
              <p className="text-gray-600">View assigned orders and update location in real-time during deliveries.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <MapIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Customer Tracking</h3>
              <p className="text-gray-600">Track deliveries in real-time with accurate location updates on an interactive map.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <TruckIcon className="h-6 w-6" />
              <span className="font-bold text-xl">DeliverTrack</span>
            </div>
            <div className="text-sm text-blue-200">
              © 2025 DeliverTrack. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}