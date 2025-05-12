"use client";
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Types based on API response
interface ProfileData {
  main: {
    first_name?: string;
    last_name?: string;
    email?: string;
    contact_number?: string;
    date_of_birth?: string;
    display_photo_url?: string;
    is_host?: boolean;
  };
  guest: {
    total_collected_points?: number;
    total_available_points?: number;
    total_points_spent?: number;
  };
  host: {
    is_nid_verified?: boolean;
    nid_photo_url?: string;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current profile information
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await res.json();
        // Map API response structure
        setProfile({
          main: data.user,
          guest: data.guest_profiles || {},
          host: data.host_profiles || {}
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Error loading profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const { register: registerMain, handleSubmit: handleSubmitMain, reset: resetMain } = useForm({
    defaultValues: profile?.main || {}
  });
  const { register: registerGuest, handleSubmit: handleSubmitGuest, reset: resetGuest } = useForm({
    defaultValues: profile?.guest || {}
  });
  const { register: registerHost, handleSubmit: handleSubmitHost, reset: resetHost } = useForm({
    defaultValues: profile?.host || {}
  });
  
  // When profile loads, reset forms with fetched defaults.
  useEffect(() => {
    if (profile) {
      resetMain(profile.main);
      resetGuest(profile.guest);
      resetHost(profile.host);
    }
  }, [profile, resetMain, resetGuest, resetHost]);

  const onUpdate = async (formData: any, type: string) => {
    try {
      // Filter out email from payload if updating main profile since it's protected.
      if (type === 'main' && formData.email !== undefined) {
        // Remove email field from the update request.
        delete formData.email;
      }

      const res = await fetch('/api/update_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: formData }),
        credentials: 'include'
      });
      // New: clone and log response body for debugging
      const resClone = res.clone();
      const resBody = await resClone.json();
      console.log("API response body:", resBody);
      
      if (res.status === 401) {
        alert('Session expired. Please log in.');
        window.location.href = '/login';
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert('Profile updated successfully!');
        // Optionally refresh the profile data after successful update
        const refreshRes = await fetch('/api/profile');
        if (refreshRes.ok) {
          const refreshedData = await refreshRes.json();
          setProfile({
            main: refreshedData.user,
            guest: refreshedData.guest_profiles || {},
            host: refreshedData.host_profiles || {}
          });
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Update Profile</h1>
      <Tabs defaultValue="main">
        <TabsList>
          <TabsTrigger value="main">Main Profile</TabsTrigger>
          <TabsTrigger value="guest">Guest Profile</TabsTrigger>
          <TabsTrigger value="host">Host Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="main">
          <form onSubmit={handleSubmitMain(data => onUpdate(data, 'main'))} className="space-y-4">
            <div>
              <Label>First Name</Label>
              <Input {...registerMain('first_name')} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input {...registerMain('last_name')} />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input {...registerMain('contact_number')} />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" {...registerMain('date_of_birth')} />
            </div>
            <div>
              <Label>Display Photo URL</Label>
              <Input {...registerMain('display_photo_url')} />
            </div>
            <div className="space-y-2">
              <Label>Host Status</Label>
              <RadioGroup defaultValue={profile?.main.is_host ? "host" : "guest"}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="guest" id="guest" {...registerMain('is_host', { value: false })} />
                  <Label htmlFor="guest">Guest</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="host" id="host" {...registerMain('is_host', { value: true })} />
                  <Label htmlFor="host">Host</Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit">Update Main Profile</Button>
          </form>
        </TabsContent>
        <TabsContent value="guest">
          <form onSubmit={handleSubmitGuest(data => onUpdate(data, 'guest'))} className="space-y-4">
            <div>
              <Label>Total Collected Points</Label>
              <Input type="number" {...registerGuest('total_collected_points')} readOnly />
            </div>
            <div>
              <Label>Total Available Points</Label>
              <Input type="number" {...registerGuest('total_available_points')} readOnly />
            </div>
            <div>
              <Label>Total Points Spent</Label>
              <Input type="number" {...registerGuest('total_points_spent')} readOnly />
            </div>
            <Button type="submit">Update Guest Profile</Button>
          </form>
        </TabsContent>
        <TabsContent value="host">
          <form onSubmit={handleSubmitHost(data => onUpdate(data, 'host'))} className="space-y-4">
            <div>
              <Label>NID Photo URL</Label>
              <Input {...registerHost('nid_photo_url')} />
            </div>
            <div>
              <Label>NID Verification Status</Label>
              <Input type="checkbox" {...registerHost('is_nid_verified')} disabled />
              <span className="ml-2">
                {profile?.host.is_nid_verified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <Button type="submit">Update Host Profile</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}