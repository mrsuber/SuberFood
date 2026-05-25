'use client'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Users,
  Shield,
  Bell,
  Database,
  Mail,
  CreditCard,
  Globe,
  Lock,
  Eye,
  FileText,
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

type SettingsTab = 'general' | 'users' | 'security' | 'notifications' | 'system'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

  const tabs = [
    { id: 'general' as SettingsTab, label: 'General', icon: Building2 },
    { id: 'users' as SettingsTab, label: 'Users & Roles', icon: Users },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'system' as SettingsTab, label: 'System', icon: Database },
  ]

  return (
    <div>
      <AdminHeader title="Settings" />

      <div className="p-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      defaultValue="SuberFood"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Email
                    </label>
                    <input
                      type="email"
                      defaultValue="contact@suberfoods.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option>America/Los_Angeles (PST)</option>
                      <option>America/New_York (EST)</option>
                      <option>America/Chicago (CST)</option>
                      <option>Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="123 Farm Lane, Agricultural District, CA 94000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users & Roles Settings */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <Link href="/admin/settings/users/new">
                    <Button>Add New User</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Admin User', email: 'admin@suberfoods.com', role: 'Super Admin', status: 'Active' },
                    { name: 'John Manager', email: 'john@suberfoods.com', role: 'Manager', status: 'Active' },
                    { name: 'Sarah Staff', email: 'sarah@suberfoods.com', role: 'Staff', status: 'Active' },
                  ].map((user) => (
                    <div
                      key={user.email}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {user.role}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {user.status}
                        </span>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Roles & Permissions</CardTitle>
                  <Button variant="outline">Manage Roles</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { role: 'Super Admin', users: 1, permissions: 'Full Access', color: 'red' },
                    { role: 'Manager', users: 5, permissions: 'Edit & View', color: 'blue' },
                    { role: 'Staff', users: 15, permissions: 'View Only', color: 'green' },
                    { role: 'Guest', users: 3, permissions: 'Limited View', color: 'gray' },
                  ].map((role) => (
                    <div
                      key={role.role}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{role.role}</p>
                          <p className="text-sm text-gray-500">{role.permissions}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{role.users} users</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication (2FA)</p>
                    <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Session Timeout</p>
                    <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Password Policy</p>
                    <p className="text-sm text-gray-500">Minimum password requirements</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">IP Whitelist</p>
                    <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">API Keys</p>
                    <p className="text-sm text-gray-500">Manage API access tokens</p>
                  </div>
                  <Button variant="outline" size="sm">View Keys</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit & Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Activity Logs</p>
                    <p className="text-sm text-gray-500">View all system activity and changes</p>
                  </div>
                  <Link href="/admin/activity-logs">
                    <Button variant="outline" size="sm">View Logs</Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Export Data</p>
                    <p className="text-sm text-gray-500">Download compliance reports</p>
                  </div>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'New Orders', description: 'Get notified when new orders are placed' },
                  { label: 'Low Stock Alerts', description: 'Alert when inventory is running low' },
                  { label: 'Customer Reviews', description: 'Notification for new customer reviews' },
                  { label: 'System Updates', description: 'Important system maintenance notifications' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Urgent Alerts', description: 'Critical system or business alerts' },
                  { label: 'Order Confirmations', description: 'Send SMS for order confirmations' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database & Backup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Database Status</p>
                    <p className="text-sm text-gray-500">PostgreSQL v15.2 - Healthy</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Automatic Backups</p>
                    <p className="text-sm text-gray-500">Last backup: 2 hours ago</p>
                  </div>
                  <Button variant="outline" size="sm">Backup Now</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Backup Schedule</p>
                    <p className="text-sm text-gray-500">Daily at 2:00 AM</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">API Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">145ms</p>
                    <p className="text-xs text-green-600 mt-1">Excellent</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Server Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">99.9%</p>
                    <p className="text-xs text-green-600 mt-1">Last 30 days</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Storage Used</p>
                    <p className="text-2xl font-bold text-gray-900">245GB</p>
                    <p className="text-xs text-gray-600 mt-1">of 500GB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Stripe Payment Gateway', status: 'Connected', icon: CreditCard },
                  { name: 'SendGrid Email Service', status: 'Connected', icon: Mail },
                  { name: 'Google Maps API', status: 'Connected', icon: Globe },
                  { name: 'AWS S3 Storage', status: 'Connected', icon: Database },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <integration.icon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{integration.name}</p>
                        <p className="text-sm text-gray-500">{integration.status}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
