'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle, 
  CreditCard, 
  Package, 
  Shield, 
  Truck, 
  MapPin, 
  User,
  Lock,
  Sparkles,
  ChevronRight,
  Clock
} from 'lucide-react';

/* ---------------------- Types ---------------------- */

interface ISizeOption {
  _id?: string;
  size: string;
  price: number;
  offerPrice?: number;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
}

interface IStyleOption {
  _id?: string;
  name: string;
  additionalPrice?: number;
}

interface Product {
  _id: string;
  title: string;
  basePrice: number;
  offerPrice?: number;
  description: string;
  detailedDescription?: string;
  category: string;
  subCategory?: string;
  material: string;
  style?: string;
  occasion?: string;
  isAvailable: boolean;
  stockQuantity: number;
  sku: string;
  sizes: ISizeOption[];
  styles: IStyleOption[];
  images: string[];
  featuredImage: string;
  tags: string[];
  weight?: number;
  deliveryEstimate: string;
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    unit: string;
  };
  frameType?: 'wall' | 'tabletop' | 'standing';
  shape?: 'square' | 'rectangle' | 'round' | 'oval' | 'heart';
  mountingType?: string;
  hasGlass?: boolean;
  glassType?: 'standard' | 'non-glare' | 'uv-protected' | 'acrylic';
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  totalSold?: number;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: AddressFormData;
}

interface PaymentFormData {
  method: 'COD' | 'Prepaid';
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  upiId?: string;
}

/* ---------------- Customer Info Step ---------------- */

