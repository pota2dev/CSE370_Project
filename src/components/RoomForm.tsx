"use client";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label"; 
import { useSession } from '@supabase/auth-helpers-react';
import { useSupabase } from '@/app/supabase-provider';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RoomFormValues {
  place_id?: string; // added to support update functionality
  place_type: string;
  guest_capacity: number;
  bedroom_count: number;
  bed_count: number;
  bathroom_count: number;
  size_sqm?: number;
  check_in_time: string;
  check_out_time: string;
  location: string;
  map_id?: string;
  policy?: string;
  price: number;
  currency: string;
  description?: string;
}

interface RoomFormProps {
  defaultValues?: RoomFormValues;
  isUpdate?: boolean; // added update flag
}

export default function RoomForm({ defaultValues, isUpdate }: RoomFormProps) {
  const session = useSession();
  const supabase = useSupabase();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // New authentication check using GET /api/test-session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/test-session', {
          headers: { 'Accept': 'application/json' }
        });
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          // Ignore error and treat as not logged in
          router.push('/auth/login');
          return;
        }
        const userData = await res.json();
        console.log("Authenticated user:", userData);
      } catch (error) {
        // Ignore error silently and redirect
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [router]);

  // Get auth token on component mount and when session changes
  useEffect(() => {
    const getAuthToken = async () => {
      if (session) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setAuthToken(data.session.access_token);
          console.log("Token retrieved successfully");
        }
      }
    };
    
    getAuthToken();
  }, [session, supabase.auth]);

  const { register, handleSubmit, control, formState: { errors } } = useForm<RoomFormValues>({
    defaultValues: defaultValues || {
      place_type: "HOTEL_ROOM",
      guest_capacity: 1,
      bedroom_count: 0,
      bed_count: 0,
      bathroom_count: 0,
      size_sqm: undefined,
      check_in_time: "",
      check_out_time: "",
      location: "",
      map_id: "",
      policy: "",
      price: 0,
      currency: "USD",
      description: ""
    },
  });

  const onSubmit = async (data: RoomFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // First check if we have an active session
      if (!session) {
        // Commented out the authentication guard:
        // setSubmitError('Authentication error: No active session found');
        // console.error('No active session found when submitting form');
        // return;
        console.log('No active session found - proceeding as guest');
      }

      console.log('Session available, user:', session ? session.user.email : 'Guest');
      
      console.log('Cookies enabled:', navigator.cookieEnabled);
      
      // Choose endpoint and method based on isUpdate flag.
      const endpoint = isUpdate ? '/api/update_place' : '/api/create_place';
      const method = isUpdate ? 'PUT' : 'POST';
      // If updating, add place_id from defaultValues
      const payload = isUpdate && defaultValues?.place_id?{ ...data, place_id: defaultValues.place_id } : data;
      
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMessage = 'Failed to create room';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = await res.text() || errorMessage;
        }
        
        setSubmitError(errorMessage);
        console.error('Error response:', errorMessage);
        return;
      }

      const responseData = await res.json();
      console.log(isUpdate ? 'Room updated successfully:' : 'Room created successfully:', responseData);
      alert(isUpdate ? 'Room updated successfully!' : 'Room created successfully!');
      router.push('/rooms');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setSubmitError(`Error submitting form: ${errorMessage}`);
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
  if (!session) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Not logged in: </strong>
        <span className="block sm:inline">You need to be logged in to create a room.</span>
      </div>
    );
  }
  */

  return (
    <div className="p-4 rounded shadow-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{submitError}</span>
          </div>
        )}
        
        {/* Room Type */}
        <div>
          <Label className="mb-1">Room Type</Label>
          <Controller
            control={control}
            name="place_type"
            rules={{ required: "Room type is required" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOTEL_ROOM">Hotel Room</SelectItem>
                  <SelectItem value="NORMAL_ROOM">Normal Room</SelectItem>
                  <SelectItem value="APARTMENT">Apartment</SelectItem>
                  <SelectItem value="STUDIO_APARTMENT">Studio Apartment</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.place_type && <p className="text-red-500 text-sm mt-1">{errors.place_type.message}</p>}
        </div>
        
        {/* Guest Capacity */}
        <div>
          <Label className="mb-1">Guest Capacity</Label>
          <Input 
            type="number" 
            {...register("guest_capacity", { 
              required: "Guest capacity is required",
              valueAsNumber: true,
              min: { value: 1, message: "Capacity must be at least 1" } 
            })} 
          />
          {errors.guest_capacity && <p className="text-red-500 text-sm mt-1">{errors.guest_capacity.message}</p>}
        </div>
        
        {/* Bedroom Count */}
        <div>
          <Label className="mb-1">Bedroom Count</Label>
          <Input 
            type="number" 
            {...register("bedroom_count", { 
              required: "Bedroom count is required",
              valueAsNumber: true,
              min: { value: 0, message: "Cannot be negative" } 
            })} 
          />
          {errors.bedroom_count && <p className="text-red-500 text-sm mt-1">{errors.bedroom_count.message}</p>}
        </div>
        
        {/* Bed Count */}
        <div>
          <Label className="mb-1">Bed Count</Label>
          <Input 
            type="number" 
            {...register("bed_count", { 
              required: "Bed count is required",
              valueAsNumber: true,
              min: { value: 0, message: "Cannot be negative" } 
            })} 
          />
          {errors.bed_count && <p className="text-red-500 text-sm mt-1">{errors.bed_count.message}</p>}
        </div>
        
        {/* Bathroom Count */}
        <div>
          <Label className="mb-1">Bathroom Count</Label>
          <Input 
            type="number" 
            {...register("bathroom_count", { 
              required: "Bathroom count is required",
              valueAsNumber: true,
              min: { value: 0, message: "Cannot be negative" } 
            })} 
          />
          {errors.bathroom_count && <p className="text-red-500 text-sm mt-1">{errors.bathroom_count.message}</p>}
        </div>
        
        {/* Size in sqm */}
        <div>
          <Label className="mb-1">Size (sqm)</Label>
          <Input 
            type="number" 
            step="0.01" 
            {...register("size_sqm", { 
              valueAsNumber: true,
              min: { value: 0, message: "Size cannot be negative" } 
            })} 
          />
          {errors.size_sqm && <p className="text-red-500 text-sm mt-1">{errors.size_sqm.message}</p>}
        </div>
        
        {/* Check In / Out Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1">Check In Time</Label>
            <Input 
              type="time" 
              {...register("check_in_time", { 
                required: "Check-in time is required" 
              })} 
            />
            {errors.check_in_time && <p className="text-red-500 text-sm mt-1">{errors.check_in_time.message}</p>}
          </div>
          <div>
            <Label className="mb-1">Check Out Time</Label>
            <Input 
              type="time" 
              {...register("check_out_time", { 
                required: "Check-out time is required" 
              })} 
            />
            {errors.check_out_time && <p className="text-red-500 text-sm mt-1">{errors.check_out_time.message}</p>}
          </div>
        </div>
        
        {/* Location */}
        <div>
          <Label className="mb-1">Location</Label>
          <Input 
            type="text" 
            {...register("location", { 
              required: "Location is required" 
            })} 
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
        </div>
        
        {/* Map ID */}
        <div>
          <Label className="mb-1">Map ID (Optional)</Label>
          <Input type="text" {...register("map_id")} />
        </div>
        
        {/* Policy */}
        <div>
          <Label className="mb-1">Policy (Optional)</Label>
          <Textarea {...register("policy")} />
        </div>
        
        {/* Price */}
        <div>
          <Label className="mb-1">Price</Label>
          <Input 
            type="number" 
            step="0.01" 
            {...register("price", { 
              required: "Price is required",
              valueAsNumber: true,
              min: { value: 0, message: "Price cannot be negative" } 
            })} 
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
        </div>
        
        {/* Currency */}
        <div>
          <Label className="mb-1">Currency</Label>
          <Input 
            type="text" 
            {...register("currency", { 
              required: "Currency is required" 
            })} 
          />
          {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency.message}</p>}
        </div>
        
        {/* Description */}
        <div>
          <Label className="mb-1">Description (Optional)</Label>
          <Textarea {...register("description")} />
        </div>
        
        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  );
}