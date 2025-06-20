'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, MapPin, User, Phone, Mail, Truck } from 'lucide-react';
import Navbar from '@/components/home/navbar/navbar';

export default function CreateShipment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    senderCity: '',
    senderState: '',
    senderPostalCode: '',
    senderCountry: '',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    receiverAddress: '',
    receiverCity: '',
    receiverState: '',
    receiverPostalCode: '',
    receiverCountry: '',
    packageType: 'standard',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    description: '',
    specialInstructions: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('dimensions.')) {
      const dimension = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimension]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('user_token');
      if (!token) {
        router.push('/');
        return;
      }

      // Format the data according to the backend requirements
      const formattedData = {
        sender: {
          name: formData.senderName,
          email: formData.senderEmail,
          phone: formData.senderPhone
        },
        receiver: {
          name: formData.receiverName,
          email: formData.receiverEmail,
          phone: formData.receiverPhone
        },
        origin: `${formData.senderAddress}, ${formData.senderCity}, ${formData.senderState} ${formData.senderPostalCode}, ${formData.senderCountry}`,
        destination: `${formData.receiverAddress}, ${formData.receiverCity}, ${formData.receiverState} ${formData.receiverPostalCode}, ${formData.receiverCountry}`,
        status: 'Pending',
        currentLocation: 'Not Updated',
        packageDetails: {
          type: formData.packageType,
          weight: formData.weight,
          dimensions: formData.dimensions,
          description: formData.description,
          specialInstructions: formData.specialInstructions
        }
      };

      const response = await fetch('http://localhost:5000/api/tracking/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create shipment');
      }

      const data = await response.json();
       console.log('New shipment response:', data);
      const trackingId = data.newTrack?.trackingId;
      if (!trackingId) throw new Error('No tracking ID returned');
      // Poll for trackingId availability
      let found = false, attempts = 0;
      while (!found && attempts < 10) {
        try {
          const verifyRes = await fetch('http://localhost:5000/api/tracking/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trackingId })
          });
          if (verifyRes.ok) {
            found = true;
            break;
          }
        } catch {}
        await new Promise(res => setTimeout(res, 500));
        attempts++;
      }
      if (!found) throw new Error('Tracking ID not available after creation. Please try again.');
      router.push(`/track-package?trackingId=${trackingId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gray-50">
  <Navbar />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-28">
  <div className="text-center mb-16">
  <h1 className="text-5xl font-bold text-gray-900 mb-6">Create New Shipment</h1>
  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
  Fill in the comprehensive details below to create your shipment. We ensure secure processing and real-time tracking for all your packages.
  </p>
  </div>
  
  <form onSubmit={handleSubmit} className="w-full space-y-16">
  {error && (
  <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
  <p className="text-red-800 font-medium">{error}</p>
  </div>
  )}
  
  {/* First Row: Sender and Receiver */}
  <div className="flex flex-col lg:flex-row gap-12 mb-16">
  {/* Left: Sender */}
  <div className="flex-1 min-w-0">
  {/* Sender Information */}
  <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
  <h2 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
  <User className="h-7 w-7 mr-3 text-yellow-500" />
  Sender Information
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Full Name</label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  required
                  placeholder="Enter sender's complete full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Phone Number</label>
                <input
                  type="tel"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleChange}
                  required
                  placeholder="Enter sender's contact phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Email Address</label>
                <input
                  type="email"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  required
                  placeholder="Enter sender's email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Street Address</label>
                <input
                  type="text"
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  required
                  placeholder="Enter complete street address with house number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">City</label>
                <input
                  type="text"
                  name="senderCity"
                  value={formData.senderCity}
                  onChange={handleChange}
                  required
                  placeholder="Enter city name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">State/Province</label>
                <input
                  type="text"
                  name="senderState"
                  value={formData.senderState}
                  onChange={handleChange}
                  required
                  placeholder="Enter state or province"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Postal Code</label>
                <input
                  type="text"
                  name="senderPostalCode"
                  value={formData.senderPostalCode}
                  onChange={handleChange}
                  required
                  placeholder="Enter postal or zip code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Country</label>
                <input
                  type="text"
                  name="senderCountry"
                  value={formData.senderCountry}
                  onChange={handleChange}
                  required
                  placeholder="Enter country name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
            </div>
          </div>
            </div>

            {/* Right: Receiver */}
            <div className="flex-1 min-w-0">
              {/* Receiver Information */}
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
                  <Truck className="h-7 w-7 mr-3 text-yellow-500" />
                  Receiver Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Full Name</label>
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  required
                  placeholder="Enter receiver's complete full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Phone Number</label>
                <input
                  type="tel"
                  name="receiverPhone"
                  value={formData.receiverPhone}
                  onChange={handleChange}
                  required
                  placeholder="Enter receiver's contact phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Email Address</label>
                <input
                  type="email"
                  name="receiverEmail"
                  value={formData.receiverEmail}
                  onChange={handleChange}
                  required
                  placeholder="Enter receiver's email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Street Address</label>
                <input
                  type="text"
                  name="receiverAddress"
                  value={formData.receiverAddress}
                  onChange={handleChange}
                  required
                  placeholder="Enter complete street address with house number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">City</label>
                <input
                  type="text"
                  name="receiverCity"
                  value={formData.receiverCity}
                  onChange={handleChange}
                  required
                  placeholder="Enter city name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">State/Province</label>
                <input
                  type="text"
                  name="receiverState"
                  value={formData.receiverState}
                  onChange={handleChange}
                  required
                  placeholder="Enter state or province"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Postal Code</label>
                <input
                  type="text"
                  name="receiverPostalCode"
                  value={formData.receiverPostalCode}
                  onChange={handleChange}
                  required
                  placeholder="Enter postal or zip code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Country</label>
                <input
                  type="text"
                  name="receiverCountry"
                  value={formData.receiverCountry}
                  onChange={handleChange}
                  required
                  placeholder="Enter country name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                />
              </div>
            </div>
              </div>
            </div>
          </div>

          {/* Second Row: Package Information and Additional Information */}
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left: Package Information */}
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
                  <Package className="h-7 w-7 mr-3 text-yellow-500" />
                  Package Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Package Type</label>
                    <select
                      name="packageType"
                      value={formData.packageType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                    >
                      <option value="" disabled className="text-gray-900">Select package type</option>
                      <option value="standard" className="text-gray-900">Standard Delivery (3-5 days)</option>
                      <option value="express" className="text-gray-900">Express Delivery (1-2 days)</option>
                      <option value="fragile" className="text-gray-900">Fragile Items (Special Handling)</option>
                      <option value="oversized" className="text-gray-900">Oversized Items (Special Handling)</option>
                    </select>
                    <p className="mt-2 text-sm text-gray-600">Choose the appropriate delivery type for your package</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.1"
                      placeholder="Enter package weight in kilograms"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                    />
                    <p className="mt-2 text-sm text-gray-600">Enter weight in kilograms (e.g., 2.5)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Length (cm)</label>
                    <input
                      type="number"
                      name="dimensions.length"
                      value={formData.dimensions.length}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="Enter package length in centimeters"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                    />
                    <p className="mt-2 text-sm text-gray-600">Enter length in centimeters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Width (cm)</label>
                    <input
                      type="number"
                      name="dimensions.width"
                      value={formData.dimensions.width}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="Enter package width in centimeters"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                    />
                    <p className="mt-2 text-sm text-gray-600">Enter width in centimeters</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-3">Height (cm)</label>
                    <input
                      type="number"
                      name="dimensions.height"
                      value={formData.dimensions.height}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="Enter package height in centimeters"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base"
                    />
                    <p className="mt-2 text-sm text-gray-600">Enter height in centimeters</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Additional Information */}
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
                  <MapPin className="h-7 w-7 mr-3 text-yellow-500" />
                  Additional Information
                </h2>
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Package Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Provide a detailed description of your package contents (e.g., 'Electronics - Laptop and accessories', 'Clothing - Winter jackets and boots', 'Documents - Legal contracts and certificates')"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base resize-none"
                    />
                    <p className="mt-2 text-sm text-gray-600">Provide a clear and detailed description of the package contents for customs and handling purposes</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Special Instructions</label>
                    <textarea
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Add any special handling instructions or delivery requirements (e.g., 'Handle with extreme care - fragile electronics', 'Keep upright at all times', 'Temperature sensitive - avoid heat', 'Signature required upon delivery')"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 text-base resize-none"
                    />
                    <p className="mt-2 text-sm text-gray-600">Add any special handling requirements or delivery instructions to ensure safe transport</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-4 sm:space-y-0 sm:space-x-6 mt-16 pt-8 border-t border-gray-200">
          <button
          type="button"
          onClick={() => router.push('/my-shipments')}
          className="px-8 py-4 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200"
          >
          Cancel
          </button>
          <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
          {loading ? 'Creating Shipment...' : 'Create Shipment'}
          </button>
          </div>
          </form>
          </div>
          </div>
          );
          }