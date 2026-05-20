'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChevronLeft, Calendar, Clock, Users, Check } from 'lucide-react'

export default function ReservationPage({ params }: { params: { slug: string } }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    partySize: '2',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Submit reservation
      console.log('Reservation submitted:', formData)
      setStep(4) // Success step
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  // Mock restaurant name - will be fetched from database
  const restaurantName = params.slug === 'suberfood-classical'
    ? 'SuberFood Classical'
    : 'SuberFood Bistro'

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href={`/distribution/restaurants/${params.slug}`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Restaurant
            </Link>
          </div>
        </div>

        {/* Reservation Form */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step > s ? <Check className="w-5 h-5" /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        step > s ? 'bg-primary-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className={step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'}>
                  Date & Time
                </span>
                <span className={step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'}>
                  Party Size
                </span>
                <span className={step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'}>
                  Your Details
                </span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {step === 4 ? 'Reservation Confirmed!' : `Reserve a Table at ${restaurantName}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step === 4 ? (
                  // Success Step
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Your Reservation is Confirmed!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      A confirmation email has been sent to {formData.email}
                    </p>
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                      <h4 className="font-semibold text-gray-900 mb-3">Reservation Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">Restaurant:</span> <span className="font-medium">{restaurantName}</span></p>
                        <p><span className="text-gray-500">Date:</span> <span className="font-medium">{formData.date}</span></p>
                        <p><span className="text-gray-500">Time:</span> <span className="font-medium">{formData.time}</span></p>
                        <p><span className="text-gray-500">Party Size:</span> <span className="font-medium">{formData.partySize} guests</span></p>
                        <p><span className="text-gray-500">Name:</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link href={`/distribution/restaurants/${params.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Back to Restaurant
                        </Button>
                      </Link>
                      <Link href="/distribution/restaurants" className="flex-1">
                        <Button className="w-full">
                          Browse Restaurants
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Step 1: Date & Time */}
                    {step === 1 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Select Date
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => updateFormData('date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-2" />
                            Select Time
                          </label>
                          <select
                            required
                            value={formData.time}
                            onChange={(e) => updateFormData('time', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="">Choose a time</option>
                            <option value="17:00">5:00 PM</option>
                            <option value="17:30">5:30 PM</option>
                            <option value="18:00">6:00 PM</option>
                            <option value="18:30">6:30 PM</option>
                            <option value="19:00">7:00 PM</option>
                            <option value="19:30">7:30 PM</option>
                            <option value="20:00">8:00 PM</option>
                            <option value="20:30">8:30 PM</option>
                            <option value="21:00">9:00 PM</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Party Size */}
                    {step === 2 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Users className="w-4 h-4 inline mr-2" />
                            Number of Guests
                          </label>
                          <select
                            required
                            value={formData.partySize}
                            onChange={(e) => updateFormData('partySize', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                              <option key={size} value={size}>
                                {size} {size === 1 ? 'Guest' : 'Guests'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Special Requests (Optional)
                          </label>
                          <textarea
                            value={formData.specialRequests}
                            onChange={(e) => updateFormData('specialRequests', e.target.value)}
                            rows={4}
                            placeholder="Any special requirements, dietary restrictions, or preferences..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 3: Contact Details */}
                    {step === 3 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.firstName}
                              onChange={(e) => updateFormData('firstName', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.lastName}
                              onChange={(e) => updateFormData('lastName', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => updateFormData('phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-8 pt-6 border-t">
                      {step > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(step - 1)}
                          className="flex-1"
                        >
                          Back
                        </Button>
                      )}
                      <Button type="submit" className="flex-1">
                        {step === 3 ? 'Confirm Reservation' : 'Continue'}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
