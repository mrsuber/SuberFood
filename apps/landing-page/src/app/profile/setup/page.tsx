'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useState } from 'react';
import { User, Phone, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    location: '',
    companyName: '',
    interests: [] as string[],
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  const interestOptions = [
    { value: 'restaurants', label: 'Restaurants' },
    { value: 'retail', label: 'Retail Shopping' },
    { value: 'wholesale', label: 'Wholesale/B2B' },
    { value: 'farming', label: 'Farming & Agriculture' },
    { value: 'processing', label: 'Food Processing' },
    { value: 'sustainability', label: 'Sustainability' },
  ];

  const handleInterestToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter(i => i !== value)
        : [...prev.interests, value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Save profile data to database
      // For now, just redirect to profile page
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to SuberFood!</h1>
          <p className="text-gray-600 mt-2">Let's set up your profile to personalize your experience</p>
        </div>

        {/* Setup Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>Tell us a bit more about yourself (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Company Name (for business users) */}
              {session?.user?.role !== 'CUSTOMER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Your company or business name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What are you interested in?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {interestOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInterestToggle(option.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.interests.includes(option.value)
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Complete Setup'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Note */}
        <p className="text-center text-sm text-gray-600 mt-4">
          You can always update this information later in your profile settings
        </p>
      </div>
    </div>
  );
}
