'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Truck, MapPin, Calendar, Clock } from 'lucide-react';
import Navbar from '@/components/home/navbar/navbar';
import { authService } from '@/services/auth.service';
import { toast } from 'react-hot-toast';

export default function MyShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const token = sessionStorage.getItem('user_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/tracking/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch shipments');
        }

        const data = await response.json();
        setShipments(Array.isArray(data) ? data : data.shipments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    fetchShipments();
  }, [router]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in transit':
        return 'bg-blue-100 text-blue-800';
      case 'out for delivery':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (trackingId) => {
    if (!window.confirm('Are you sure you want to delete this shipment?')) return;
    try {
      const token = sessionStorage.getItem('user_token');
      const response = await fetch(`http://localhost:5000/api/tracking/delete/${trackingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete shipment');
      setShipments((prev) => prev.filter((s) => s.trackingId !== trackingId));
      toast.success('Shipment deleted successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Debug: log all tracking IDs
  useEffect(() => {
    if (shipments.length > 0) {
      console.log('Shipments trackingIds:', shipments.map(s => s.trackingId));
    }
  }, [shipments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-black mb-2">My Shipments</h1>
            <p className="text-gray-600 text-lg">Track and manage all your shipments in one place.</p>
          </div>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => router.push('/create-shipment')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Create New Shipment
            </button>
          </div>
          {shipments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-black mb-2">No shipments found</h3>
              <p className="text-gray-500 mb-6">You haven't created any shipments yet.</p>
              <button
                onClick={() => router.push('/create-shipment')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Create New Shipment
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {shipments.map((shipment) => {
                console.log('Shipment:', shipment);
                return (
                  <div key={shipment._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Package className="h-8 w-8 text-yellow-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-black">
                              Tracking ID: {shipment.trackingId}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Created {new Date(shipment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-black`}>
                          {shipment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="ml-3">
                            <p className="text-sm text-gray-500">Current Location</p>
                            <p className="text-base font-medium text-black">{shipment.currentLocation}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="ml-3">
                            <p className="text-sm text-gray-500">Destination</p>
                            <p className="text-base font-medium text-black">{shipment.destination}</p>
                          </div>
                        </div>
                        {shipment.packageDetails && (
                          <div className="flex items-start">
                            <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div className="ml-3">
                              <p className="text-sm text-gray-500">Package Details</p>
                              <p className="text-base font-medium text-black">
                                {shipment.packageDetails.type} • {shipment.packageDetails.weight}kg
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => router.push(`/track-package?trackingId=${shipment.trackingId}`)}
                          className="px-6 py-2.5 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          Track
                        </button>
                        <button
                          onClick={() => handleDelete(shipment.trackingId)}
                          className="px-6 py-2.5 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
