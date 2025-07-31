import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Upload, MessageSquare, FileText, Calendar, TrendingUp, Activity, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalDocuments: number;
  totalConversations: number;
  recentDocuments: Array<{
    id: string;
    file_name: string;
    created_at: string;
    type: string;
  }>;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [userName, setUserName] = useState('User');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalConversations: 0,
    recentDocuments: []
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchDashboardData();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (profile) {
        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(' ');
        setUserName(fullName || 'User');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Get documents data
      const { data: documents, error: docError } = await supabase
        .from('document_analysis')
        .select('id, file_name, created_at, type')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (docError) throw docError;

      // Get conversations count
      const { count: conversationsCount, error: convError } = await supabase
        .from('chat_sessions')
        .select('id', { count: 'exact' })
        .eq('user_id', user?.id);

      if (convError) throw convError;

      setDashboardStats({
        totalDocuments: documents?.length || 0,
        totalConversations: conversationsCount || 0,
        recentDocuments: documents?.slice(0, 3) || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const stats = [
    {
      title: "Total Documents",
      value: "28",
      change: "+12% from last month",
      icon: FileText
    },
    {
      title: "AI Chats",
      value: "149",
      change: "+25% from last month",
      icon: MessageSquare
    },
    {
      title: "Health Score",
      value: "92",
      change: "+5% from last check",
      icon: Activity
    },
    {
      title: "Documents Shared",
      value: "12",
      change: "+2 this week",
      icon: Upload
    }
  ];

  const recentActivity = [
    {
      title: "Uploaded Blood Test Report",
      time: "2 hours ago",
      icon: FileText
    },
    {
      title: "AI Chat Session",
      time: "5 hours ago",
      icon: MessageSquare
    },
    {
      title: "Updated Health Profile",
      time: "1 day ago",
      icon: Activity
    }
  ];

  const appointments = [
    {
      title: "Annual Check-up",
      time: "Tomorrow at 10:00 AM",
      icon: Calendar
    },
    {
      title: "Blood Test",
      time: "Next Week, Monday 9:00 AM",
      icon: Activity
    },
    {
      title: "Follow-up Consultation",
      time: "March 25, 2:30 PM",
      icon: MessageSquare
    }
  ];

  const quickActions = [
    {
      title: 'Upload Receipt',
      description: 'Analyze your latest prescription',
      icon: Upload,
      link: '/upload',
      color: 'bg-primary',
    },
    {
      title: 'Chat with AI',
      description: 'Get personalized advice',
      icon: MessageSquare,
      link: '/chat',
      color: 'bg-accent',
    },
    {
      title: 'Health Reports',
      description: 'View your health insights',
      icon: TrendingUp,
      link: '#',
      color: 'bg-secondary',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, {userName}!</h1>
          <p className="text-xl text-muted-foreground">Here's your health overview for today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="rounded-2xl shadow-lg border-0 bg-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm flex items-center mt-1 text-muted-foreground">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className="bg-muted rounded-2xl p-3">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="rounded-2xl shadow-lg border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                <Clock className="h-6 w-6 text-primary mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-muted rounded-xl p-2">
                      <activity.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                <Calendar className="h-6 w-6 text-primary mr-2" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-muted rounded-xl p-2">
                      <appointment.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{appointment.title}</p>
                      <p className="text-xs text-muted-foreground">{appointment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="rounded-2xl shadow-lg border-0 bg-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                <Shield className="h-6 w-6 text-primary mr-2" />
                Health Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-2">Document Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You've analyzed {dashboardStats.totalDocuments} medical documents so far.
                  </p>
                  <div className="w-full bg-background rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (dashboardStats.totalDocuments / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-muted rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-2">AI Interactions</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    You've had {dashboardStats.totalConversations} conversations with our AI
                  </p>
                  <div className="flex items-center text-sm text-primary font-medium">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Keep asking questions to improve your health knowledge
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
