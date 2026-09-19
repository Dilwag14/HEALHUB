import { getRelativeDate } from "@/lib/utils";

// ---- Types ----

export type UserRole = "patient" | "doctor";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  avatar?: string;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialization: string;
  rating: number;
  reviewCount: number;
  clinicName: string;
  licenseNumber: string;
  bio: string;
  avatar?: string;
  availableSlots: AvailableSlot[];
}

export interface AvailableSlot {
  date: string;
  time: string;
  booked: boolean;
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  email: string;
  dob: string;
  bloodGroup: string;
  avatar?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  prescriptionId?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  duration: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorName: string;
  patientName: string;
  diagnosis: string;
  medications: Medication[];
  notes: string;
  createdAt: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  appointmentId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  prescription?: Prescription;
  files: string[];
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: "booking" | "cancellation" | "prescription" | "general";
  read: boolean;
  createdAt: string;
}

// ---- Helper: generate time slots ----

function generateSlots(daysAhead: number[]): AvailableSlot[] {
  const times = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  ];
  const slots: AvailableSlot[] = [];
  daysAhead.forEach((day) => {
    const date = getRelativeDate(day);
    times.forEach((time) => {
      slots.push({ date, time, booked: Math.random() > 0.7 });
    });
  });
  return slots;
}

// ---- Seed Data ----

export const mockUsers: User[] = [
  { id: "u1", role: "patient", name: "Sarah Johnson", email: "sarah@demo.com" },
  { id: "u2", role: "patient", name: "Alex Chen", email: "alex@demo.com" },
  { id: "u3", role: "doctor", name: "Dr. Emily Carter", email: "emily@demo.com" },
  { id: "u4", role: "doctor", name: "Dr. James Wilson", email: "james@demo.com" },
  { id: "u5", role: "doctor", name: "Dr. Priya Sharma", email: "priya@demo.com" },
  { id: "u6", role: "doctor", name: "Dr. Michael Brown", email: "michael@demo.com" },
  { id: "u7", role: "doctor", name: "Dr. Sofia Rodriguez", email: "sofia@demo.com" },
  { id: "u8", role: "doctor", name: "Dr. David Kim", email: "david@demo.com" },
];

export const mockDoctors: Doctor[] = [
  {
    id: "d1", userId: "u3", name: "Dr. Emily Carter", email: "emily@demo.com",
    specialization: "Cardiologist", rating: 4.9, reviewCount: 127,
    clinicName: "HeartCare Clinic", licenseNumber: "MC-2019-1234",
    bio: "Board-certified cardiologist with 15 years of experience in interventional cardiology and heart failure management.",
    availableSlots: generateSlots([0, 1, 2, 3, 4]),
  },
  {
    id: "d2", userId: "u4", name: "Dr. James Wilson", email: "james@demo.com",
    specialization: "Dermatologist", rating: 4.7, reviewCount: 98,
    clinicName: "SkinFirst Dermatology", licenseNumber: "MC-2018-5678",
    bio: "Specializing in medical and cosmetic dermatology, with expertise in skin cancer screening and treatment.",
    availableSlots: generateSlots([0, 1, 2, 3]),
  },
  {
    id: "d3", userId: "u5", name: "Dr. Priya Sharma", email: "priya@demo.com",
    specialization: "Pediatrician", rating: 4.8, reviewCount: 215,
    clinicName: "Little Stars Pediatrics", licenseNumber: "MC-2017-9012",
    bio: "Compassionate pediatrician dedicated to providing comprehensive healthcare for children from birth through adolescence.",
    availableSlots: generateSlots([0, 1, 2, 3, 4, 5]),
  },
  {
    id: "d4", userId: "u6", name: "Dr. Michael Brown", email: "michael@demo.com",
    specialization: "Neurologist", rating: 4.6, reviewCount: 76,
    clinicName: "BrainHealth Neurology", licenseNumber: "MC-2016-3456",
    bio: "Expert in diagnosing and treating neurological disorders including epilepsy, migraines, and movement disorders.",
    availableSlots: generateSlots([1, 2, 3, 4]),
  },
  {
    id: "d5", userId: "u7", name: "Dr. Sofia Rodriguez", email: "sofia@demo.com",
    specialization: "Orthopedic", rating: 4.8, reviewCount: 142,
    clinicName: "OrthoPlus Center", licenseNumber: "MC-2015-7890",
    bio: "Orthopedic surgeon specializing in sports medicine, joint replacement, and minimally invasive procedures.",
    availableSlots: generateSlots([0, 1, 2, 3, 4]),
  },
  {
    id: "d6", userId: "u8", name: "Dr. David Kim", email: "david@demo.com",
    specialization: "General Physician", rating: 4.5, reviewCount: 310,
    clinicName: "CommunityHealth Medical", licenseNumber: "MC-2020-2345",
    bio: "Family medicine physician providing comprehensive primary care for patients of all ages.",
    availableSlots: generateSlots([0, 1, 2, 3, 4, 5, 6]),
  },
];

export const mockPatients: Patient[] = [
  {
    id: "p1", userId: "u1", name: "Sarah Johnson", email: "sarah@demo.com",
    dob: "1990-05-15", bloodGroup: "O+",
  },
  {
    id: "p2", userId: "u2", name: "Alex Chen", email: "alex@demo.com",
    dob: "1985-11-22", bloodGroup: "A+",
  },
];