function CustomerInfoForm({
  data,
  onChange,
  onNext
}: {
  data: CustomerFormData;
  onChange: (data: CustomerFormData) => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData | 'pincode' | 'street' | 'city' | 'state' | 'country', string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof CustomerFormData | 'pincode' | 'street' | 'city' | 'state' | 'country', string>> = {};
    
    if (!data.name.trim()) newErrors.name = 'Name is required';
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!data.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(data.phone)) {
      newErrors.phone = 'Invalid phone number (10 digits)';
    }
    
    if (!data.address.street.trim()) newErrors.street = 'Street address is required';
    if (!data.address.city.trim()) newErrors.city = 'City is required';
    if (!data.address.state.trim()) newErrors.state = 'State is required';
    if (!data.address.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(data.address.pincode)) {
      newErrors.pincode = 'Invalid pincode (6 digits)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) onNext();
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.35s_ease-out]">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/30">
          <User className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
          <p className="text-sm text-gray-500">Enter your details for delivery</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div className="transition-transform duration-200 ease-out hover:-translate-y-0.5">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border bg-white/90 backdrop-blur-sm text-sm transition-all duration-200
                ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/15`}
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="transition-transform duration-200 ease-out hover:-translate-y-0.5">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onChange({ ...data, email: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border bg-white/90 backdrop-blur-sm text-sm transition-all duration-200
                ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/15`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="transition-transform duration-200 ease-out hover:-translate-y-0.5">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ ...data, phone: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border bg-white/90 backdrop-blur-sm text-sm transition-all duration-200
                ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/15`}
              placeholder="9876543210"
              maxLength={10}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          {/* Pincode */}
          <div className="transition-transform duration-200 ease-out hover:-translate-y-0.5">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Pincode *
            </label>
            <input
              type="text"
              value={data.address.pincode}
              onChange={(e) =>
                onChange({
                  ...data,
                  address: { ...data.address, pincode: e.target.value }
                })
              }
              className={`w-full px-4 py-3 rounded-xl border bg-white/90 backdrop-blur-sm text-sm transition-all duration-200
                ${errors.pincode ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/15`}
              placeholder="560001"
              maxLength={6}
            />
            {errors.pincode && <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>}
          </div>
        </div>

        {/* Street */}
        <div className="transition-transform duration-200 ease-out hover:-translate-y-0.5">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Street Address *
          </label>
          <textarea
            value={data.address.street}
            onChange={(e) =>
              onChange({
                ...data,
                address: { ...data.address, street: e.target.value }
              })
            }
            rows={2}
            className={`w-full px-4 py-3 rounded-xl border bg-white/90 backdrop-blur-sm text-sm transition-all duration-200
              ${errors.street ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
              focus:outline-none focus:ring-2 focus:ring-blue-500/15`}
            placeholder="House no., Building, Street, Area"
          />
          {errors.street && <p className="mt-1 text-xs text-red-600">{errors.street}</p>}
        </div>

        {/* City / State / Country */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="transition-transform duration-200 ease-out hover:-translate-y-0.5">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              City *
            </label>
            <input
              type="text"
              value={data.address.city}
              onChange={(e) =>
                onChange({
                  ...data,
                  address: { ...data.address, city: e.target.value }
                })
              }
              className={`w-full px-4 py-3 rounded-xl border bg-white/90 backdrop-blur-sm text-sm transition-all duration-200
                ${errors.city ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/15`}
              placeholder="Mumbai"
            />
            {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
          </div>

          <div className="transition-transform duration-200 ease-out hover:-translate-y-0.5">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              State *
            </label>
            <input
              type="text"
              value={data.address.state}
              onChange={(e) =>
                onChange({
                  ...data,
                  address: { ...data.address, state: e.target.value }
                })
              }
              className={`w-full px-4 py-3 rounded-xl border bg-white/90 backdrop-blur-sm text-sm transition-all duration-200
                ${errors.state ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/15`}
              placeholder="Maharashtra"
            />
            {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
          </div>

          <div className="transition-transform duration-200 ease-out hover:-translate-y-0.5">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Country *
            </label>
            <select
              value={data.address.country}
              onChange={(e) =>
                onChange({
                  ...data,
                  address: { ...data.address, country: e.target.value }
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all"
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>

        {/* Landmark */}
        <div className="transition-transform duration-200 ease-out hover:-translate-y-0.5">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Landmark (Optional)
          </label>
          <input
            type="text"
            value={data.address.landmark || ''}
            onChange={(e) =>
              onChange({
                ...data,
                address: { ...data.address, landmark: e.target.value }
              })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all text-sm"
            placeholder="Nearby landmark for easy delivery"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-2xl font-semibold text-sm md:text-base shadow-lg shadow-blue-500/20 hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          Continue to Shipping
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
}

/* ---------------- Shipping Step ---------------- */

function ShippingMethodForm({
  selectedMethod,
  onSelect,
  onNext,
  onBack
}: {
  selectedMethod: string;
  onSelect: (method: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const shippingOptions = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '4-7 business days',
      price: 0,
      freeOver: 999,
      icon: <Truck className="w-5 h-5" />
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '2-3 business days',
      price: 99,
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      id: 'next-day',
      name: 'Next Day Delivery',
      description: 'Guaranteed next day',
      price: 199,
      icon: <Clock className="w-5 h-5" />
    }
  ];

  return (
    <div className="space-y-6 animate-[fadeIn_0.35s_ease-out]">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/30">
          <Truck className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Shipping Method</h3>
          <p className="text-sm text-gray-500">Choose your preferred delivery option</p>
        </div>
      </div>

      <div className="space-y-3">
        {shippingOptions.map((option) => (
          <label
            key={option.id}
            className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
              ${
                selectedMethod === option.id
                  ? 'border-blue-500 bg-blue-50/70 shadow-md shadow-blue-100'
                  : 'border-gray-200 bg-white/80'
              }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl transition-colors
                  ${
                    selectedMethod === option.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {option.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm md:text-base">
                      {option.name}
                    </span>
                    {option.id === 'standard' && option.freeOver && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-[11px] font-semibold rounded-full">
                        Free over ₹{option.freeOver}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm md:text-lg font-bold text-gray-900">
                  {option.price === 0 ? 'FREE' : `₹${option.price}`}
                </span>
                <input
                  type="radio"
                  name="shipping"
                  value={option.id}
                  checked={selectedMethod === option.id}
                  onChange={(e) => onSelect(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 rounded-xl font-medium text-sm md:text-base text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm md:text-base shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          disabled={!selectedMethod}
        >
          Continue to Payment
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Payment Step ---------------- */

function PaymentMethodForm({
  data,
  onChange,
  onComplete,
  onBack,
  isProcessing
}: {
  data: PaymentFormData;
  onChange: (data: PaymentFormData) => void;
  onComplete: () => void;
  onBack: () => void;
  isProcessing: boolean;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof PaymentFormData, string>> = {};
    
    if (data.method === 'Prepaid') {
      if (!data.cardNumber?.trim() || data.cardNumber.length !== 16) {
        newErrors.cardNumber = 'Valid 16-digit card number required';
      }
      if (!data.expiry?.trim() || !/^\d{2}\/\d{2}$/.test(data.expiry)) {
        newErrors.expiry = 'MM/YY format required';
      }
      if (!data.cvv?.trim() || data.cvv.length !== 3) {
        newErrors.cvv = '3-digit CVV required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) onComplete();
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.35s_ease-out]">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-purple-500/30">
          <CreditCard className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
          <p className="text-sm text-gray-500">Complete your order with secure payment</p>
        </div>
      </div>

      {/* Payment options */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* COD */}
          <label
            className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              data.method === 'COD'
                ? 'border-blue-500 bg-blue-50/70 shadow-blue-100'
                : 'border-gray-200 bg-white/80'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    data.method === 'COD'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm md:text-base">Cash on Delivery</div>
                  <p className="text-xs md:text-sm text-gray-500">Pay when you receive</p>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={data.method === 'COD'}
                onChange={() => onChange({ ...data, method: 'COD' })}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
            </div>
          </label>

          {/* Prepaid */}
          <label
            className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              data.method === 'Prepaid'
                ? 'border-blue-500 bg-blue-50/70 shadow-blue-100'
                : 'border-gray-200 bg-white/80'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    data.method === 'Prepaid'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm md:text-base">Card / UPI</div>
                  <p className="text-xs md:text-sm text-gray-500">Instant secure payment</p>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                value="Prepaid"
                checked={data.method === 'Prepaid'}
                onChange={() => onChange({ ...data, method: 'Prepaid' })}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
            </div>
          </label>
        </div>

        {/* Card details */}
        {data.method === 'Prepaid' && (
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border-2 border-gray-200 space-y-4 shadow-sm animate-[fadeIn_0.25s_ease-out]">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Card Number *
              </label>
              <input
                type="text"
                value={data.cardNumber || ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)
                  })
                }
                className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all duration-200
                  ${errors.cardNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
                  focus:outline-none focus:ring-2 focus:ring-blue-500/15`}
                placeholder="1234 5678 9012 3456"
                maxLength={16}
              />
              {errors.cardNumber && (
                <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  value={data.expiry || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    onChange({ ...data, expiry: value.slice(0, 5) });
                  }}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all duration-200
                    ${errors.expiry ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500/15`}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                {errors.expiry && (
                  <p className="mt-1 text-xs text-red-600">{errors.expiry}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  CVV *
                </label>
                <input
                  type="password"
                  value={data.cvv || ''}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      cvv: e.target.value.replace(/\D/g, '').slice(0, 3)
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all duration-200
                    ${errors.cvv ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500/15`}
                  placeholder="123"
                  maxLength={3}
                />
                {errors.cvv && <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                UPI ID (Optional)
              </label>
              <input
                type="text"
                value={data.upiId || ''}
                onChange={(e) => onChange({ ...data, upiId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all"
                placeholder="username@upi"
              />
            </div>

            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
              <Lock className="w-4 h-4 text-green-600" />
              <span>Your payment is secured with 256-bit SSL encryption</span>
            </div>
          </div>
        )}

        {/* Security strip */}
        <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <Shield className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">100% Secure Payment</p>
            <p className="text-xs text-blue-700">All transactions are encrypted and secure</p>
          </div>
          <div className="flex gap-1">
            {['VISA', 'MC', 'RUPAY', 'UPI'].map((method) => (
              <div
                key={method}
                className="w-8 h-6 bg-white rounded-md border flex items-center justify-center"
              >
                <span className="text-[10px] font-semibold text-gray-700">{method}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 rounded-xl font-medium text-sm md:text-base text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm md:text-base shadow-lg shadow-purple-500/25 hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Complete Order
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Main BuyNow Page ---------------- */

const BuyNow = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [customerData, setCustomerData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      landmark: ''
    }
  });
  
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    method: 'COD'
  });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      const data = await res.json();
      setProduct(data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateShipping = () => {
    if (shippingMethod === 'standard') return 0;
    if (shippingMethod === 'express') return 99;
    if (shippingMethod === 'next-day') return 199;
    return 0;
  };

  const calculateTotal = () => {
    if (!product) return 0;
    const price = product.offerPrice || product.basePrice;
    const shipping = calculateShipping();
    const tax = (price + shipping) * 0.18;
    return price + shipping + tax;
  };

  const handleCompleteOrder = async () => {
    if (!product) return;
    
    setIsProcessing(true);
    
    try {
      const shippingCost = calculateShipping();
      const taxAmount = (product.offerPrice || product.basePrice + shippingCost) * 0.18;

      const orderData = {
        customer: customerData,
        items: [{
          productId: product._id,
          title: product.title,
          price: product.offerPrice || product.basePrice,
          quantity: 1,
          image: product.featuredImage || product.images?.[0] || '',
          size: '',
          style: '',
          sku: product.sku
        }],
        subtotal: product.offerPrice || product.basePrice,
        shippingCharges: shippingCost,
        taxAmount,
        discountAmount: product.offerPrice ? product.basePrice - product.offerPrice : 0,
        totalAmount: calculateTotal(),
        payment: {
          method: paymentData.method,
          status: paymentData.method === 'COD' ? 'pending' : 'paid',
          amount: calculateTotal(),
          currency: 'INR'
        },
        shippingMethod: shippingMethod === 'standard' ? 'Standard' : 
                        shippingMethod === 'express' ? 'Express' : 'Next Day',
        customerNotes: ''
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      router.push(`/order-success/${result.order._id}`);
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center animate-[fadeIn_0.3s_ease-out]">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent" />
          </div>
          <p className="text-gray-600 font-medium">Loading your product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-pink-400/40">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/products')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const shippingCost = calculateShipping();
  const taxAmount = (product.offerPrice || product.basePrice + shippingCost) * 0.18;
  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 animate-[fadeIn_0.3s_ease-out]">
          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            Complete Your Order
          </h1>
          <p className="text-gray-600 text-sm md:text-base flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600/10 text-blue-600">
              <Package className="w-3.5 h-3.5" />
            </span>
            Buying: <span className="font-semibold ml-1">{product.title}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Steps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress steps */}
            <div className="bg-white/90 backdrop-blur-lg p-5 rounded-2xl shadow-lg shadow-slate-200 border border-white/60">
              <div className="flex items-center justify-between gap-4">
                {[1, 2, 3].map((stepNum) => {
                  const active = step === stepNum;
                  const completed = step > stepNum;
                  return (
                    <div
                      key={stepNum}
                      className="flex flex-col items-center flex-1 relative"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-all duration-200 
                          ${completed
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md shadow-emerald-400/30'
                            : active
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-400/30'
                            : 'bg-gray-200'
                          }`}
                      >
                        {completed ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <span
                            className={`text-sm font-semibold ${
                              active ? 'text-white' : 'text-gray-700'
                            }`}
                          >
                            {stepNum}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs md:text-sm font-medium ${
                          step >= stepNum ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {stepNum === 1 ? 'Details' : stepNum === 2 ? 'Shipping' : 'Payment'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 h-1 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300"
                  style={{ width: `${(step - 1) * 50}%` }}
                />
              </div>
            </div>

            {/* Step content */}
            <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-slate-200 border border-white/70">
              {step === 1 && (
                <CustomerInfoForm
                  data={customerData}
                  onChange={setCustomerData}
                  onNext={() => setStep(2)}
                />
              )}

              {step === 2 && (
                <ShippingMethodForm
                  selectedMethod={shippingMethod}
                  onSelect={setShippingMethod}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}

              {step === 3 && (
                <PaymentMethodForm
                  data={paymentData}
                  onChange={setPaymentData}
                  onComplete={handleCompleteOrder}
                  onBack={() => setStep(2)}
                  isProcessing={isProcessing}
                />
              )}
            </div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 animate-[fadeIn_0.35s_ease-out]">
              {/* Summary card */}
              <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-slate-200 border border-white/70">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Order Summary
                </h3>

                {/* Product preview */}
                <div className="flex gap-4 p-4 bg-gray-50/90 rounded-2xl mb-4 border border-gray-100">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={product.featuredImage || product.images?.[0] || ''}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2">
                      {product.title}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      {product.category}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-gray-900 text-sm md:text-base">
                        ₹{(product.offerPrice || product.basePrice).toLocaleString()}
                      </span>
                      <span className="text-xs md:text-sm text-gray-600">Qty: 1</span>
                    </div>
                  </div>
                </div>

                {/* Address hint */}
                <div className="flex items-start gap-3 mb-4 text-xs md:text-sm">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Delivering to</p>
                    <p className="text-gray-600 mt-0.5">
                      {customerData.address.street
                        ? `${customerData.address.street}, ${customerData.address.city || ''}`
                        : 'Add your address in step 1 to see more details'}
                    </p>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="space-y-3 text-sm md:text-base">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{(product.offerPrice || product.basePrice).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-emerald-600 font-semibold' : ''}>
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Tax (GST 18%)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>

                  {product.offerPrice && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-₹{(product.basePrice - product.offerPrice).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Inclusive of all taxes
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/85 backdrop-blur-md p-5 rounded-2xl border border-blue-100/70 shadow-md shadow-blue-100/50">
                <h4 className="font-semibold text-blue-900 mb-3 text-sm md:text-base">
                  Why shop with us?
                </h4>
                <div className="space-y-3 text-xs md:text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Secure Payment</p>
                      <p className="text-blue-700 text-xs md:text-sm">
                        256-bit SSL encryption on all transactions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Truck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-900">Free Shipping</p>
                      <p className="text-emerald-700 text-xs md:text-sm">
                        Over ₹999 on all orders
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">Easy Returns</p>
                      <p className="text-purple-700 text-xs md:text-sm">
                        30-day hassle-free return policy
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimated delivery */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50/85 backdrop-blur-md p-5 rounded-2xl border border-emerald-100/70 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-semibold text-emerald-900 text-sm md:text-base">
                    Estimated Delivery
                  </h4>
                </div>
                <p className="text-sm text-emerald-800">
                  {shippingMethod === 'next-day'
                    ? 'Tomorrow'
                    : shippingMethod === 'express'
                    ? '2-3 business days'
                    : '4-7 business days'}
                </p>
                <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Delivery to:{' '}
                  <span className="font-medium">
                    {customerData.address.pincode || 'Enter pincode in step 1'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default BuyNow;
