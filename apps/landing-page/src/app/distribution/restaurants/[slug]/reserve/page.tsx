'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChevronLeft, Calendar, Clock, Users, Check, Loader2, LogIn, MapPin } from 'lucide-react'
import { useRestaurants, timeSlots } from '@/lib/hooks/useRestaurants'

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'

function todayInWAT() {
  // YYYY-MM-DD in West Africa Time (UTC+1)
  return new Date(Date.now() + 60 * 60 * 1000).toISOString().split('T')[0]
}

export default function ReservationPage({ params }: { params: { slug: string } }) {
  const { data: session, status } = useSession()
  const { restaurants, loading } = useRestaurants()
  const restaurant = restaurants.find((r) => r.slug === params.slug)

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    partySize: '2',
    name: '',
    phone: '',
    specialRequests: '',
  })

  useEffect(() => {
    if (session?.user) {
      setFormData((f) => ({
        ...f,
        name: f.name || session.user.name || '',
        phone: f.phone || ((session.user as any).phone ?? ''),
      }))
    }
  }, [session])

  const slots = useMemo(() => {
    const all = timeSlots(restaurant?.openingTime ?? null, restaurant?.closingTime ?? null)
    if (formData.date !== todayInWAT()) return all
    // Hide times that have already passed today (WAT)
    const now = new Date(Date.now() + 60 * 60 * 1000)
    const current = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`
    return all.filter((s) => s > current)
  }, [restaurant, formData.date])

  const updateFormData = (field: string, value: string) => {
    setFormData((f) => ({ ...f, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      return
    }
    if (!restaurant) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          date: formData.date,
          time: formData.time,
          partySize: formData.partySize,
          specialRequests: formData.specialRequests,
          contactName: formData.name,
          contactPhone: formData.phone,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not create your reservation')
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your reservation')
    } finally {
      setSubmitting(false)
    }
  }

  const backHref = `/distribution/restaurants/${params.slug}`

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href={backHref} className="inline-flex items-center text-primary-600 hover:text-primary-700">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Restaurant
            </Link>
          </div>
        </div>

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : !restaurant ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant not available</h1>
                  <p className="text-gray-600 mb-6">This restaurant is not taking reservations right now.</p>
                  <Link href="/distribution/restaurants/reservations">
                    <Button>Choose another restaurant</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {step < 4 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                              step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {step > s ? <Check className="w-5 h-5" /> : s}
                          </div>
                          {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className={step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Date & Time</span>
                      <span className={step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Party Size</span>
                      <span className={step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Your Details</span>
                    </div>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {step === 4 ? 'Reservation requested!' : `Reserve a table at ${restaurant.name}`}
                    </CardTitle>
                    {step < 4 && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {restaurant.address}, {restaurant.city}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {step === 4 ? (
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <p className="text-gray-600 mb-6">
                          {restaurant.name} will confirm your booking shortly. You can see its status in your account.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left space-y-2 text-sm">
                          <p><span className="text-gray-500">Restaurant:</span> <span className="font-medium">{restaurant.name}</span></p>
                          <p><span className="text-gray-500">Date:</span> <span className="font-medium">{formData.date}</span></p>
                          <p><span className="text-gray-500">Time:</span> <span className="font-medium">{formData.time}</span></p>
                          <p><span className="text-gray-500">Party size:</span> <span className="font-medium">{formData.partySize} guests</span></p>
                          <p><span className="text-gray-500">Name:</span> <span className="font-medium">{formData.name}</span></p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Link href="/orders" className="flex-1">
                            <Button variant="outline" className="w-full">My orders & reservations</Button>
                          </Link>
                          <Link href={`/locations/${restaurant.id}/menu`} className="flex-1">
                            <Button className="w-full">Browse the menu</Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        {step === 1 && (
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Select date
                              </label>
                              <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => {
                                  updateFormData('date', e.target.value)
                                  updateFormData('time', '')
                                }}
                                min={todayInWAT()}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Clock className="w-4 h-4 inline mr-2" />
                                Select time
                              </label>
                              <select
                                required
                                value={formData.time}
                                onChange={(e) => updateFormData('time', e.target.value)}
                                className={inputClass}
                                disabled={!formData.date}
                              >
                                <option value="">{formData.date ? 'Choose a time' : 'Choose a date first'}</option>
                                {slots.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                              {formData.date && slots.length === 0 && (
                                <p className="mt-2 text-sm text-amber-700">No more times available today — please pick another date.</p>
                              )}
                            </div>
                          </div>
                        )}

                        {step === 2 && (
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Users className="w-4 h-4 inline mr-2" />
                                Number of guests
                              </label>
                              <select
                                required
                                value={formData.partySize}
                                onChange={(e) => updateFormData('partySize', e.target.value)}
                                className={inputClass}
                              >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((size) => (
                                  <option key={size} value={size}>
                                    {size} {size === 1 ? 'guest' : 'guests'}
                                  </option>
                                ))}
                              </select>
                              <p className="mt-2 text-sm text-gray-500">
                                Larger group?{' '}
                                <Link href="/distribution/restaurants/contact" className="text-primary-700 hover:underline">
                                  Contact our events team
                                </Link>
                                .
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Special requests (optional)</label>
                              <textarea
                                value={formData.specialRequests}
                                onChange={(e) => updateFormData('specialRequests', e.target.value)}
                                rows={4}
                                placeholder="Allergies, celebrations, seating preferences..."
                                className={inputClass}
                              />
                            </div>
                          </div>
                        )}

                        {step === 3 &&
                          (status !== 'authenticated' ? (
                            <div className="text-center py-6">
                              <LogIn className="w-10 h-10 text-primary-600 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in to finish your booking</h3>
                              <p className="text-gray-600 mb-6">
                                We use your account to confirm and remind you about your reservation.
                              </p>
                              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(`/distribution/restaurants/${params.slug}/reserve`)}`}>
                                  <Button type="button">Sign in</Button>
                                </Link>
                                <Link href={`/auth/signup?callbackUrl=${encodeURIComponent(`/distribution/restaurants/${params.slug}/reserve`)}`}>
                                  <Button type="button" variant="outline">Create an account</Button>
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name for the booking</label>
                                <input
                                  type="text"
                                  required
                                  value={formData.name}
                                  onChange={(e) => updateFormData('name', e.target.value)}
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                                <input
                                  type="tel"
                                  required
                                  placeholder="+237 6XX XXX XXX"
                                  value={formData.phone}
                                  onChange={(e) => updateFormData('phone', e.target.value)}
                                  className={inputClass}
                                />
                              </div>
                              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                                {formData.date} at {formData.time} · {formData.partySize} guests
                              </div>
                            </div>
                          ))}

                        {error && (
                          <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
                        )}

                        <div className="flex gap-3 mt-8 pt-6 border-t">
                          {step > 1 && (
                            <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                              Back
                            </Button>
                          )}
                          {!(step === 3 && status !== 'authenticated') && (
                            <Button type="submit" className="flex-1" disabled={submitting}>
                              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              {step === 3 ? 'Confirm reservation' : 'Continue'}
                            </Button>
                          )}
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