export let mockAppointments: Appointment[] = [
  {
    id: "apt1", patientId: "p1", patientName: "Sarah Johnson",
    doctorId: "d1", doctorName: "Dr. Emily Carter", doctorSpecialization: "Cardiologist",
    date: getRelativeDate(1), time: "10:00", status: "upcoming",
  },
  {
    id: "apt2", patientId: "p1", patientName: "Sarah Johnson",
    doctorId: "d3", doctorName: "Dr. Priya Sharma", doctorSpecialization: "Pediatrician",
    date: getRelativeDate(3), time: "14:30", status: "upcoming",
  },
  {
    id: "apt3", patientId: "p1", patientName: "Sarah Johnson",
    doctorId: "d2", doctorName: "Dr. James Wilson", doctorSpecialization: "Dermatologist",
    date: getRelativeDate(-7), time: "09:00", status: "completed", prescriptionId: "rx1",
  },
  {
    id: "apt4", patientId: "p1", patientName: "Sarah Johnson",
    doctorId: "d6", doctorName: "Dr. David Kim", doctorSpecialization: "General Physician",
    date: getRelativeDate(-14), time: "11:00", status: "completed", prescriptionId: "rx2",
  },
  {
    id: "apt5", patientId: "p1", patientName: "Sarah Johnson",
    doctorId: "d4", doctorName: "Dr. Michael Brown", doctorSpecialization: "Neurologist",
    date: getRelativeDate(-3), time: "15:00", status: "cancelled",
  },
  {
    id: "apt6", patientId: "p2", patientName: "Alex Chen",
    doctorId: "d1", doctorName: "Dr. Emily Carter", doctorSpecialization: "Cardiologist",
    date: getRelativeDate(2), time: "09:30", status: "upcoming",
  },
  {
    id: "apt7", patientId: "p2", patientName: "Alex Chen",
    doctorId: "d5", doctorName: "Dr. Sofia Rodriguez", doctorSpecialization: "Orthopedic",
    date: getRelativeDate(-5), time: "10:30", status: "completed", prescriptionId: "rx3",
  },
];

export let mockPrescriptions: Prescription[] = [
  {
    id: "rx1", appointmentId: "apt3",
    doctorName: "Dr. James Wilson", patientName: "Sarah Johnson",
    diagnosis: "Mild eczema on forearms with moderate itching. No signs of infection.",
    medications: [
      { name: "Hydrocortisone Cream 1%", dosage: "Apply twice daily", duration: "14 days" },
      { name: "Cetirizine 10mg", dosage: "1 tablet daily", duration: "7 days" },
    ],
    notes: "Avoid harsh soaps. Use fragrance-free moisturizer. Follow up in 2 weeks if symptoms persist.",
    createdAt: getRelativeDate(-7),
  },
  {
    id: "rx2", appointmentId: "apt4",
    doctorName: "Dr. David Kim", patientName: "Sarah Johnson",
    diagnosis: "Seasonal allergic rhinitis. Mild throat irritation.",
    medications: [
      { name: "Loratadine 10mg", dosage: "1 tablet daily", duration: "30 days" },
      { name: "Fluticasone Nasal Spray", dosage: "2 sprays each nostril daily", duration: "30 days" },
      { name: "Throat Lozenges", dosage: "As needed", duration: "7 days" },
    ],
    notes: "Stay hydrated. Use air purifier indoors during high pollen season.",
    createdAt: getRelativeDate(-14),
  },
  {
    id: "rx3", appointmentId: "apt7",
    doctorName: "Dr. Sofia Rodriguez", patientName: "Alex Chen",
    diagnosis: "Grade 1 ankle sprain, right foot. Mild swelling, no fracture on examination.",
    medications: [
      { name: "Ibuprofen 400mg", dosage: "1 tablet every 8 hours with food", duration: "5 days" },
      { name: "Diclofenac Gel 1%", dosage: "Apply to affected area 3 times daily", duration: "10 days" },
    ],
    notes: "RICE protocol: Rest, Ice (20 min every 2 hours), Compression bandage, Elevation. Avoid weight-bearing activities for 1 week. Follow up if pain persists.",
    createdAt: getRelativeDate(-5),
  },
];

export let mockHealthRecords: HealthRecord[] = [
  {
    id: "hr1", patientId: "p1", appointmentId: "apt3",
    doctorName: "Dr. James Wilson", date: getRelativeDate(-7),
    diagnosis: "Mild eczema on forearms",
    prescription: mockPrescriptions[0], files: [],
  },
  {
    id: "hr2", patientId: "p1", appointmentId: "apt4",
    doctorName: "Dr. David Kim", date: getRelativeDate(-14),
    diagnosis: "Seasonal allergic rhinitis",
    prescription: mockPrescriptions[1], files: [],
  },
  {
    id: "hr3", patientId: "p2", appointmentId: "apt7",
    doctorName: "Dr. Sofia Rodriguez", date: getRelativeDate(-5),
    diagnosis: "Grade 1 ankle sprain",
    prescription: mockPrescriptions[2], files: [],
  },
];

export let mockNotifications: Notification[] = [
  {
    id: "n1", userId: "u1",
    message: "Your appointment with Dr. Emily Carter is confirmed for tomorrow at 10:00 AM.",
    type: "booking", read: false, createdAt: new Date().toISOString(),
  },
  {
    id: "n2", userId: "u1",
    message: "Dr. Priya Sharma has confirmed your appointment for " + getRelativeDate(3) + ".",
    type: "booking", read: false, createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "n3", userId: "u1",
    message: "Your prescription from Dr. James Wilson is ready to view.",
    type: "prescription", read: true, createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "n4", userId: "u3",
    message: "New appointment booked by Sarah Johnson for tomorrow at 10:00 AM.",
    type: "booking", read: false, createdAt: new Date().toISOString(),
  },
  {
    id: "n5", userId: "u3",
    message: "New appointment booked by Alex Chen for " + getRelativeDate(2) + " at 9:30 AM.",
    type: "booking", read: false, createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];
