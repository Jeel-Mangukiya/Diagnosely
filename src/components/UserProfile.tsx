import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Heart, 
  Activity, 
  FileText, 
  MessageSquare, 
  Save, 
  Lock, 
  Bell, 
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface UserHealthProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType: string;
  heightCm: string;
  weightKg: string;
  allergies: string;
  conditions: string;
  medications: string;
  physicianName: string;
  emailNotifications: boolean;
  aiDigests: boolean;
  securityAlerts: boolean;
}

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<UserHealthProfile>({
    firstName: user?.user_metadata?.first_name || 'Jeel',
    lastName: user?.user_metadata?.last_name || 'Mangukiya',
    email: user?.email || 'jeel@example.com',
    phone: '+1 (555) 019-2834',
    dob: '1998-05-14',
    gender: 'Male',
    address: 'San Francisco, CA, USA',
    emergencyContactName: 'Sarah Mangukiya',
    emergencyContactPhone: '+1 (555) 019-8821',
    bloodType: 'O+',
    heightCm: '178',
    weightKg: '72',
    allergies: 'Penicillin, Dust Mites',
    conditions: 'Mild Asthma',
    medications: 'Albuterol (as needed)',
    physicianName: 'Dr. Robert Chen, MD',
    emailNotifications: true,
    aiDigests: true,
    securityAlerts: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load saved profile data from localStorage or Supabase
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      setIsLoading(true);
      // Try local storage first for quick display
      const savedLocal = localStorage.getItem(`diagnosely_profile_${user.id}`);
      if (savedLocal) {
        try {
          setProfile(prev => ({ ...prev, ...JSON.parse(savedLocal) }));
        } catch (e) {}
      }

      // Try fetching from Supabase profiles table
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setProfile(prev => ({
            ...prev,
            firstName: data.first_name || prev.firstName,
            lastName: data.last_name || prev.lastName,
            email: data.email || user.email || prev.email,
          }));
        }
      } catch (e) {
        console.warn('Could not fetch Supabase profile:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: keyof UserHealthProfile, checked: boolean) => {
    setProfile(prev => ({ ...prev, [name]: checked }));
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // 1. Save to local storage for offline / quick persistence
      localStorage.setItem(`diagnosely_profile_${user.id}`, JSON.stringify(profile));

      // 2. Try updating Supabase profile table
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: profile.firstName,
          last_name: profile.lastName,
          email: profile.email,
          updated_at: new Date().toISOString(),
        });

      toast({
        title: "Profile Saved!",
        description: "Your profile information and health settings have been updated.",
      });
    } catch (err: any) {
      toast({
        title: "Saved Locally",
        description: "Your profile was saved locally.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your account password has been updated successfully.",
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err?.message || "Could not update password. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate BMI
  const heightM = (parseFloat(profile.heightCm) || 170) / 100;
  const weightKg = parseFloat(profile.weightKg) || 70;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);

  const getBmiCategory = (bmiVal: number) => {
    if (bmiVal < 18.5) return { label: 'Underweight', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (bmiVal < 25) return { label: 'Normal / Healthy', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (bmiVal < 30) return { label: 'Overweight', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'High', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  const bmiInfo = getBmiCategory(parseFloat(bmi));

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-slate-50/60 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Back Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1 px-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Patient Profile
            </Badge>
          </div>
        </div>

        {/* Hero Profile Banner */}
        <div className="relative bg-gradient-to-r from-teal-700 via-primary to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Activity className="w-96 h-96" />
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-white/30 shadow-2xl bg-white text-primary">
              <AvatarImage src="" />
              <AvatarFallback className="text-3xl font-extrabold bg-white text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold tracking-tight">{profile.firstName} {profile.lastName}</h1>
                <Badge className="w-fit mx-auto sm:mx-0 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0 text-xs font-semibold px-2.5 py-0.5">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-300 inline" /> Pro AI Health Plan
                </Badge>
              </div>
              <p className="text-emerald-100 text-sm flex items-center justify-center sm:justify-start gap-2 mb-4">
                <Mail className="w-4 h-4 opacity-80" /> {profile.email}
                <span className="opacity-40">•</span>
                <Phone className="w-4 h-4 opacity-80" /> {profile.phone}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/15">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-center">
                  <p className="text-xs text-emerald-100">Blood Type</p>
                  <p className="text-lg font-bold text-white">{profile.bloodType}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-center">
                  <p className="text-xs text-emerald-100">Height / Weight</p>
                  <p className="text-lg font-bold text-white">{profile.heightCm} cm / {profile.weightKg} kg</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-center">
                  <p className="text-xs text-emerald-100">BMI Index</p>
                  <p className="text-lg font-bold text-white">{bmi}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-center">
                  <p className="text-xs text-emerald-100">Member Since</p>
                  <p className="text-lg font-bold text-white">2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-1 h-auto">
            <TabsTrigger value="personal" className="rounded-xl py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <User className="w-4 h-4 mr-2" /> Personal Info
            </TabsTrigger>
            <TabsTrigger value="health" className="rounded-xl py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Heart className="w-4 h-4 mr-2" /> Health & Medical
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-xl py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Lock className="w-4 h-4 mr-2" /> Security & Password
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Bell className="w-4 h-4 mr-2" /> Preferences
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PERSONAL INFO */}
          <TabsContent value="personal">
            <Card className="rounded-2xl border-0 shadow-lg bg-white">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                  <User className="w-5 h-5 text-primary mr-2" /> Personal Details
                </CardTitle>
                <CardDescription>Update your personal information and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        className="rounded-xl h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                        className="rounded-xl h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address (Read only)</Label>
                      <Input
                        id="email"
                        name="email"
                        value={profile.email}
                        disabled
                        className="rounded-xl h-11 bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        name="dob"
                        type="date"
                        value={profile.dob}
                        onChange={handleChange}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        name="gender"
                        value={profile.gender}
                        onChange={handleChange}
                        className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other / Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address / Location</Label>
                    <Input
                      id="address"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center">
                      <Shield className="w-4 h-4 text-emerald-600 mr-2" /> Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">Contact Name</Label>
                        <Input
                          id="emergencyContactName"
                          name="emergencyContactName"
                          value={profile.emergencyContactName}
                          onChange={handleChange}
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                        <Input
                          id="emergencyContactPhone"
                          name="emergencyContactPhone"
                          value={profile.emergencyContactPhone}
                          onChange={handleChange}
                          className="rounded-xl h-11"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSaving} className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-white font-medium">
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Personal Details'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: HEALTH & MEDICAL */}
          <TabsContent value="health">
            <Card className="rounded-2xl border-0 shadow-lg bg-white">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                  <Heart className="w-5 h-5 text-rose-500 mr-2" /> Medical & Health Profile
                </CardTitle>
                <CardDescription>Provide health metrics for tailored AI diagnostic suggestions.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* BMI Widget */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xl">
                        {bmi}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-base">Body Mass Index (BMI)</h4>
                        <p className="text-xs text-slate-500">Calculated automatically from your height and weight.</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`py-1.5 px-4 rounded-xl text-sm font-semibold border ${bmiInfo.color}`}>
                      {bmiInfo.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <select
                        id="bloodType"
                        name="bloodType"
                        value={profile.bloodType}
                        onChange={handleChange}
                        className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="heightCm">Height (cm)</Label>
                      <Input
                        id="heightCm"
                        name="heightCm"
                        type="number"
                        value={profile.heightCm}
                        onChange={handleChange}
                        className="rounded-xl h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weightKg">Weight (kg)</Label>
                      <Input
                        id="weightKg"
                        name="weightKg"
                        type="number"
                        value={profile.weightKg}
                        onChange={handleChange}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Known Allergies</Label>
                    <Input
                      id="allergies"
                      name="allergies"
                      placeholder="e.g. Penicillin, Peanuts, Latex"
                      value={profile.allergies}
                      onChange={handleChange}
                      className="rounded-xl h-11"
                    />
                    <p className="text-xs text-slate-400">Separate multiple allergies with commas.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conditions">Chronic Conditions / Diagnoses</Label>
                    <Input
                      id="conditions"
                      name="conditions"
                      placeholder="e.g. Asthma, High Blood Pressure"
                      value={profile.conditions}
                      onChange={handleChange}
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Current Medications</Label>
                    <Input
                      id="medications"
                      name="medications"
                      placeholder="e.g. Metformin 500mg daily"
                      value={profile.medications}
                      onChange={handleChange}
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="physicianName">Primary Care Physician</Label>
                    <Input
                      id="physicianName"
                      name="physicianName"
                      placeholder="Dr. Full Name, Clinic"
                      value={profile.physicianName}
                      onChange={handleChange}
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSaving} className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-white font-medium">
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Health Profile'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: SECURITY & PASSWORD */}
          <TabsContent value="security">
            <Card className="rounded-2xl border-0 shadow-lg bg-white">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                  <Lock className="w-5 h-5 text-amber-500 mr-2" /> Security & Account Password
                </CardTitle>
                <CardDescription>Manage your authentication credentials and security configuration.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password (min. 6 characters)"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="rounded-xl h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="rounded-xl h-11"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-white font-medium">
                      Update Password
                    </Button>
                  </div>
                </form>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-base font-semibold text-slate-800 mb-2">Account Management</h4>
                  <p className="text-xs text-slate-500 mb-4">Sign out of your current session on this device.</p>
                  <Button
                    onClick={() => signOut()}
                    variant="outline"
                    className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    Sign Out Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: NOTIFICATIONS & PREFERENCES */}
          <TabsContent value="notifications">
            <Card className="rounded-2xl border-0 shadow-lg bg-white">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                  <Bell className="w-5 h-5 text-indigo-500 mr-2" /> Notification Preferences
                </CardTitle>
                <CardDescription>Choose how Diagnosely communicates health insights with you.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Email Analysis Reports</h4>
                      <p className="text-xs text-slate-500">Receive instant email copies when document analysis completes.</p>
                    </div>
                    <Switch
                      checked={profile.emailNotifications}
                      onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Weekly AI Health Digest</h4>
                      <p className="text-xs text-slate-500">Get personalized wellness summaries and insights once a week.</p>
                    </div>
                    <Switch
                      checked={profile.aiDigests}
                      onCheckedChange={(checked) => handleSwitchChange('aiDigests', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Security & Sign-in Alerts</h4>
                      <p className="text-xs text-slate-500">Get notified of any new login attempts or password updates.</p>
                    </div>
                    <Switch
                      checked={profile.securityAlerts}
                      onCheckedChange={(checked) => handleSwitchChange('securityAlerts', checked)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => handleSaveProfile()} disabled={isSaving} className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-white font-medium">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
};

export default UserProfile;
