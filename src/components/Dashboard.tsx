import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import {
  Upload,
  MessageSquare,
  FileText,
  Calendar,
  TrendingUp,
  Activity,
  Shield,
  Clock,
  User,
  ExternalLink,
  Plus,
  CheckCircle,
  Video,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DocumentStorageService } from '@/services/documentStorageService';
import { getLocalAppointments, Appointment } from './Appointments';

const documentStorage = DocumentStorageService.getInstance();

interface UserDocument {
  id: string;
  file_name: string;
  created_at: string;
  type: string;
  analysis?: string;
  confidence?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userName, setUserName] = useState<string>('User');
  const [documentsList, setDocumentsList] = useState<UserDocument[]>([]);
  const [chatCount, setChatCount] = useState<number>(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadDashboardData();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    // 1. Try local profile
    const localProfile = localStorage.getItem(`diagnosely_profile_${user.id}`);
    if (localProfile) {
      try {
        const p = JSON.parse(localProfile);
        const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
        if (name) {
          setUserName(name);
          return;
        }
      } catch (e) { }
    }

    // 2. Try user metadata from Auth
    const metaFirstName = user.user_metadata?.first_name;
    const metaLastName = user.user_metadata?.last_name;
    if (metaFirstName) {
      setUserName([metaFirstName, metaLastName].filter(Boolean).join(' '));
      return;
    }

    // 3. Try Supabase profiles table
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
        if (fullName) {
          setUserName(fullName);
          return;
        }
      }
    } catch (e) { }

    // Fallback to email username or 'User'
    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      setUserName(emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1));
    }
  };

  const loadDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // 1. Fetch real documents history
      const docs = await documentStorage.getAnalysisHistory(user.id);
      setDocumentsList(docs || []);

      // 2. Fetch real chat count
      let chatsNum = 0;
      const localChats = localStorage.getItem(`diagnosely_chats_${user.id}`);
      if (localChats) {
        try {
          const parsed = JSON.parse(localChats);
          chatsNum = parsed.length;
        } catch (e) { }
      }

      try {
        const { count } = await supabase
          .from('chat_sessions')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);
        if (count && count > chatsNum) {
          chatsNum = count;
        }
      } catch (e) { }

      setChatCount(chatsNum);

      // 3. Fetch real appointments
      const apts = getLocalAppointments(user.id);
      setAppointments(apts);
    } catch (e) {
      console.warn('Dashboard data fetch warning:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: "Analyzed Documents",
      value: documentsList.length.toString(),
      subtext: documentsList.length > 0 ? `${documentsList.length} report(s) active` : "No reports yet",
      icon: FileText,
      color: "text-emerald-600 bg-emerald-50"
    },
    {
      title: "AI Chat Sessions",
      value: chatCount.toString(),
      subtext: chatCount > 0 ? `${chatCount} active conversation(s)` : "Start your first chat",
      icon: MessageSquare,
      color: "text-indigo-600 bg-indigo-50"
    },
    {
      title: "Upcoming Appointments",
      value: appointments.filter(a => a.status === 'Confirmed').length.toString(),
      subtext: "Scheduled consultations",
      icon: Calendar,
      color: "text-amber-600 bg-amber-50"
    },
    {
      title: "Health Security",
      value: "100%",
      subtext: "Encrypted & HIPAA compliant",
      icon: Shield,
      color: "text-sky-600 bg-sky-50"
    }
  ];

  const quickActions = [
    {
      title: 'Upload Medical Receipt',
      description: 'Analyze lab reports & prescriptions',
      icon: Upload,
      link: '/upload',
      color: 'bg-primary text-white',
    },
    {
      title: 'Chat with AI Doctor',
      description: 'Get personalized health guidance',
      icon: MessageSquare,
      link: '/chat',
      color: 'bg-indigo-600 text-white',
    },
    {
      title: 'Book Appointment',
      description: 'Schedule a doctor consultation',
      icon: Calendar,
      link: '/appointments',
      color: 'bg-amber-600 text-white',
    },
    {
      title: 'My Medical Profile',
      description: 'Update health metrics & details',
      icon: User,
      link: '/profile',
      color: 'bg-emerald-600 text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-primary to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Badge className="bg-white/15 text-emerald-300 border-0 mb-2 px-3 py-1 font-semibold text-xs">
              Healthcare AI Portal
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {userName}!
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base mt-1.5 max-w-xl">
              Here is your personalized medical health overview and document activity.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button onClick={() => navigate('/upload')} className="rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold px-5 shadow-md">
              <Upload className="w-4 h-4 mr-2" /> Upload Receipt
            </Button>
            <Button onClick={() => navigate('/appointments')} variant="outline" className="rounded-xl border-white/30 text-slate-900 hover:bg-slate-100 font-semibold">
              <Calendar className="w-4 h-4 mr-2" /> Book Doctor
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="rounded-2xl shadow-sm border-0 bg-white hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
                  </div>
                  <div className={`p-3.5 rounded-2xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              onClick={() => navigate(action.link)}
              className="rounded-2xl border-0 shadow-sm bg-white hover:shadow-md cursor-pointer transition-all p-5 hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl shrink-0 ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{action.title}</h4>
                  <p className="text-xs text-slate-500 truncate">{action.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </Card>
          ))}
        </div>

        {/* Main Section: Recent Documents & Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Document Analysis History */}
          <Card className="rounded-2xl shadow-md border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Document Analysis History
                </CardTitle>
                <CardDescription className="text-xs">
                  Review your previously uploaded medical reports & prescriptions anytime.
                </CardDescription>
              </div>
              <Button onClick={() => navigate('/upload')} size="sm" variant="ghost" className="rounded-xl text-xs text-primary hover:bg-primary/5">
                + Upload New
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {documentsList.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-700 font-semibold text-sm">No Medical Documents Analyzed Yet</p>
                  <p className="text-slate-400 text-xs mt-1 mb-4">Upload a lab test or medical receipt to get instant AI diagnostic insights.</p>
                  <Button onClick={() => navigate('/upload')} className="rounded-xl bg-primary text-white text-xs">
                    Upload Your First Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {documentsList.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{doc.file_name}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="opacity-40">•</span>
                            <span className="capitalize">{doc.type || 'Medical Report'}</span>
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate(`/results?docId=${doc.id}`)}
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-xs font-semibold border-slate-200 text-primary hover:bg-primary hover:text-white shrink-0 ml-3"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Report
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="rounded-2xl shadow-md border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-500" /> Upcoming Doctor Consultations
                </CardTitle>
                <CardDescription className="text-xs">
                  Your scheduled appointments with specialist doctors.
                </CardDescription>
              </div>
              <Button onClick={() => navigate('/appointments')} size="sm" variant="ghost" className="rounded-xl text-xs text-amber-600 hover:bg-amber-50">
                Manage
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-700 font-semibold text-sm">No Appointments Scheduled</p>
                  <p className="text-slate-400 text-xs mt-1 mb-4">Book a consultation with a specialist physician.</p>
                  <Button onClick={() => navigate('/appointments')} className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs">
                    Book Appointment Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.slice(0, 4).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`p-2.5 rounded-xl shrink-0 ${apt.type === 'Video Call' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                          {apt.type === 'Video Call' ? <Video className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{apt.doctorName}</h4>
                            <Badge variant="outline" className="text-[10px] py-0 px-2 bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                              {apt.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {apt.specialty} • <span className="font-semibold text-slate-700">{apt.date} at {apt.time}</span>
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate('/appointments')}
                        size="sm"
                        variant="ghost"
                        className="rounded-xl text-xs text-slate-500 hover:text-slate-900 shrink-0 ml-2"
                      >
                        Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
