import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { 
  Upload, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';

const registerSchema = z.object({
  // Step 1: Personal Details
  createProfileFor: z.string().min(1, "Required"),
  gender: z.string().min(1, "Required"),
  fullName: z.string().min(2, "Full name is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  zodiacSign: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  religion: z.string().min(1, "Religion is required"),
  caste: z.string().min(1, "Caste is required"),
  subCaste: z.string().optional(),
  motherTongue: z.string().min(1, "Mother tongue is required"),
  languagesKnown: z.array(z.string()).optional(),
  education: z.string().min(1, "Qualification is required"),
  employmentType: z.string().optional(),
  occupation: z.string().min(1, "Profession is required"),
  jobDetails: z.string().optional(),
  pastExperience: z.string().optional(),
  annualIncome: z.string().min(1, "Annual income is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  state: z.string().min(1, "State is required"),
  nativePlace: z.string().optional(),
  contactNo: z.string().min(10, "Valid contact number required"),
  address: z.string().optional(),
  pincode: z.string().optional(),
  
  // Step 2: Family Background
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  brothers: z.string().optional(),
  sisters: z.string().optional(),
  
  // Step 3: Expectations
  expectations: z.string().optional(),
  preferredPartnerQualification: z.string().optional(),
  preferredPartnerEmploymentType: z.string().optional(),
  preferredPartnerMaritalStatus: z.string().optional(),
  preferredState: z.string().optional(),
  
  // Step 4: Login Details
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  package: z.string().min(1, "Plan selection is required"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface UserRegistrationFormProps {
  onSuccess?: () => void;
  isAdminMode?: boolean;
}

export default function UserRegistrationForm({ onSuccess, isAdminMode = false }: UserRegistrationFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [masterData, setMasterData] = useState<any>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetch('/api/master-data')
      .then(res => res.json())
      .then(data => setMasterData(data))
      .catch(err => console.error("Error fetching master data:", err));
  }, []);

  const { register, handleSubmit, formState: { errors }, trigger, watch, setValue } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      createProfileFor: 'Self',
      gender: 'Male',
      maritalStatus: 'Never Married',
      employmentType: 'Private',
      annualIncome: 'Below 3L',
      package: 'free',
    }
  });

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ['fullName', 'birthDate', 'contactNo', 'createProfileFor', 'gender', 'religion', 'caste', 'education', 'occupation', 'annualIncome', 'state', 'motherTongue'];
    } else if (step === 2) {
      fieldsToValidate = ['fatherName', 'motherName'];
    } else if (step === 3) {
      fieldsToValidate = ['expectations'];
    }
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.url;
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      let photoUrl = '';
      let idProofUrl = '';

      if (profileImageFile) {
        photoUrl = await uploadFile(profileImageFile);
      }
      if (idProofFile) {
        idProofUrl = await uploadFile(idProofFile);
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          status: isAdminMode ? 'approved' : 'pending',
          profile: {
            photoUrl,
            idProofUrl
          }
        })
      });
      const result = await res.json();
      
      if (result.user) {
        toast.success(isAdminMode ? "User added successfully!" : "Registration successful! Your profile is pending approval.");
        if (onSuccess) onSuccess();
      } else {
        throw new Error(result.error || "Operation failed");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= s ? 'bg-primary text-white' : 'bg-white text-muted-foreground border border-muted'
            }`}>
              {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            {s < 4 && <div className={`w-8 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`}></div>}
          </div>
        ))}
      </div>

      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl font-serif">
            {step === 1 && "Personal Details"}
            {step === 2 && "Family Background"}
            {step === 3 && "Partner Expectations"}
            {step === 4 && "Account Details"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Tell us about the user"}
            {step === 2 && "Information about family"}
            {step === 3 && "What are they looking for in a partner?"}
            {step === 4 && "Secure the account and upload verification documents"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="space-y-2">
                    <Label>Create Profile For</Label>
                    <Select onValueChange={(v) => setValue('createProfileFor', v)} defaultValue={watch('createProfileFor')}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {['Self', 'Son', 'Daughter', 'Brother', 'Sister', 'Friend', 'Relative'].map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup 
                      defaultValue={watch('gender')} 
                      onValueChange={(v) => setValue('gender', v as any)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input {...register('fullName')} placeholder="Enter full name" />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Birth Date</Label>
                    <Input type="date" {...register('birthDate')} />
                    {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Birth Time</Label>
                    <Input type="time" {...register('birthTime')} />
                  </div>

                  <div className="space-y-2">
                    <Label>Birth Place</Label>
                    <Input {...register('birthPlace')} placeholder="City/Town" />
                  </div>

                  <div className="space-y-2">
                    <Label>Marital Status</Label>
                    <Select onValueChange={(v) => setValue('maritalStatus', v)} defaultValue={watch('maritalStatus')}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {['Never Married', 'Widowed', 'Divorced', 'Awaiting Divorce'].map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Contact Number</Label>
                    <Input {...register('contactNo')} placeholder="10 digit mobile number" />
                    {errors.contactNo && <p className="text-xs text-destructive">{errors.contactNo.message}</p>}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Address</Label>
                    <Input {...register('address')} placeholder="Full address" />
                  </div>

                  <div className="space-y-2">
                    <Label>Religion</Label>
                    <Select onValueChange={(v: string) => setValue('religion', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Religion" /></SelectTrigger>
                      <SelectContent>
                        {masterData?.religions?.map((o: string) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.religion && <p className="text-xs text-destructive">{errors.religion.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Caste</Label>
                    <Select onValueChange={(v: string) => setValue('caste', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Caste" /></SelectTrigger>
                      <SelectContent>
                        {masterData?.castes?.map((o: string) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.caste && <p className="text-xs text-destructive">{errors.caste.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Sub-Caste</Label>
                    <Select onValueChange={(v: string) => setValue('subCaste', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Sub-Caste" /></SelectTrigger>
                      <SelectContent>
                        {masterData?.subCastes?.map((o: string) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mother Tongue</Label>
                    <Select onValueChange={(v: string) => setValue('motherTongue', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
                      <SelectContent>
                        {masterData?.languages?.map((o: string) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.motherTongue && <p className="text-xs text-destructive">{errors.motherTongue.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select onValueChange={(v: string) => setValue('state', v)}>
                      <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                      <SelectContent>
                        {masterData?.states?.map((o: string) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Native Place</Label>
                    <Input {...register('nativePlace')} placeholder="City/Town" />
                  </div>

                  <div className="space-y-2">
                    <Label>Education / Qualification</Label>
                    <Select onValueChange={(v: string) => setValue('education', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Qualification" /></SelectTrigger>
                      <SelectContent>
                        {masterData?.qualifications?.map((o: string) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.education && <p className="text-xs text-destructive">{errors.education.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Profession / Occupation</Label>
                    <Select onValueChange={(v: string) => setValue('occupation', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Profession" /></SelectTrigger>
                      <SelectContent>
                        {masterData?.professions?.map((o: string) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.occupation && <p className="text-xs text-destructive">{errors.occupation.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Annual Income / Package</Label>
                    <Select onValueChange={(v: string) => setValue('annualIncome', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Income Range" /></SelectTrigger>
                      <SelectContent>
                        {masterData?.incomeRanges?.map((o: string) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.annualIncome && <p className="text-xs text-destructive">{errors.annualIncome.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <Select onValueChange={(v: string) => setValue('employmentType', v)} defaultValue={watch('employmentType')}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {['Government', 'Private', 'Business', 'Self Employed', 'Not Working'].map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Job Details</Label>
                    <Input {...register('jobDetails')} placeholder="Current job role, company, etc." />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="space-y-2">
                    <Label>Father's Name</Label>
                    <Input {...register('fatherName')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Father's Occupation</Label>
                    <Input {...register('fatherOccupation')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mother's Name</Label>
                    <Input {...register('motherName')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mother's Occupation</Label>
                    <Input {...register('motherOccupation')} />
                  </div>
                  <div className="space-y-2">
                    <Label>No. of Brothers</Label>
                    <Select onValueChange={(v: string) => setValue('brothers', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {['None', '1', '2', '3', '4+'].map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>No. of Sisters</Label>
                    <Select onValueChange={(v: string) => setValue('sisters', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {['None', '1', '2', '3', '4+'].map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Partner Expectations</Label>
                    <textarea 
                      {...register('expectations')} 
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Describe partner expectations..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preferred Qualification</Label>
                      <Input {...register('preferredPartnerQualification')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Marital Status</Label>
                      <Select onValueChange={(v: string) => setValue('preferredPartnerMaritalStatus', v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {['Any', 'Never Married', 'Widowed', 'Divorced'].map(o => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Select Plan / Package</Label>
                      <Select onValueChange={(v: string) => setValue('package', v)} defaultValue={watch('package')}>
                        <SelectTrigger><SelectValue placeholder="Select Plan" /></SelectTrigger>
                        <SelectContent>
                          {masterData?.packages?.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.name} - {p.price}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.package && <p className="text-xs text-destructive">{errors.package.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input type="email" {...register('email')} placeholder="email@example.com" />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input type="password" {...register('password')} placeholder="Min 6 characters" />
                      {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Profile Image</Label>
                      <div className="border border-dashed border-muted rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer relative">
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                          accept="image/*"
                        />
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">
                          {profileImageFile ? profileImageFile.name : "Upload photo"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold">ID Proof</Label>
                      <div className="border border-dashed border-muted rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer relative">
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                          accept="image/*,application/pdf"
                        />
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">
                          {idProofFile ? idProofFile.name : "Upload ID proof"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between pt-6 border-t">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
              ) : <div />}
              
              {step < 4 ? (
                <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90">
                  Next Step <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold px-8">
                  {loading ? "Processing..." : isAdminMode ? "Add User" : "Complete Registration"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
