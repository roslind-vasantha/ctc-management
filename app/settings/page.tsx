'use client';

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';
import { useManagementUser, usePreferences } from '@/lib/store';
import { User, Settings as SettingsIcon, Save } from 'lucide-react';

export default function SettingsPage() {
  const [user, updateUser] = useManagementUser();
  const [preferences, updatePreferences] = usePreferences();
  const { showToast } = useToast();
  
  const [userForm, setUserForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  });
  
  const [prefsForm, setPrefsForm] = useState({
    compactTables: preferences.compactTables,
    defaultDateRange: preferences.defaultDateRange,
  });
  
  useEffect(() => {
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  }, [user]);
  
  useEffect(() => {
    setPrefsForm({
      compactTables: preferences.compactTables,
      defaultDateRange: preferences.defaultDateRange,
    });
  }, [preferences]);
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(userForm);
    showToast('Profile updated successfully', 'success');
  };
  
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences(prefsForm);
    showToast('Preferences updated successfully', 'success');
  };
  
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">Settings</h1>
        <p className="text-[var(--muted-foreground)]">
          Manage your profile and application preferences
        </p>
      </div>
      
      {/* Profile Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-[var(--muted)]">
            <User size={24} className="text-[var(--text-color)]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-color)]">
              Profile Information
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Update your personal information
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            required
            fullWidth
          />
          
          <Input
            label="Email Address"
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            required
            fullWidth
          />
          
          <Input
            label="Phone Number"
            type="tel"
            value={userForm.phone}
            onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
            required
            fullWidth
          />
          
          <div className="flex justify-end pt-4">
            <Button type="submit" icon={Save}>
              Save Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

