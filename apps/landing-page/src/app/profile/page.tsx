'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Calendar, Shield, Heart, Settings, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';

export default function ProfilePage() {
  const { data: session, status } = useSession();

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center text-white text-4xl font-bold">
              {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{session?.user?.name || 'User'}</h1>
              <p className="text-gray-600 mt-1">{session?.user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Role: {session?.user?.role || 'CUSTOMER'}</span>
              </div>
            </div>
            <Link href="/profile/settings">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Total orders placed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Saved items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2024</div>
              <p className="text-xs text-muted-foreground">Year joined</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/profile/settings" className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Account Settings</p>
                  <p className="text-sm text-gray-600">Update your personal information and preferences</p>
                </div>
              </div>
            </Link>

            <Link href="/profile/favorites" className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Favorites</p>
                  <p className="text-sm text-gray-600">View your saved menu items and products</p>
                </div>
              </div>
            </Link>

            <Link href="/orders" className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Order History</p>
                  <p className="text-sm text-gray-600">View your past orders and track current ones</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    </>
  );
}
