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
          
          <Select
            label="Role"
            value={userForm.role}
            onChange={(e) =>
              setUserForm({ ...userForm, role: e.target.value as 'admin' | 'analyst' })
            }
            options={[
              { value: 'admin', label: 'Administrator' },
              { value: 'analyst', label: 'Analyst' },
            ]}
            fullWidth
            helperText="Your role determines your access level"
          />
          
          <div className="flex justify-end pt-4">
            <Button type="submit" icon={Save}>
              Save Profile
            </Button>
          </div>
        </form>
      </Card>
      
      {/* Preferences */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-[var(--muted)]">
            <SettingsIcon size={24} className="text-[var(--text-color)]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-color)]">
              Application Preferences
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Customize your application experience
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="compactTables"
              checked={prefsForm.compactTables}
              onChange={(e) =>
                setPrefsForm({ ...prefsForm, compactTables: e.target.checked })
              }
              className="mt-1 w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <label
                htmlFor="compactTables"
                className="block font-medium text-[var(--text-color)] cursor-pointer"
              >
                Compact Tables
              </label>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Display tables with reduced padding for more data visibility
              </p>
            </div>
          </div>
          
          <Select
            label="Default Date Range"
            value={String(prefsForm.defaultDateRange)}
            onChange={(e) =>
              setPrefsForm({
                ...prefsForm,
                defaultDateRange: Number(e.target.value) as 30 | 90,
              })
            }
            options={[
              { value: '30', label: 'Last 30 Days' },
              { value: '90', label: 'Last 90 Days' },
            ]}
            fullWidth
            helperText="Default time range for charts and reports"
          />
          
          <div className="flex justify-end pt-4">
            <Button type="submit" icon={Save}>
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>
      
      {/* About */}
      <Card>
        <h2 className="text-xl font-semibold text-[var(--text-color)] mb-4">
          About
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--muted-foreground)]">Application</span>
            <span className="text-sm font-medium text-[var(--text-color)]">
              Card-to-Cash Management
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--muted-foreground)]">Version</span>
            <span className="text-sm font-medium text-[var(--text-color)]">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--muted-foreground)]">Environment</span>
            <span className="text-sm font-medium text-[var(--text-color)]">
              Demo (UI Only)
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[var(--muted-foreground)]">Last Updated</span>
            <span className="text-sm font-medium text-[var(--text-color)]">
              November 2025
            </span>
          </div>
        </div>
      </Card>
      
      {/* Data Management */}
      <Card>
        <h2 className="text-xl font-semibold text-[var(--text-color)] mb-4">
          Data Management
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          All data in this demo is stored locally in your browser. Refreshing the page will
          reset all changes.
        </p>
        <Button
          variant="destructive"
          onClick={() => {
            localStorage.clear();
            showToast('Local data cleared. Refreshing...', 'success');
            setTimeout(() => window.location.reload(), 1500);
          }}
        >
          Clear Local Data & Reset
        </Button>
      </Card>
    </div>
  );
}

