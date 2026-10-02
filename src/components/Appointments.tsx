import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, User, Video, MapPin, Plus, CheckCircle, AlertCircle, XCircle, ArrowLeft, Stethoscope } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'In-Person' | 'Video Call';
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  location: string;
  notes?: string;
}

const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1',
    doctorName: 'Dr. Robert Chen, MD',
    specialty: 'Cardiology',
    date: '2026-10-05',
    time: '10:00 AM',
    type: 'In-Person',
    status: 'Confirmed',
    location: 'Suite 402, St. Jude Medical Center',
    notes: 'Routine blood pressure and cardiac checkup.'
  },
  {
    id: 'apt_2',
    doctorName: 'Dr. Ananya Sharma, MD',
    specialty: 'General Medicine',
    date: '2026-10-12',
    time: '02:30 PM',
    type: 'Video Call',
    status: 'Confirmed',
    location: 'Diagnosely Virtual Care Room 3',
    notes: 'Discussion of latest lab analysis results.'
  }
];

export const getLocalAppointments = (userId?: string): Appointment[] => {
  if (!userId) return DEFAULT_APPOINTMENTS;
  try {
    const raw = localStorage.getItem(`diagnosely_appointments_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) { }
  return DEFAULT_APPOINTMENTS;
};

export const saveLocalAppointments = (userId: string, appointments: Appointment[]) => {
  try {
    localStorage.setItem(`diagnosely_appointments_${userId}`, JSON.stringify(appointments));
  } catch (e) { }
};

const Appointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    doctorName: 'Dr. Sarah Jenkins, MD',
    specialty: 'General Medicine',
    date: '2026-10-15',
    time: '11:00 AM',
    type: 'In-Person' as 'In-Person' | 'Video Call',
    location: 'Diagnosely Health Center, Building B',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      setAppointments(getLocalAppointments(user.id));
    }
  }, [user]);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newApt: Appointment = {
      id: 'apt_' + Date.now(),
      doctorName: formData.doctorName,
      specialty: formData.specialty,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      status: 'Confirmed',
      location: formData.location,
      notes: formData.notes
    };

    const updated = [newApt, ...appointments];
    setAppointments(updated);
    saveLocalAppointments(user.id, updated);

    toast({
      title: "Appointment Booked!",
      description: `Your appointment with ${formData.doctorName} on ${formData.date} at ${formData.time} has been confirmed.`,
    });

    setIsDialogOpen(false);
  };

  const handleCancelAppointment = (id: string) => {
    if (!user) return;
    const updated = appointments.map(apt =>
      apt.id === id ? { ...apt, status: 'Cancelled' as const } : apt
    );
    setAppointments(updated);
    saveLocalAppointments(user.id, updated);

    toast({
      title: "Appointment Cancelled",
      description: "The appointment status has been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Medical Appointments</h1>
            <p className="text-slate-500 text-sm mt-1">Book and manage your consultations with specialist physicians.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white font-medium shadow-md">
                <Plus className="w-4 h-4 mr-2" /> Book New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <Stethoscope className="w-5 h-5 text-primary" /> Book Consultation
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBookAppointment} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="doctorName">Doctor Name & Credentials</Label>
                  <Input
                    id="doctorName"
                    value={formData.doctorName}
                    onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
                    className="rounded-xl h-10"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="specialty">Specialty</Label>
                    <select
                      id="specialty"
                      value={formData.specialty}
                      onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 py-1.5 text-sm"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="type">Consultation Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 py-1.5 text-sm"
                    >
                      <option value="In-Person">In-Person Clinic</option>
                      <option value="Video Call">Virtual Video Call</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="rounded-xl h-10"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="time">Time Slot</Label>
                    <Input
                      id="time"
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      className="rounded-xl h-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location">Clinic Location / Room</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="rounded-xl h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Symptoms / Patient Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Brief description of symptoms or questions..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="rounded-xl h-10"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/90 text-white">
                    Confirm Booking
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments List */}
        <div className="grid gap-6">
          {appointments.length === 0 ? (
            <Card className="rounded-2xl border-0 shadow-md p-8 text-center bg-white">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-800">No Appointments Scheduled</h3>
              <p className="text-slate-500 text-sm mb-4">You have no upcoming or past doctor consultations.</p>
              <Button onClick={() => setIsDialogOpen(true)} className="rounded-xl bg-primary text-white">
                Book Your First Appointment
              </Button>
            </Card>
          ) : (
            appointments.map((apt) => (
              <Card key={apt.id} className="rounded-2xl border-0 shadow-md bg-white overflow-hidden hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                    <div className="flex items-start space-x-4">
                      <div className={`p-3.5 rounded-2xl flex items-center justify-center shrink-0 ${apt.type === 'Video Call' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        {apt.type === 'Video Call' ? <Video className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-900">{apt.doctorName}</h3>
                          <Badge variant="outline" className={`text-xs font-semibold rounded-lg px-2.5 py-0.5 ${apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              apt.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            {apt.status === 'Confirmed' && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                            {apt.status === 'Cancelled' && <XCircle className="w-3 h-3 mr-1 inline" />}
                            {apt.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-primary mb-2">{apt.specialty}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400" /> {apt.date}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Clock className="w-4 h-4 text-slate-400" /> {apt.time}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-4 h-4 text-slate-400" /> {apt.location}
                          </span>
                        </div>

                        {apt.notes && (
                          <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100 italic">
                            Notes: "{apt.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                      {apt.type === 'Video Call' && apt.status === 'Confirmed' && (
                        <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                          <Video className="w-3.5 h-3.5 mr-1.5" /> Join Meeting
                        </Button>
                      )}
                      {apt.status === 'Confirmed' && (
                        <Button
                          onClick={() => handleCancelAppointment(apt.id)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Appointments;
