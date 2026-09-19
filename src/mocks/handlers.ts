import { http, HttpResponse, delay } from "msw";
import {
  mockUsers,
  mockDoctors,
  mockPatients,
  mockAppointments,
  mockPrescriptions,
  mockHealthRecords,
  mockNotifications,
  type User,
  type Appointment,
  type Prescription,
  type HealthRecord,
  type Notification,
} from "./data";
import { generateId, getRelativeDate } from "@/lib/utils";

// Simple JWT mock
function createToken(userId: string): string {
  return btoa(JSON.stringify({ userId, exp: Date.now() + 86400000 }));
}

function getUserFromToken(authHeader: string | null): User | null {
  if (!authHeader) return null;
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = JSON.parse(atob(token));
    return mockUsers.find((u) => u.id === payload.userId) ?? null;
  } catch {
    return null;
  }
}

export const handlers = [
  // ---- Auth ----
  http.post("/api/auth/login", async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { email: string; password: string };
    const user = mockUsers.find((u) => u.email === body.email);
    if (!user) {
      return HttpResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }
    const token = createToken(user.id);
    const patient = mockPatients.find((p) => p.userId === user.id);
    const doctor = mockDoctors.find((d) => d.userId === user.id);
    return HttpResponse.json({
      user,
      token,
      profile: patient || doctor,
    });
  }),

  http.post("/api/auth/register", async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as {
      role: string;
      name: string;
      email: string;
      password: string;
      [key: string]: string;
    };
    // Check if email already exists
    if (mockUsers.find((u) => u.email === body.email)) {
      return HttpResponse.json({ message: "Email already registered" }, { status: 409 });
    }
    const userId = generateId();
    const newUser: User = {
      id: userId,
      role: body.role as "patient" | "doctor",
      name: body.name,
      email: body.email,
    };
    mockUsers.push(newUser);

    if (body.role === "patient") {
      mockPatients.push({
        id: generateId(),
        userId,
        name: body.name,
        email: body.email,
        dob: body.dob || "",
        bloodGroup: body.bloodGroup || "",
      });
    } else {
      mockDoctors.push({
        id: generateId(),
        userId,
        name: body.name,
        email: body.email,
        specialization: body.specialization || "",
        rating: 4.5,
        reviewCount: 0,
        clinicName: body.clinicName || "",
        licenseNumber: body.licenseNumber || "",
        bio: "New doctor on HEALHUB.",
        availableSlots: [],
      });
    }

    const token = createToken(userId);
    return HttpResponse.json({ user: newUser, token }, { status: 201 });
  }),

  http.get("/api/auth/me", async ({ request }) => {
    await delay(100);
    const user = getUserFromToken(request.headers.get("Authorization"));
    if (!user) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const patient = mockPatients.find((p) => p.userId === user.id);
    const doctor = mockDoctors.find((d) => d.userId === user.id);
    return HttpResponse.json({ user, profile: patient || doctor });
  }),

  // ---- Doctors ----
  http.get("/api/doctors", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const specialization = url.searchParams.get("specialization") || "";
    const minRating = parseFloat(url.searchParams.get("minRating") || "0");
    const availability = url.searchParams.get("availability") || "";

    let results = [...mockDoctors];

    if (search) {
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(search) ||
          d.specialization.toLowerCase().includes(search) ||
          d.clinicName.toLowerCase().includes(search)
      );
    }

    if (specialization) {
      results = results.filter(
        (d) => d.specialization.toLowerCase() === specialization.toLowerCase()
      );
    }

    if (minRating > 0) {
      results = results.filter((d) => d.rating >= minRating);
    }

    if (availability === "today") {
      const today = getRelativeDate(0);
      results = results.filter((d) =>
        d.availableSlots.some((s) => s.date === today && !s.booked)
      );
    } else if (availability === "this-week") {
      const weekDates = Array.from({ length: 7 }, (_, i) => getRelativeDate(i));
      results = results.filter((d) =>
        d.availableSlots.some((s) => weekDates.includes(s.date) && !s.booked)
      );
    }

    return HttpResponse.json(results);
  }),

  http.get("/api/doctors/:id", async ({ params }) => {
    await delay(200);
    const doctor = mockDoctors.find((d) => d.id === params.id);
    if (!doctor) {
      return HttpResponse.json({ message: "Doctor not found" }, { status: 404 });
    }
    return HttpResponse.json(doctor);
  }),

  // ---- Appointments ----
  http.get("/api/appointments", async ({ request }) => {
    await delay(300);
    const user = getUserFromToken(request.headers.get("Authorization"));
    if (!user) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let appointments: Appointment[];
    if (user.role === "patient") {
      const patient = mockPatients.find((p) => p.userId === user.id);
      appointments = mockAppointments.filter((a) => a.patientId === patient?.id);
    } else {
      const doctor = mockDoctors.find((d) => d.userId === user.id);
      appointments = mockAppointments.filter((a) => a.doctorId === doctor?.id);
    }

    // Sort by date desc
    appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return HttpResponse.json(appointments);
  }),

  http.post("/api/appointments", async ({ request }) => {
    await delay(400);
    const user = getUserFromToken(request.headers.get("Authorization"));
    if (!user) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      doctorId: string;
      date: string;
      time: string;
    };

    const doctor = mockDoctors.find((d) => d.id === body.doctorId);
    const patient = mockPatients.find((p) => p.userId === user.id);
    if (!doctor || !patient) {
      return HttpResponse.json({ message: "Invalid doctor or patient" }, { status: 400 });
    }

    // Mark slot as booked
    const slot = doctor.availableSlots.find(
      (s) => s.date === body.date && s.time === body.time
    );
    if (slot) slot.booked = true;

    const newAppointment: Appointment = {
      id: generateId(),
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      date: body.date,
      time: body.time,
      status: "upcoming",
    };

    mockAppointments.push(newAppointment);

    // Add notification for doctor
    const doctorNotif: Notification = {
      id: generateId(),
      userId: doctor.userId,
      message: `New appointment booked by ${patient.name} for ${body.date} at ${body.time}.`,
      type: "booking",
      read: false,
      createdAt: new Date().toISOString(),
    };
    mockNotifications.push(doctorNotif);

    // Add notification for patient
    const patientNotif: Notification = {
      id: generateId(),
      userId: user.id,
      message: `Your appointment with ${doctor.name} has been confirmed for ${body.date} at ${body.time}.`,
      type: "booking",
      read: false,
      createdAt: new Date().toISOString(),
    };
    mockNotifications.push(patientNotif);

    return HttpResponse.json(newAppointment, { status: 201 });
  }),

  http.patch("/api/appointments/:id", async ({ params, request }) => {
    await delay(300);
    const user = getUserFromToken(request.headers.get("Authorization"));
    if (!user) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { status: string };
    const appointment = mockAppointments.find((a) => a.id === params.id);
    if (!appointment) {
      return HttpResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    appointment.status = body.status as Appointment["status"];

    // Add notification
    if (body.status === "cancelled") {
      const notif: Notification = {
        id: generateId(),
        userId: user.role === "patient"
          ? mockDoctors.find((d) => d.id === appointment.doctorId)?.userId || ""
          : mockPatients.find((p) => p.id === appointment.patientId)?.userId || "",
        message: `Appointment on ${appointment.date} at ${appointment.time} has been cancelled.`,
        type: "cancellation",
        read: false,
        createdAt: new Date().toISOString(),
      };
      mockNotifications.push(notif);
    }

    return HttpResponse.json(appointment);
  }),

  // ---- Prescriptions ----
  http.get("/api/prescriptions/:id", async ({ params }) => {
    await delay(200);
    const prescription = mockPrescriptions.find((p) => p.id === params.id);
    if (!prescription) {
      return HttpResponse.json({ message: "Prescription not found" }, { status: 404 });
    }
    return HttpResponse.json(prescription);
  }),

  http.post("/api/prescriptions", async ({ request }) => {
    await delay(400);
    const user = getUserFromToken(request.headers.get("Authorization"));
    if (!user) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      appointmentId: string;
      diagnosis: string;
      medications: { name: string; dosage: string; duration: string }[];
      notes: string;
    };

    const appointment = mockAppointments.find((a) => a.id === body.appointmentId);
    if (!appointment) {
      return HttpResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    const doctor = mockDoctors.find((d) => d.userId === user.id);

    const newPrescription: Prescription = {
      id: generateId(),
      appointmentId: body.appointmentId,
      doctorName: doctor?.name || user.name,
      patientName: appointment.patientName,
      diagnosis: body.diagnosis,
      medications: body.medications,
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
    };

    mockPrescriptions.push(newPrescription);
    appointment.prescriptionId = newPrescription.id;

    // Create health record
    const newRecord: HealthRecord = {
      id: generateId(),
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      doctorName: doctor?.name || user.name,
      date: appointment.date,
      diagnosis: body.diagnosis,
      prescription: newPrescription,
      files: [],
    };
    mockHealthRecords.push(newRecord);

    // Add notification for patient
    const patient = mockPatients.find((p) => p.id === appointment.patientId);
    if (patient) {
      const notif: Notification = {
        id: generateId(),
        userId: patient.userId,
        message: `Your prescription from ${doctor?.name || user.name} is ready to view.`,
        type: "prescription",
        read: false,
        createdAt: new Date().toISOString(),
      };
      mockNotifications.push(notif);
    }

    return HttpResponse.json(newPrescription, { status: 201 });
  }),

  // ---- Health Records ----
  http.get("/api/health-records", async ({ request }) => {
    await delay(300);
    const user = getUserFromToken(request.headers.get("Authorization"));
    if (!user) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const patientId = url.searchParams.get("patientId");

    let records: HealthRecord[];
    if (patientId) {
      records = mockHealthRecords.filter((r) => r.patientId === patientId);
    } else if (user.role === "patient") {
      const patient = mockPatients.find((p) => p.userId === user.id);
      records = mockHealthRecords.filter((r) => r.patientId === patient?.id);
    } else {
      records = mockHealthRecords;
    }

    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return HttpResponse.json(records);
  }),

  http.post("/api/health-records/upload", async ({ request }) => {
    await delay(500);
    const user = getUserFromToken(request.headers.get("Authorization"));
    if (!user) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { recordId: string; file: string };
    const record = mockHealthRecords.find((r) => r.id === body.recordId);
    if (record) {
      record.files.push(body.file);
    }

    return HttpResponse.json({ success: true });
  }),

  // ---- Notifications ----
  http.get("/api/notifications", async ({ request }) => {
    await delay(200);
    const user = getUserFromToken(request.headers.get("Authorization"));
    if (!user) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const notifications = mockNotifications
      .filter((n) => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return HttpResponse.json(notifications);
  }),

  http.patch("/api/notifications/:id/read", async ({ params }) => {
    await delay(100);
    const notification = mockNotifications.find((n) => n.id === params.id);
    if (notification) {
      notification.read = true;
    }
    return HttpResponse.json({ success: true });
  }),

  http.patch("/api/notifications/read-all", async ({ request }) => {
    await delay(100);
    const user = getUserFromToken(request.headers.get("Authorization"));
    if (!user) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    mockNotifications
      .filter((n) => n.userId === user.id)
      .forEach((n) => (n.read = true));
    return HttpResponse.json({ success: true });
  }),

  // ---- Patients (for doctor lookup) ----
  http.get("/api/patients", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";

    let patients = [...mockPatients];
    if (search) {
      patients = patients.filter((p) =>
        p.name.toLowerCase().includes(search)
      );
    }

    return HttpResponse.json(patients);
  }),
];
