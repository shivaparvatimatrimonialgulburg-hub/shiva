import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  birthTime: z.string().optional(),
  gender: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  annualIncome: z.string().optional(),
  nativePlace: z.string().optional(),
  state: z.string().optional(),
  maritalStatus: z.string().optional(),
  expectations: z.string().optional(),
  contactNo: z.string().min(10, "Valid contact number required"),
  address: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  brothers: z.string().optional(),
  sisters: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  profile: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProfile: any) => void;
}

export default function EditProfileModal({ profile, isOpen, onClose, onUpdate }: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [masterData, setMasterData] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile || {}
  });

  useEffect(() => {
    if (profile) {
      const cleaned = { ...profile };
      Object.keys((profileSchema as any).shape).forEach(key => {
        if (cleaned[key] === null || cleaned[key] === undefined) cleaned[key] = '';
      });
      reset(cleaned);
    }
  }, [profile, reset]);

  useEffect(() => {
    fetch('/api/master-data')
      .then(res => res.json())
      .then(data => setMasterData(data))
      .catch(err => console.error("Error fetching master data:", err));
  }, []);

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profiles/${profile.id || profile.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully!");
        onUpdate(result);
        onClose();
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Info */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input {...register('fullName')} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input {...register('contactNo')} />
              {errors.contactNo && <p className="text-xs text-destructive">{errors.contactNo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select onValueChange={(v) => setValue('gender', v)} value={watch('gender')}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Birth Date</Label>
              <Input type="date" {...register('birthDate')} />
            </div>
            <div className="space-y-2">
              <Label>Birth Time</Label>
              <Input type="time" {...register('birthTime')} />
            </div>
            <div className="space-y-2">
              <Label>Marital Status</Label>
              <Select onValueChange={(v) => setValue('maritalStatus', v)} value={watch('maritalStatus')}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {['Never Married', 'Widowed', 'Divorced', 'Awaiting Divorce'].map(o => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Religious Info */}
            <div className="space-y-2">
              <Label>Religion</Label>
              <Input {...register('religion')} />
            </div>
            <div className="space-y-2">
              <Label>Caste</Label>
              <Input {...register('caste')} />
            </div>
            <div className="space-y-2">
              <Label>Native Place</Label>
              <Input {...register('nativePlace')} />
            </div>

            {/* Professional Info */}
            <div className="space-y-2">
              <Label>Education</Label>
              <Input {...register('education')} />
            </div>
            <div className="space-y-2">
              <Label>Occupation</Label>
              <Input {...register('occupation')} />
            </div>
            <div className="space-y-2">
              <Label>Annual Income</Label>
              <Select onValueChange={(v) => setValue('annualIncome', v)} value={watch('annualIncome')}>
                <SelectTrigger><SelectValue placeholder="Select Income" /></SelectTrigger>
                <SelectContent>
                  {['Below 3L', '3L - 5L', '5L - 7L', '7L - 10L', '10L - 15L', '15L+'].map(o => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>State</Label>
              <Select onValueChange={(v: string) => setValue('state', v)} value={watch('state')}>
                <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                <SelectContent>
                  {masterData?.states?.map((o: string) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Input {...register('address')} />
            </div>

            {/* Family */}
            <div className="space-y-2">
              <Label>Father's Name</Label>
              <Input {...register('fatherName')} />
            </div>
            <div className="space-y-2">
              <Label>Mother's Name</Label>
              <Input {...register('motherName')} />
            </div>
            <div className="space-y-2">
              <Label>Brothers</Label>
              <Input {...register('brothers')} />
            </div>
            <div className="space-y-2">
              <Label>Sisters</Label>
              <Input {...register('sisters')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expectations</Label>
            <textarea 
              {...register('expectations')} 
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary text-white font-medium">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
