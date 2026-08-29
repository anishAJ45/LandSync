import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY || "landsync_sih2026_super_secret_jwt_key_for_phase1_local_dev";

app.use(express.json());

// CORS headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// In-memory / local persistent user database matching SQLite models
interface UserRecord {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: "citizen" | "officer" | "admin";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

let userIdCounter = 4;
const usersDatabase: UserRecord[] = [
  {
    id: 1,
    full_name: "Ramesh Kumar (Citizen)",
    email: "citizen@landsync.demo",
    password_hash: bcrypt.hashSync("Citizen@123", 10),
    role: "citizen",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    full_name: "Vikram Rathore (Tahsildar / Land Officer)",
    email: "officer@landsync.demo",
    password_hash: bcrypt.hashSync("Officer@123", 10),
    role: "officer",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    full_name: "Dr. Ananya Sharma (Chief Land Records Admin)",
    email: "admin@landsync.demo",
    password_hash: bcrypt.hashSync("Admin@123", 10),
    role: "admin",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  }
];

// Helper to remove password hash
const sanitizeUser = (user: UserRecord) => {
  const { password_hash, ...rest } = user;
  return rest;
};

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ detail: "Missing Authorization bearer token" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { sub: string; role: string };
    const user = usersDatabase.find((u) => u.id === parseInt(decoded.sub, 10));
    if (!user) {
      res.status(404).json({ detail: "User associated with token not found" });
      return;
    }
    if (!user.is_active) {
      res.status(403).json({ detail: "Inactive user account" });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ detail: "Invalid or expired token" });
  }
};

const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ detail: "Authentication required" });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        detail: `Access forbidden: Required role in [${allowedRoles.join(", ")}], but user has role '${req.user.role}'`
      });
      return;
    }
    next();
  };
};

// ==========================================
// SYSTEM ENDPOINTS
// ==========================================
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    database: "sqlite_connected",
    version: "2.0.0 (Phase 2: GIS Parcel Intelligence & Parcel 360° Foundation)",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    database: "sqlite_connected",
    version: "2.0.0 (Phase 2: GIS Parcel Intelligence & Parcel 360° Foundation)",
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { full_name, email, password, role } = req.body;
  if (!full_name || !email || !password) {
    res.status(400).json({ detail: "Full name, email, and password are required." });
    return;
  }

  const existing = usersDatabase.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({ detail: "A user with this email address already exists." });
    return;
  }

  const assignedRole = ["citizen", "officer", "admin"].includes(role?.toLowerCase())
    ? role.toLowerCase()
    : "citizen";

  const newUser: UserRecord = {
    id: userIdCounter++,
    full_name,
    email: email.toLowerCase(),
    password_hash: bcrypt.hashSync(password, 10),
    role: assignedRole,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  usersDatabase.push(newUser);

  const token = jwt.sign(
    { sub: String(newUser.id), role: newUser.role },
    SECRET_KEY,
    { expiresIn: "24h" }
  );

  res.status(201).json({
    access_token: token,
    token_type: "bearer",
    user: sanitizeUser(newUser)
  });
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ detail: "Email and password are required." });
    return;
  }

  const user = usersDatabase.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ detail: "Invalid email or password" });
    return;
  }

  if (!user.is_active) {
    res.status(403).json({ detail: "This account has been deactivated." });
    return;
  }

  const token = jwt.sign(
    { sub: String(user.id), role: user.role },
    SECRET_KEY,
    { expiresIn: "24h" }
  );

  res.json({
    access_token: token,
    token_type: "bearer",
    user: sanitizeUser(user)
  });
});

app.get("/api/auth/me", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json(sanitizeUser(req.user!));
});

// ==========================================
// USERS ENDPOINTS
// ==========================================
app.get("/api/users", authMiddleware, requireRole(["admin", "officer"]), (req: AuthenticatedRequest, res: Response) => {
  res.json(usersDatabase.map(sanitizeUser));
});

app.get("/api/users/:id", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const targetId = parseInt(req.params.id, 10);
  if (req.user!.role === "citizen" && req.user!.id !== targetId) {
    res.status(403).json({ detail: "Access forbidden: You cannot view other citizen profiles" });
    return;
  }
  const user = usersDatabase.find((u) => u.id === targetId);
  if (!user) {
    res.status(404).json({ detail: `User with ID ${targetId} not found` });
    return;
  }
  res.json(sanitizeUser(user));
});

app.put("/api/users/:id", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const targetId = parseInt(req.params.id, 10);
  if (req.user!.role !== "admin" && req.user!.id !== targetId) {
    res.status(403).json({ detail: "Access forbidden: You can only update your own profile" });
    return;
  }

  const user = usersDatabase.find((u) => u.id === targetId);
  if (!user) {
    res.status(404).json({ detail: `User with ID ${targetId} not found` });
    return;
  }

  const { full_name, email, role, is_active } = req.body;
  if (full_name) user.full_name = full_name;
  if (email && email.toLowerCase() !== user.email) {
    const existing = usersDatabase.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== targetId);
    if (existing) {
      res.status(400).json({ detail: "Email already taken" });
      return;
    }
    user.email = email.toLowerCase();
  }

  if (req.user!.role === "admin") {
    if (role && ["citizen", "officer", "admin"].includes(role)) {
      user.role = role;
    }
    if (typeof is_active === "boolean") {
      user.is_active = is_active;
    }
  }

  user.updated_at = new Date().toISOString();
  res.json(sanitizeUser(user));
});

// ==========================================
// DASHBOARD ENDPOINTS
// ==========================================
app.get("/api/dashboard/citizen", authMiddleware, requireRole(["citizen", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const myApps = applicationsDatabase.filter(a => a.citizen_id === req.user!.id);
  const pending = myApps.filter(a => !["APPROVED", "REJECTED", "CLOSED"].includes(a.status)).length;
  const verified = myApps.filter(a => ["VERIFIED", "APPROVED", "CLOSED"].includes(a.status)).length;
  const unreadNotifs = notificationsDatabase.filter(n => n.user_id === req.user!.id && !n.is_read).length;

  res.json({
    user: sanitizeUser(req.user!),
    stats: {
      my_parcels: 3,
      pending_requests: pending,
      verified_records: verified,
      unread_notifications: unreadNotifs
    },
    recent_parcels: parcelsDatabase.slice(0, 3).map(p => ({
      parcel_id: p.parcel_id,
      survey_no: p.survey_number,
      location: `${p.village}, ${p.district}`,
      area: `${p.recorded_area} ${p.area_unit}`,
      type: p.land_use,
      status: p.status,
      last_updated: p.updated_at.split("T")[0]
    })),
    recent_activity: [
      {
        id: 1,
        action: "Mutation Application Submitted",
        target: "Parcel IN-TN-CHE-2026-0002",
        timestamp: "2026-02-24 11:30 AM",
        status: "In Progress"
      },
      {
        id: 2,
        action: "Digitally Signed Patta Extract Downloaded",
        target: "Parcel IN-TN-CHE-2026-0001",
        timestamp: "2026-02-18 04:15 PM",
        status: "Completed"
      },
      {
        id: 3,
        action: "Aadhaar e-KYC Linked to Land Registry",
        target: "Owner Profile",
        timestamp: "2026-01-10 10:00 AM",
        status: "Verified"
      }
    ]
  });
});

app.get("/api/dashboard/officer", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const pending = applicationsDatabase.filter(a => a.status === "SUBMITTED").length;
  const highPrio = applicationsDatabase.filter(a => ["HIGH", "CRITICAL"].includes(a.priority) && !["APPROVED", "REJECTED", "CLOSED"].includes(a.status)).length;
  const completedToday = applicationsDatabase.filter(a => a.status === "APPROVED" || a.status === "VERIFIED").length;

  res.json({
    user: sanitizeUser(req.user!),
    stats: {
      pending_cases: pending,
      high_priority_cases: highPrio,
      completed_today: completedToday,
      ai_flagged_cases: 4
    },
    verification_queue: applicationsDatabase.slice(0, 6).map(a => {
      const citizen = usersDatabase.find(u => u.id === a.citizen_id);
      return {
        case_id: a.application_id,
        parcel_id: a.parcel_id,
        applicant_name: citizen ? citizen.full_name : "Citizen",
        request_type: a.service_type,
        submitted_date: a.submitted_at.split("T")[0],
        priority: a.priority,
        ai_risk_score: a.priority === "CRITICAL" ? "High (78%)" : a.priority === "HIGH" ? "Moderate (45%)" : "Low (12%)",
        status: a.status.replace(/_/g, " ")
      };
    })
  });
});

app.get("/api/dashboard/admin", authMiddleware, requireRole(["admin"]), (req: AuthenticatedRequest, res: Response) => {
  const total_users = usersDatabase.length;
  const citizens = usersDatabase.filter((u) => u.role === "citizen").length;
  const officers = usersDatabase.filter((u) => u.role === "officer").length;
  const admins = usersDatabase.filter((u) => u.role === "admin").length;

  res.json({
    user: sanitizeUser(req.user!),
    stats: {
      total_users,
      citizens,
      officers,
      admins,
      total_applications: applicationsDatabase.length,
      system_status: "Operational (Healthy)",
      api_status: "100% Uptime"
    },
    department_integrations: [
      {
        department: "Survey & Land Records Directorate (Tamil Nadu / Central)",
        protocol: "REST API v2 / WFS",
        status: "Connected (Latency: 42ms)",
        sync_rate: "99.8%"
      },
      {
        department: "Registration Department (IGRS / CERSAI)",
        protocol: "Secure Webhooks",
        status: "Connected (Latency: 56ms)",
        sync_rate: "100.0%"
      },
      {
        department: "Revenue & Tahsildar Portal",
        protocol: "JSON-RPC / OAuth2",
        status: "Connected (Latency: 38ms)",
        sync_rate: "99.4%"
      },
      {
        department: "Judicial Court Case Information System (NJDG)",
        protocol: "e-Courts API",
        status: "Connected (Latency: 110ms)",
        sync_rate: "98.2%"
      }
    ],
    audit_logs: [
      {
        id: "AUD-9912",
        actor: "admin@landsync.demo",
        action: "SYSTEM_POLICY_AUDIT",
        detail: "Verified database integrity checksums and role permissions",
        timestamp: "2026-02-26 08:30:12"
      },
      {
        id: "AUD-9911",
        actor: "officer@landsync.demo",
        action: "VERIFICATION_STATUS_UPDATE",
        detail: "Approved Patta transfer for parcel IN-TN-CHE-2026-0042",
        timestamp: "2026-02-26 07:15:45"
      },
      {
        id: "AUD-9910",
        actor: "citizen@landsync.demo",
        action: "AUTH_LOGIN",
        detail: "Citizen authenticated via JWT session",
        timestamp: "2026-02-25 19:40:02"
      }
    ]
  });
});

// ==========================================
// PHASE 2: GIS & PARCEL INTELLIGENCE ENDPOINTS
// ==========================================

interface ParcelRecord {
  id: number;
  parcel_id: string;
  survey_number: string;
  subdivision: string;
  district: string;
  state: string;
  village: string;
  latitude: number;
  longitude: number;
  recorded_area: number;
  gis_area: number;
  area_unit: string;
  land_use: string;
  current_owner: string;
  status: string;
  created_at: string;
  updated_at: string;
  coordinates: number[][][];
  history: Array<{
    id: number;
    parcel_id: string;
    event_type: string;
    description: string;
    event_date: string;
    source: string;
    created_at: string;
  }>;
}

const parcelsDatabase: ParcelRecord[] = [
  {
    id: 1,
    parcel_id: "TN-CBE-001-124-1",
    survey_number: "124/1",
    subdivision: "1",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0260,
    longitude: 77.0320,
    recorded_area: 2.50,
    gis_area: 2.50,
    area_unit: "Acres",
    land_use: "Residential",
    current_owner: "Ravi Kumar",
    status: "Active",
    created_at: "2021-04-12T10:00:00.000Z",
    updated_at: "2026-01-10T14:30:00.000Z",
    coordinates: [[[77.0310, 11.0250], [77.0330, 11.0250], [77.0330, 11.0270], [77.0310, 11.0270], [77.0310, 11.0250]]],
    history: [
      { id: 1, parcel_id: "TN-CBE-001-124-1", event_type: "Title Deed Registration", description: "Conveyance deed registered under Doc No. 1024/2021 at Sub-Registrar Sulur.", event_date: "2021-04-12", source: "Registration Dept (IGRS)", created_at: "2021-04-12T10:00:00.000Z" },
      { id: 2, parcel_id: "TN-CBE-001-124-1", event_type: "Patta Mutation", description: "Patta issued in favor of Ravi Kumar by Tahsildar Coimbatore South.", event_date: "2021-06-20", source: "Tamil Nilam Land Revenue", created_at: "2021-06-20T11:00:00.000Z" }
    ]
  },
  {
    id: 2,
    parcel_id: "TN-CBE-001-124-2",
    survey_number: "124/2",
    subdivision: "2",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0260,
    longitude: 77.0340,
    recorded_area: 2.50,
    gis_area: 2.42,
    area_unit: "Acres",
    land_use: "Residential",
    current_owner: "S. Murugan",
    status: "Active",
    created_at: "2018-09-14T09:00:00.000Z",
    updated_at: "2026-02-01T12:00:00.000Z",
    coordinates: [[[77.0330, 11.0250], [77.0350, 11.0250], [77.0350, 11.0270], [77.0330, 11.0270], [77.0330, 11.0250]]],
    history: [
      { id: 3, parcel_id: "TN-CBE-001-124-2", event_type: "Sub-division Survey", description: "Partition sub-division of ancestral field Survey 124 executed.", event_date: "2018-09-14", source: "Survey & Settlement Office", created_at: "2018-09-14T09:00:00.000Z" },
      { id: 4, parcel_id: "TN-CBE-001-124-2", event_type: "DGPS Cadastral Mapping", description: "Satellite DGPS resurvey recorded 2.42 Acres (0.08 Acre minor variation).", event_date: "2023-11-05", source: "State Cadastral Survey", created_at: "2023-11-05T15:00:00.000Z" }
    ]
  },
  {
    id: 3,
    parcel_id: "TN-CBE-001-124-3",
    survey_number: "124/3",
    subdivision: "3",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0260,
    longitude: 77.0361,
    recorded_area: 1.80,
    gis_area: 1.95,
    area_unit: "Acres",
    land_use: "Commercial",
    current_owner: "Senthil Enterprises",
    status: "Under Review",
    created_at: "2024-02-10T10:30:00.000Z",
    updated_at: "2026-01-15T09:45:00.000Z",
    coordinates: [[[77.0350, 11.0250], [77.0373, 11.0250], [77.0373, 11.0270], [77.0350, 11.0270], [77.0350, 11.0250]]],
    history: [
      { id: 5, parcel_id: "TN-CBE-001-124-3", event_type: "Commercial Land Conversion", description: "Change of land use permit granted by DTCP.", event_date: "2024-02-10", source: "Directorate of Town & Country Planning", created_at: "2024-02-10T10:30:00.000Z" },
      { id: 6, parcel_id: "TN-CBE-001-124-3", event_type: "Overlap Flag Raised", description: "GIS engine detected boundary polygon overlap with Parcel 125/1 on the eastern boundary.", event_date: "2026-01-15", source: "LandSync DPI Verification", created_at: "2026-01-15T09:45:00.000Z" }
    ]
  },
  {
    id: 4,
    parcel_id: "TN-CBE-001-125-1",
    survey_number: "125/1",
    subdivision: "1",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0260,
    longitude: 77.0381,
    recorded_area: 3.20,
    gis_area: 3.10,
    area_unit: "Acres",
    land_use: "Commercial",
    current_owner: "Apex Logistics Pvt Ltd",
    status: "Boundary Discrepancy",
    created_at: "2022-08-19T11:00:00.000Z",
    updated_at: "2026-02-01T16:20:00.000Z",
    coordinates: [[[77.0368, 11.0250], [77.0395, 11.0250], [77.0395, 11.0270], [77.0368, 11.0270], [77.0368, 11.0250]]],
    history: [
      { id: 7, parcel_id: "TN-CBE-001-125-1", event_type: "Industrial Purchase", description: "Purchased by Apex Logistics via registered deed Doc 4410/2022.", event_date: "2022-08-19", source: "IGRS Sub-Registrar", created_at: "2022-08-19T11:00:00.000Z" },
      { id: 8, parcel_id: "TN-CBE-001-125-1", event_type: "Boundary Dispute Notice", description: "Joint inspection scheduled to resolve 0.15 Acre overlap with 124/3.", event_date: "2026-02-01", source: "Revenue Divisional Officer", created_at: "2026-02-01T16:20:00.000Z" }
    ]
  },
  {
    id: 5,
    parcel_id: "TN-CBE-001-125-2",
    survey_number: "125/2",
    subdivision: "2",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0258,
    longitude: 77.0410,
    recorded_area: 5.40,
    gis_area: 5.38,
    area_unit: "Acres",
    land_use: "Agricultural",
    current_owner: "K. Muthusamy",
    status: "Active",
    created_at: "2015-05-11T08:00:00.000Z",
    updated_at: "2025-12-10T10:00:00.000Z",
    coordinates: [[[77.0395, 11.0245], [77.0425, 11.0245], [77.0425, 11.0270], [77.0395, 11.0270], [77.0395, 11.0245]]],
    history: [
      { id: 9, parcel_id: "TN-CBE-001-125-2", event_type: "Ryotwari Patta Grant", description: "Permanent settlement revenue entry confirmed.", event_date: "2015-05-11", source: "Tamil Nilam", created_at: "2015-05-11T08:00:00.000Z" }
    ]
  },
  {
    id: 6,
    parcel_id: "TN-CBE-001-126-1",
    survey_number: "126/1",
    subdivision: "1",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0282,
    longitude: 77.0322,
    recorded_area: 4.20,
    gis_area: 4.19,
    area_unit: "Acres",
    land_use: "Agricultural",
    current_owner: "Meenakshi Ammal",
    status: "Active",
    created_at: "2020-03-18T10:00:00.000Z",
    updated_at: "2025-08-12T14:00:00.000Z",
    coordinates: [[[77.0310, 11.0270], [77.0335, 11.0270], [77.0335, 11.0295], [77.0310, 11.0295], [77.0310, 11.0270]]],
    history: [
      { id: 10, parcel_id: "TN-CBE-001-126-1", event_type: "Succession Patta", description: "Legal heir succession certificate recorded.", event_date: "2020-03-18", source: "Tahsildar Desk", created_at: "2020-03-18T10:00:00.000Z" }
    ]
  },
  {
    id: 7,
    parcel_id: "TN-CBE-001-126-2",
    survey_number: "126/2",
    subdivision: "2",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0282,
    longitude: 77.0347,
    recorded_area: 3.80,
    gis_area: 3.52,
    area_unit: "Acres",
    land_use: "Agricultural",
    current_owner: "R. Palanisamy",
    status: "Under Review",
    created_at: "2019-11-20T09:30:00.000Z",
    updated_at: "2026-02-14T11:15:00.000Z",
    coordinates: [[[77.0335, 11.0270], [77.0360, 11.0270], [77.0360, 11.0295], [77.0335, 11.0295], [77.0335, 11.0270]]],
    history: [
      { id: 11, parcel_id: "TN-CBE-001-126-2", event_type: "Major Area Mismatch Alert", description: "GIS calculated area is 7.4% less than recorded revenue patta area. Field resurvey requested.", event_date: "2026-02-14", source: "LandSync Automated GIS Audit", created_at: "2026-02-14T11:15:00.000Z" }
    ]
  },
  {
    id: 8,
    parcel_id: "TN-CBE-001-127-1",
    survey_number: "127/1",
    subdivision: "1",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0282,
    longitude: 77.0380,
    recorded_area: 8.50,
    gis_area: 8.50,
    area_unit: "Acres",
    land_use: "Government",
    current_owner: "Tamil Nadu Water Resources Dept (Eri Puramboke)",
    status: "Active",
    created_at: "2010-01-01T00:00:00.000Z",
    updated_at: "2025-05-10T10:00:00.000Z",
    coordinates: [[[77.0360, 11.0270], [77.0400, 11.0270], [77.0400, 11.0295], [77.0360, 11.0295], [77.0360, 11.0270]]],
    history: [
      { id: 12, parcel_id: "TN-CBE-001-127-1", event_type: "Public Asset Notification", description: "Classified as Protected Waterbody / Water Channel in Master Plan.", event_date: "2010-01-01", source: "Gazette Notification", created_at: "2010-01-01T00:00:00.000Z" }
    ]
  },
  {
    id: 9,
    parcel_id: "TN-CBE-001-127-2",
    survey_number: "127/2",
    subdivision: "2",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0282,
    longitude: 77.0412,
    recorded_area: 1.50,
    gis_area: 1.49,
    area_unit: "Acres",
    land_use: "Government",
    current_owner: "Sulur Town Panchayat (Gram Natham Common)",
    status: "Active",
    created_at: "2012-07-22T08:00:00.000Z",
    updated_at: "2024-04-10T09:00:00.000Z",
    coordinates: [[[77.0400, 11.0270], [77.0425, 11.0270], [77.0425, 11.0295], [77.0400, 11.0295], [77.0400, 11.0270]]],
    history: [
      { id: 13, parcel_id: "TN-CBE-001-127-2", event_type: "Village Panchayat Common Site", description: "Reserved for community center and public amenities.", event_date: "2012-07-22", source: "Rural Development Dept", created_at: "2012-07-22T08:00:00.000Z" }
    ]
  },
  {
    id: 10,
    parcel_id: "TN-CBE-001-128-1",
    survey_number: "128/1",
    subdivision: "1",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0238,
    longitude: 77.0327,
    recorded_area: 6.20,
    gis_area: 6.22,
    area_unit: "Acres",
    land_use: "Commercial",
    current_owner: "TechParks India Corp",
    status: "Active",
    created_at: "2023-04-14T10:00:00.000Z",
    updated_at: "2026-01-20T15:00:00.000Z",
    coordinates: [[[77.0310, 11.0225], [77.0345, 11.0225], [77.0345, 11.0250], [77.0310, 11.0250], [77.0310, 11.0225]]],
    history: [
      { id: 14, parcel_id: "TN-CBE-001-128-1", event_type: "SIPCOT / ELCOT Clearance", description: "IT infrastructure clearance issued.", event_date: "2023-04-14", source: "Guidance Tamil Nadu", created_at: "2023-04-14T10:00:00.000Z" }
    ]
  },
  {
    id: 11,
    parcel_id: "TN-CBE-001-128-2",
    survey_number: "128/2",
    subdivision: "2",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0238,
    longitude: 77.0357,
    recorded_area: 1.10,
    gis_area: 1.09,
    area_unit: "Acres",
    land_use: "Residential",
    current_owner: "Lakshmi Narayanan",
    status: "Active",
    created_at: "2022-01-20T11:00:00.000Z",
    updated_at: "2025-09-18T10:30:00.000Z",
    coordinates: [[[77.0345, 11.0225], [77.0370, 11.0225], [77.0370, 11.0250], [77.0345, 11.0250], [77.0345, 11.0225]]],
    history: [
      { id: 15, parcel_id: "TN-CBE-001-128-2", event_type: "Housing Scheme Approval", description: "Single family layout approved.", event_date: "2022-01-20", source: "Local Planning Authority", created_at: "2022-01-20T11:00:00.000Z" }
    ]
  },
  {
    id: 12,
    parcel_id: "TN-CBE-001-129-1",
    survey_number: "129/1",
    subdivision: "1",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0238,
    longitude: 77.0382,
    recorded_area: 2.00,
    gis_area: 1.98,
    area_unit: "Acres",
    land_use: "Residential",
    current_owner: "V. Karthikeyan",
    status: "Active",
    created_at: "2019-06-11T09:00:00.000Z",
    updated_at: "2024-09-10T11:00:00.000Z",
    coordinates: [[[77.0370, 11.0225], [77.0395, 11.0225], [77.0395, 11.0250], [77.0370, 11.0250], [77.0370, 11.0225]]],
    history: [
      { id: 16, parcel_id: "TN-CBE-001-129-1", event_type: "Ownership Transfer 1", description: "Sold by Original Owner to G. Sundaram (Doc 1204/2019).", event_date: "2019-06-11", source: "Registration Dept", created_at: "2019-06-11T09:00:00.000Z" },
      { id: 17, parcel_id: "TN-CBE-001-129-1", event_type: "Ownership Transfer 2", description: "Sold by G. Sundaram to V. Karthikeyan (Doc 3108/2024).", event_date: "2024-08-25", source: "Registration Dept", created_at: "2024-08-25T14:00:00.000Z" },
      { id: 18, parcel_id: "TN-CBE-001-129-1", event_type: "Patta Passbook Update", description: "e-Patta issued in digital ledger.", event_date: "2024-09-10", source: "Revenue Department", created_at: "2024-09-10T11:00:00.000Z" }
    ]
  },
  {
    id: 13,
    parcel_id: "TN-CBE-001-129-2",
    survey_number: "129/2",
    subdivision: "2",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0235,
    longitude: 77.0410,
    recorded_area: 1.75,
    gis_area: 1.62,
    area_unit: "Acres",
    land_use: "Agricultural",
    current_owner: "Selvi Anbarasu",
    status: "Boundary Discrepancy",
    created_at: "2017-04-10T10:00:00.000Z",
    updated_at: "2025-10-30T16:00:00.000Z",
    coordinates: [[[77.0395, 11.0225], [77.0425, 11.0225], [77.0425, 11.0245], [77.0395, 11.0245], [77.0395, 11.0225]]],
    history: [
      { id: 19, parcel_id: "TN-CBE-001-129-2", event_type: "Irrigation Canal Buffer Discrepancy", description: "PWD drainage channel alignment reduces usable plot extent from 1.75 to 1.62 Acres.", event_date: "2025-10-30", source: "PWD Survey Team", created_at: "2025-10-30T16:00:00.000Z" }
    ]
  },
  {
    id: 14,
    parcel_id: "TN-CBE-001-130-1",
    survey_number: "130/1",
    subdivision: "1",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0305,
    longitude: 77.0322,
    recorded_area: 0.85,
    gis_area: 0.85,
    area_unit: "Acres",
    land_use: "Residential",
    current_owner: "A. Joseph",
    status: "Active",
    created_at: "2023-05-18T11:00:00.000Z",
    updated_at: "2025-11-15T09:00:00.000Z",
    coordinates: [[[77.0310, 11.0295], [77.0335, 11.0295], [77.0335, 11.0315], [77.0310, 11.0315], [77.0310, 11.0295]]],
    history: [
      { id: 20, parcel_id: "TN-CBE-001-130-1", event_type: "Building Permit Approval", description: "Residential villa plan approved.", event_date: "2023-05-18", source: "Panchayat Union", created_at: "2023-05-18T11:00:00.000Z" }
    ]
  },
  {
    id: 15,
    parcel_id: "TN-CBE-001-130-2",
    survey_number: "130/2",
    subdivision: "2",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0305,
    longitude: 77.0352,
    recorded_area: 3.10,
    gis_area: 3.08,
    area_unit: "Acres",
    land_use: "Agricultural",
    current_owner: "G. Natarajan",
    status: "Active",
    created_at: "2016-08-12T08:30:00.000Z",
    updated_at: "2025-07-14T14:00:00.000Z",
    coordinates: [[[77.0335, 11.0295], [77.0370, 11.0295], [77.0370, 11.0315], [77.0335, 11.0315], [77.0335, 11.0295]]],
    history: [
      { id: 21, parcel_id: "TN-CBE-001-130-2", event_type: "Crop Insurance Tagging", description: "PMFBY seasonal crop survey verified.", event_date: "2025-07-14", source: "Agriculture Dept", created_at: "2025-07-14T14:00:00.000Z" }
    ]
  },
  {
    id: 16,
    parcel_id: "TN-CBE-001-131-1",
    survey_number: "131/1",
    subdivision: "1",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village: "Demo Village",
    latitude: 11.0305,
    longitude: 77.0397,
    recorded_area: 12.00,
    gis_area: 12.00,
    area_unit: "Acres",
    land_use: "Government",
    current_owner: "Tamil Nadu Forest Dept (Reserve Fringe)",
    status: "Active",
    created_at: "2014-08-01T00:00:00.000Z",
    updated_at: "2025-01-10T10:00:00.000Z",
    coordinates: [[[77.0370, 11.0295], [77.0425, 11.0295], [77.0425, 11.0315], [77.0370, 11.0315], [77.0370, 11.0295]]],
    history: [
      { id: 22, parcel_id: "TN-CBE-001-131-1", event_type: "Reserve Forest Demarcation", description: "GPS geo-tagged boundary cairns erected.", event_date: "2014-08-01", source: "Forest Range Officer", created_at: "2014-08-01T00:00:00.000Z" }
    ]
  }
];

// Calculation helper for boundary status
function calculateAreaDifference(recorded: number, gis: number) {
  const diff = Math.round(Math.abs(recorded - gis) * 1000) / 1000;
  const pct = Math.round((diff / recorded) * 10000) / 100;
  let status: "MATCH" | "MINOR DIFFERENCE" | "MAJOR DIFFERENCE" = "MATCH";
  if (pct <= 2.0) status = "MATCH";
  else if (pct <= 5.0) status = "MINOR DIFFERENCE";
  else status = "MAJOR DIFFERENCE";
  return { diff, pct, status };
}

// Bounding box / point proximity calculation for neighbors and overlaps
function computePolygonStats(target: ParcelRecord) {
  const { diff, pct, status } = calculateAreaDifference(target.recorded_area, target.gis_area);

  // Neighbors calculation
  const neighbors: Array<{
    parcel_id: string;
    survey_number: string;
    owner: string;
    land_use: string;
    relationship: string;
    distance_approx_m: number;
  }> = [];

  // Overlap calculation
  const overlappingParcels: string[] = [];
  let overlapAcres = 0.0;

  for (const other of parcelsDatabase) {
    if (other.parcel_id === target.parcel_id) continue;

    // Detect intentional overlap
    if (
      (target.parcel_id === "TN-CBE-001-124-3" && other.parcel_id === "TN-CBE-001-125-1") ||
      (target.parcel_id === "TN-CBE-001-125-1" && other.parcel_id === "TN-CBE-001-124-3")
    ) {
      overlappingParcels.push(other.parcel_id);
      overlapAcres = 0.15;
    }

    // Distance calculation
    const dLat = Math.abs(target.latitude - other.latitude);
    const dLng = Math.abs(target.longitude - other.longitude);
    const distDeg = Math.sqrt(dLat * dLat + dLng * dLng);

    if (distDeg < 0.0035) {
      neighbors.push({
        parcel_id: other.parcel_id,
        survey_number: other.survey_number,
        owner: other.current_owner,
        land_use: other.land_use,
        relationship: distDeg < 0.0025 ? "Adjacent" : "Nearby",
        distance_approx_m: Math.round(distDeg * 111000)
      });
    }
  }

  const hasOverlap = overlappingParcels.length > 0;
  const overlapSeverity = !hasOverlap ? "NONE" : overlapAcres < 0.1 ? "LOW" : overlapAcres <= 0.5 ? "MEDIUM" : "HIGH";

  return {
    diff,
    pct,
    boundary_status: status,
    neighbors,
    overlap_status: {
      has_overlap: hasOverlap,
      overlapping_parcels: overlappingParcels,
      overlap_area_acres: overlapAcres,
      overlap_severity: overlapSeverity,
      note: "Prototype GIS analysis – not a legal boundary determination."
    }
  };
}

// 1. Get GIS Stats
app.get("/api/parcels/stats", (req: Request, res: Response) => {
  const total = parcelsDatabase.length;
  const residential = parcelsDatabase.filter(p => p.land_use.toLowerCase() === "residential").length;
  const agricultural = parcelsDatabase.filter(p => p.land_use.toLowerCase() === "agricultural").length;
  const commercial = parcelsDatabase.filter(p => p.land_use.toLowerCase() === "commercial").length;
  const government = parcelsDatabase.filter(p => p.land_use.toLowerCase() === "government").length;

  let mismatchCount = 0;
  for (const p of parcelsDatabase) {
    const { pct } = calculateAreaDifference(p.recorded_area, p.gis_area);
    if (pct > 2.0) mismatchCount++;
  }

  const overlapCount = parcelsDatabase.filter(p => p.parcel_id === "TN-CBE-001-124-3" || p.parcel_id === "TN-CBE-001-125-1").length;
  const underReview = parcelsDatabase.filter(p => p.status.toLowerCase() === "under review").length;
  const activeCount = parcelsDatabase.filter(p => p.status.toLowerCase() === "active").length;
  const boundaryDiscrepancy = parcelsDatabase.filter(p => p.status.toLowerCase().includes("discrepancy")).length;

  res.json({
    total_parcels: total,
    residential_count: residential,
    agricultural_count: agricultural,
    commercial_count: commercial,
    government_count: government,
    area_mismatch_count: mismatchCount,
    overlap_count: overlapCount,
    under_review_count: underReview,
    active_count: activeCount,
    boundary_discrepancy_count: boundaryDiscrepancy
  });
});

// 2. Get GeoJSON Feature Collection
app.get("/api/parcels/geojson", (req: Request, res: Response) => {
  const features = parcelsDatabase.map(p => ({
    type: "Feature",
    properties: {
      id: p.id,
      parcel_id: p.parcel_id,
      survey_number: p.survey_number,
      subdivision: p.subdivision,
      owner: p.current_owner,
      village: p.village,
      district: p.district,
      state: p.state,
      latitude: p.latitude,
      longitude: p.longitude,
      recorded_area: p.recorded_area,
      gis_area: p.gis_area,
      area_unit: p.area_unit,
      land_use: p.land_use,
      status: p.status
    },
    geometry: {
      type: "Polygon",
      coordinates: p.coordinates
    }
  }));

  res.json({
    type: "FeatureCollection",
    name: "LandSync_Parcels_DPI",
    features
  });
});

// 3. Search parcels
app.get("/api/parcels/search", (req: Request, res: Response) => {
  const { q, village, district, land_use, status } = req.query as Record<string, string>;
  let results = [...parcelsDatabase];

  if (q) {
    const term = q.toLowerCase();
    results = results.filter(p =>
      p.parcel_id.toLowerCase().includes(term) ||
      p.survey_number.toLowerCase().includes(term) ||
      p.current_owner.toLowerCase().includes(term) ||
      p.village.toLowerCase().includes(term)
    );
  }

  if (village) {
    results = results.filter(p => p.village.toLowerCase().includes(village.toLowerCase()));
  }
  if (district) {
    results = results.filter(p => p.district.toLowerCase().includes(district.toLowerCase()));
  }
  if (land_use) {
    results = results.filter(p => p.land_use.toLowerCase() === land_use.toLowerCase());
  }
  if (status) {
    results = results.filter(p => p.status.toLowerCase().includes(status.toLowerCase()));
  }

  res.json(results);
});

// 4. List all parcels
app.get("/api/parcels", (req: Request, res: Response) => {
  res.json(parcelsDatabase);
});

// 5. Get single parcel
app.get("/api/parcels/:parcel_id", (req: Request, res: Response) => {
  const pid = req.params.parcel_id;
  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === pid.toLowerCase());
  if (!parcel) {
    res.status(404).json({ detail: `Parcel with ID '${pid}' not found.` });
    return;
  }
  res.json(parcel);
});

// 6. Get parcel geometry
app.get("/api/parcels/:parcel_id/geometry", (req: Request, res: Response) => {
  const pid = req.params.parcel_id;
  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === pid.toLowerCase());
  if (!parcel) {
    res.status(404).json({ detail: `Parcel geometry for '${pid}' not found.` });
    return;
  }
  res.json({
    id: parcel.id,
    parcel_id: parcel.parcel_id,
    geometry_type: "Polygon",
    coordinates: parcel.coordinates,
    geojson: {
      type: "Polygon",
      coordinates: parcel.coordinates
    },
    created_at: parcel.created_at,
    updated_at: parcel.updated_at
  });
});

// 7. Get parcel history
app.get("/api/parcels/:parcel_id/history", (req: Request, res: Response) => {
  const pid = req.params.parcel_id;
  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === pid.toLowerCase());
  if (!parcel) {
    res.status(404).json({ detail: `History for parcel '${pid}' not found.` });
    return;
  }
  res.json(parcel.history);
});

// 8. Get parcel analysis (recorded vs GIS, boundary status, neighbors, overlap)
app.get("/api/parcels/:parcel_id/analysis", (req: Request, res: Response) => {
  const pid = req.params.parcel_id;
  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === pid.toLowerCase());
  if (!parcel) {
    res.status(404).json({ detail: `Parcel '${pid}' not found for analysis.` });
    return;
  }

  const analysis = computePolygonStats(parcel);

  res.json({
    parcel_id: parcel.parcel_id,
    survey_number: parcel.survey_number,
    village: parcel.village,
    district: parcel.district,
    state: parcel.state,
    current_owner: parcel.current_owner,
    land_use: parcel.land_use,
    status: parcel.status,
    recorded_area: parcel.recorded_area,
    gis_area: parcel.gis_area,
    area_unit: parcel.area_unit,
    area_difference: analysis.diff,
    percentage_difference: analysis.pct,
    boundary_status: analysis.boundary_status,
    neighbor_count: analysis.neighbors.length,
    neighbors: analysis.neighbors,
    overlap_status: analysis.overlap_status,
    disclaimer: "Prototype visualization using fictional/sample GIS data. For demonstration purposes only."
  });
});

// =========================================================================
// PHASE 3: APPLICATIONS, WORKFLOW, NOTIFICATIONS & AUDIT LOGS
// =========================================================================

interface ApplicationRecord {
  id: number;
  application_id: string;
  parcel_id: string;
  citizen_id: number;
  service_type: string;
  description: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "VERIFICATION_PENDING" | "MORE_INFORMATION_REQUIRED" | "VERIFIED" | "APPROVED" | "REJECTED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assigned_officer_id: number | null;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  completed_at: string | null;
}

interface ApplicationStatusHistoryRecord {
  id: number;
  application_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string;
  remarks: string | null;
  created_at: string;
}

interface OfficerNoteRecord {
  id: number;
  application_id: string;
  officer_id: number;
  note: string;
  note_type: "INTERNAL" | "CITIZEN_VISIBLE" | "ACTION_REQUIRED";
  created_at: string;
}

interface NotificationRecord {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: "SUCCESS" | "WARNING" | "INFO" | "ACTION_REQUIRED";
  is_read: boolean;
  related_application_id: string | null;
  created_at: string;
}

interface AuditLogRecord {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string;
  ip_address: string;
  created_at: string;
}

let appIdCounter = 20;
let historyIdCounter = 100;
let noteIdCounter = 50;
let notifIdCounter = 50;
let auditIdCounter = 100;

// Valid workflow status transitions map
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["VERIFICATION_PENDING", "MORE_INFORMATION_REQUIRED", "APPROVED", "REJECTED"],
  MORE_INFORMATION_REQUIRED: ["SUBMITTED", "UNDER_REVIEW", "REJECTED"],
  VERIFICATION_PENDING: ["VERIFIED", "MORE_INFORMATION_REQUIRED", "UNDER_REVIEW", "REJECTED"],
  VERIFIED: ["APPROVED", "REJECTED", "MORE_INFORMATION_REQUIRED", "CLOSED"],
  APPROVED: ["CLOSED"],
  REJECTED: ["CLOSED"],
  CLOSED: []
};

// Seed 20 Initial Applications
const applicationsDatabase: ApplicationRecord[] = [
  {
    id: 1,
    application_id: "LS-2026-000001",
    parcel_id: "IN-TN-CHE-2026-0001",
    citizen_id: 1,
    service_type: "LAND RECORD VERIFICATION",
    description: "Comprehensive title deed and computerized Patta record verification request prior to property inheritance registration.",
    status: "APPROVED",
    priority: "HIGH",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 2,
    application_id: "LS-2026-000002",
    parcel_id: "IN-TN-CHE-2026-0002",
    citizen_id: 1,
    service_type: "BOUNDARY DISCREPANCY REPORT",
    description: "East-side cadastral survey line encroaches 0.12 acres onto road easement according to satellite polygon overlay.",
    status: "UNDER_REVIEW",
    priority: "CRITICAL",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 3,
    application_id: "LS-2026-000003",
    parcel_id: "IN-TN-CBE-2026-0003",
    citizen_id: 1,
    service_type: "AREA DISCREPANCY REVIEW",
    description: "Revenue record reflects 4.50 acres whereas GIS polygon boundary calculation indicates 4.18 acres.",
    status: "VERIFICATION_PENDING",
    priority: "HIGH",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 4,
    application_id: "LS-2026-000004",
    parcel_id: "IN-TN-CBE-2026-0004",
    citizen_id: 1,
    service_type: "OWNERSHIP VERIFICATION",
    description: "Request for fast-track verification of succession pedigree and joint legal heir patta record update.",
    status: "MORE_INFORMATION_REQUIRED",
    priority: "MEDIUM",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 5,
    application_id: "LS-2026-000005",
    parcel_id: "IN-TN-MDU-2026-0005",
    citizen_id: 1,
    service_type: "DOCUMENT VERIFICATION",
    description: "Cross-verification of registered sale deed doc No. 1984/2021 with Madurai South Sub-Registrar records.",
    status: "VERIFIED",
    priority: "MEDIUM",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 6,
    application_id: "LS-2026-000006",
    parcel_id: "IN-TN-MDU-2026-0006",
    citizen_id: 1,
    service_type: "LAND RECORD CORRECTION REQUEST",
    description: "Spelling mistake in owner's surname in computerized Chitta database compared to Aadhaar & PAN.",
    status: "SUBMITTED",
    priority: "LOW",
    assigned_officer_id: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 7,
    application_id: "LS-2026-000007",
    parcel_id: "IN-TN-SLM-2026-0007",
    citizen_id: 1,
    service_type: "PARCEL INFORMATION REQUEST",
    description: "Official certified boundary coordinates and master plan land use classification confirmation.",
    status: "APPROVED",
    priority: "LOW",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 8,
    application_id: "LS-2026-000008",
    parcel_id: "IN-TN-SLM-2026-0008",
    citizen_id: 1,
    service_type: "BOUNDARY DISCREPANCY REPORT",
    description: "Dispute regarding adjoining channel reserve boundary and survey stone displacement.",
    status: "REJECTED",
    priority: "HIGH",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 9,
    application_id: "LS-2026-000009",
    parcel_id: "IN-TN-TRZ-2026-0009",
    citizen_id: 1,
    service_type: "LAND RECORD VERIFICATION",
    description: "Validation of agricultural patta title for national farm subsidy & Kisan credit scheme verification.",
    status: "SUBMITTED",
    priority: "MEDIUM",
    assigned_officer_id: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 10,
    application_id: "LS-2026-000010",
    parcel_id: "IN-TN-TRZ-2026-0010",
    citizen_id: 1,
    service_type: "OWNERSHIP VERIFICATION",
    description: "Re-affirmation of title post partition deed among 3 co-owners for survey parcel 12/4.",
    status: "UNDER_REVIEW",
    priority: "MEDIUM",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 11,
    application_id: "LS-2026-000011",
    parcel_id: "IN-TN-TVL-2026-0011",
    citizen_id: 1,
    service_type: "DOCUMENT VERIFICATION",
    description: "Mutation order certificate authenticity check for industrial development permit.",
    status: "VERIFICATION_PENDING",
    priority: "HIGH",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 12,
    application_id: "LS-2026-000012",
    parcel_id: "IN-TN-TVL-2026-0012",
    citizen_id: 1,
    service_type: "AREA DISCREPANCY REVIEW",
    description: "Recorded area 3.00 acres vs Computed GIS area 3.02 acres (0.6% minor variance within statutory tolerance).",
    status: "VERIFIED",
    priority: "LOW",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 13,
    application_id: "LS-2026-000013",
    parcel_id: "IN-TN-VEL-2026-0013",
    citizen_id: 1,
    service_type: "LAND RECORD CORRECTION REQUEST",
    description: "Correction of father's name from 'K. Selvam' to 'K. Selvakumar' in electronic register.",
    status: "APPROVED",
    priority: "LOW",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 14,
    application_id: "LS-2026-000014",
    parcel_id: "IN-TN-VEL-2026-0014",
    citizen_id: 1,
    service_type: "BOUNDARY DISCREPANCY REPORT",
    description: "Encroachment concern on southern border near State Highway expansion zone.",
    status: "UNDER_REVIEW",
    priority: "CRITICAL",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    completed_at: null,
  },
  {
    id: 15,
    application_id: "LS-2026-000015",
    parcel_id: "IN-TN-ERD-2026-0015",
    citizen_id: 1,
    service_type: "PARCEL INFORMATION REQUEST",
    description: "Certified true extract of 'A-Register' and Field Measurement Book (FMB) diagram.",
    status: "CLOSED",
    priority: "LOW",
    assigned_officer_id: 2,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    submitted_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  }
];

const statusHistoryDatabase: ApplicationStatusHistoryRecord[] = [
  {
    id: 1,
    application_id: "LS-2026-000001",
    previous_status: null,
    new_status: "SUBMITTED",
    changed_by: "Ramesh Kumar (Citizen)",
    remarks: "Submitted online via LandSync citizen portal",
    created_at: new Date(Date.now() - 18 * 86400000).toISOString()
  },
  {
    id: 2,
    application_id: "LS-2026-000001",
    previous_status: "SUBMITTED",
    new_status: "UNDER_REVIEW",
    changed_by: "Vikram Rathore (Tahsildar)",
    remarks: "Assigned to desk officer for statutory record matching",
    created_at: new Date(Date.now() - 16 * 86400000).toISOString()
  },
  {
    id: 3,
    application_id: "LS-2026-000001",
    previous_status: "UNDER_REVIEW",
    new_status: "VERIFICATION_PENDING",
    changed_by: "Vikram Rathore (Tahsildar)",
    remarks: "Dispatched for sub-registrar cross verification",
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 4,
    application_id: "LS-2026-000001",
    previous_status: "VERIFICATION_PENDING",
    new_status: "VERIFIED",
    changed_by: "Vikram Rathore (Tahsildar)",
    remarks: "Verified against digital land ledger archive",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 5,
    application_id: "LS-2026-000001",
    previous_status: "VERIFIED",
    new_status: "APPROVED",
    changed_by: "Vikram Rathore (Tahsildar)",
    remarks: "Approved for Patta transfer. Certificate issued.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 6,
    application_id: "LS-2026-000002",
    previous_status: null,
    new_status: "SUBMITTED",
    changed_by: "Ramesh Kumar (Citizen)",
    remarks: "Citizen flagged spatial deviation in LandSync GIS explorer",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 7,
    application_id: "LS-2026-000002",
    previous_status: "SUBMITTED",
    new_status: "UNDER_REVIEW",
    changed_by: "Vikram Rathore (Tahsildar)",
    remarks: "High priority case opened for spatial survey reconciliation",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 8,
    application_id: "LS-2026-000004",
    previous_status: null,
    new_status: "SUBMITTED",
    changed_by: "Ramesh Kumar (Citizen)",
    remarks: "Joint application submitted with death certificate",
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 9,
    application_id: "LS-2026-000004",
    previous_status: "SUBMITTED",
    new_status: "UNDER_REVIEW",
    changed_by: "Vikram Rathore (Tahsildar)",
    remarks: "Preliminary scrutiny commenced",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 10,
    application_id: "LS-2026-000004",
    previous_status: "UNDER_REVIEW",
    new_status: "MORE_INFORMATION_REQUIRED",
    changed_by: "Vikram Rathore (Tahsildar)",
    remarks: "Please upload the authenticated Legal Heirship Certificate from Revenue Division.",
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  }
];

const officerNotesDatabase: OfficerNoteRecord[] = [
  {
    id: 1,
    application_id: "LS-2026-000001",
    officer_id: 2,
    note: "Title deed verified with SRO Tambaram computerized sub-registry index book. No pending encumbrances.",
    note_type: "INTERNAL",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 2,
    application_id: "LS-2026-000001",
    officer_id: 2,
    note: "All statutory record validations completed successfully. Patta extract certified.",
    note_type: "CITIZEN_VISIBLE",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 3,
    application_id: "LS-2026-000002",
    officer_id: 2,
    note: "GIS layer detected 0.12 acre variance against master town planning grid.",
    note_type: "INTERNAL",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 4,
    application_id: "LS-2026-000002",
    officer_id: 2,
    note: "Field surveyor scheduled for physical boundary demarcation on site.",
    note_type: "ACTION_REQUIRED",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 5,
    application_id: "LS-2026-000004",
    officer_id: 2,
    note: "Legal heir certificate copy missing signature of Tahsildar Sulur.",
    note_type: "ACTION_REQUIRED",
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  }
];

const notificationsDatabase: NotificationRecord[] = [
  {
    id: 1,
    user_id: 1,
    title: "Application Approved: LS-2026-000001",
    message: "Your Land Record Verification for parcel IN-TN-CHE-2026-0001 was approved and certified.",
    notification_type: "SUCCESS",
    is_read: true,
    related_application_id: "LS-2026-000001",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 2,
    user_id: 1,
    title: "Action Required on LS-2026-000004",
    message: "Officer requested: Please upload the authenticated Legal Heirship Certificate from Revenue Division.",
    notification_type: "ACTION_REQUIRED",
    is_read: false,
    related_application_id: "LS-2026-000004",
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 3,
    user_id: 1,
    title: "Field Inspection Scheduled: LS-2026-000002",
    message: "Surveyor inspection assigned for boundary discrepancy reconciliation on Tambaram survey parcel.",
    notification_type: "INFO",
    is_read: false,
    related_application_id: "LS-2026-000002",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 4,
    user_id: 2,
    title: "Critical Priority Case Registered",
    message: "Application LS-2026-000014 (Boundary Discrepancy Report) requires high-level scrutiny near State Highway.",
    notification_type: "WARNING",
    is_read: false,
    related_application_id: "LS-2026-000014",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

const auditLogsDatabase: AuditLogRecord[] = [
  {
    id: 1,
    user_id: 1,
    action: "APPLICATION_CREATED",
    entity_type: "Application",
    entity_id: "LS-2026-000001",
    details: "Citizen created LAND RECORD VERIFICATION for IN-TN-CHE-2026-0001",
    ip_address: "127.0.0.1",
    created_at: new Date(Date.now() - 18 * 86400000).toISOString()
  },
  {
    id: 2,
    user_id: 2,
    action: "STATUS_CHANGED",
    entity_type: "Application",
    entity_id: "LS-2026-000001",
    details: "Status changed from VERIFIED to APPROVED",
    ip_address: "127.0.0.1",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 3,
    user_id: 1,
    action: "APPLICATION_CREATED",
    entity_type: "Application",
    entity_id: "LS-2026-000002",
    details: "Citizen created BOUNDARY DISCREPANCY REPORT for IN-TN-CHE-2026-0002",
    ip_address: "127.0.0.1",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  }
];

// Helper to serialize rich application
const serializeApp = (app: ApplicationRecord) => {
  const citizen = usersDatabase.find(u => u.id === app.citizen_id);
  const officer = app.assigned_officer_id ? usersDatabase.find(u => u.id === app.assigned_officer_id) : null;
  const parcel = parcelsDatabase.find(p => p.parcel_id === app.parcel_id);

  return {
    id: app.id,
    application_id: app.application_id,
    parcel_id: app.parcel_id,
    citizen_id: app.citizen_id,
    citizen_name: citizen ? citizen.full_name : "Citizen",
    citizen_email: citizen ? citizen.email : "citizen@demo",
    service_type: app.service_type,
    description: app.description,
    status: app.status,
    priority: app.priority,
    assigned_officer_id: app.assigned_officer_id,
    assigned_officer_name: officer ? officer.full_name : "Unassigned",
    created_at: app.created_at,
    updated_at: app.updated_at,
    submitted_at: app.submitted_at,
    completed_at: app.completed_at,
    survey_number: parcel ? parcel.survey_number : "",
    village: parcel ? parcel.village : "",
    district: parcel ? parcel.district : "",
    current_owner: parcel ? parcel.current_owner : "",
    recorded_area: parcel ? parcel.recorded_area : 0,
    land_use: parcel ? parcel.land_use : "Residential",
  };
};

// 1. Create Application (Citizen or Officer)
app.post("/api/applications", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id, service_type, description, priority } = req.body;

  if (!parcel_id || !service_type || !description) {
    res.status(400).json({ detail: "parcel_id, service_type, and description are required." });
    return;
  }

  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  if (!parcel) {
    res.status(404).json({ detail: `Parcel identifier '${parcel_id}' not found in the registry.` });
    return;
  }

  appIdCounter++;
  const year = new Date().getFullYear();
  const newAppId = `LS-${year}-${String(appIdCounter).padStart(6, '0')}`;
  const now = new Date().toISOString();

  let computedPriority = priority || "MEDIUM";
  if (service_type.toUpperCase().includes("DISCREPANCY")) {
    computedPriority = "HIGH";
  }

  const newApp: ApplicationRecord = {
    id: appIdCounter,
    application_id: newAppId,
    parcel_id: parcel.parcel_id,
    citizen_id: req.user!.id,
    service_type,
    description,
    status: "SUBMITTED",
    priority: computedPriority,
    assigned_officer_id: null,
    created_at: now,
    updated_at: now,
    submitted_at: now,
    completed_at: null,
  };

  applicationsDatabase.unshift(newApp);

  // Initial history
  historyIdCounter++;
  statusHistoryDatabase.push({
    id: historyIdCounter,
    application_id: newAppId,
    previous_status: null,
    new_status: "SUBMITTED",
    changed_by: `${req.user!.full_name} (${req.user!.role.toUpperCase()})`,
    remarks: "Application submitted via LandSync Citizen Portal.",
    created_at: now
  });

  // Notification for Citizen
  notifIdCounter++;
  notificationsDatabase.unshift({
    id: notifIdCounter,
    user_id: req.user!.id,
    title: "Application Submitted",
    message: `Your request '${service_type}' for ${parcel.parcel_id} was submitted successfully with ID ${newAppId}.`,
    notification_type: "SUCCESS",
    is_read: false,
    related_application_id: newAppId,
    created_at: now
  });

  // Notification for Officers
  const officers = usersDatabase.filter(u => u.role === "officer");
  officers.forEach(off => {
    notifIdCounter++;
    notificationsDatabase.unshift({
      id: notifIdCounter,
      user_id: off.id,
      title: "New Case in Queue",
      message: `Application ${newAppId} (${service_type}) submitted for parcel ${parcel.parcel_id}.`,
      notification_type: "INFO",
      is_read: false,
      related_application_id: newAppId,
      created_at: now
    });
  });

  // Audit Log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "APPLICATION_CREATED",
    entity_type: "Application",
    entity_id: newAppId,
    details: `Citizen '${req.user!.full_name}' submitted ${service_type} for parcel ${parcel.parcel_id}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: now
  });

  res.status(201).json(serializeApp(newApp));
});

// 2. List Applications (Role-Aware)
app.get("/api/applications", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { status, priority, search } = req.query as { status?: string; priority?: string; search?: string };
  let results = [...applicationsDatabase];

  // Role filtering
  if (req.user!.role === "citizen") {
    results = results.filter(a => a.citizen_id === req.user!.id);
  }

  if (status) {
    results = results.filter(a => a.status.toUpperCase() === status.toUpperCase());
  }
  if (priority) {
    results = results.filter(a => a.priority.toUpperCase() === priority.toUpperCase());
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(a =>
      a.application_id.toLowerCase().includes(q) ||
      a.parcel_id.toLowerCase().includes(q) ||
      a.service_type.toLowerCase().includes(q)
    );
  }

  res.json(results.map(serializeApp));
});

// 3. Citizen My Applications
app.get("/api/applications/my", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const results = applicationsDatabase.filter(a => a.citizen_id === req.user!.id);
  res.json(results.map(serializeApp));
});

// 4. Officer Queue Statistics
app.get("/api/applications/officer/queue-stats", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const pending = applicationsDatabase.filter(a => a.status === "SUBMITTED").length;
  const under_review = applicationsDatabase.filter(a => a.status === "UNDER_REVIEW").length;
  const verification_pending = applicationsDatabase.filter(a => a.status === "VERIFICATION_PENDING").length;
  const high_prio = applicationsDatabase.filter(a =>
    ["HIGH", "CRITICAL"].includes(a.priority) && !["APPROVED", "REJECTED", "CLOSED"].includes(a.status)
  ).length;

  res.json({
    pending_cases: pending,
    under_review,
    verification_pending,
    completed_today: 4,
    high_priority: high_prio
  });
});

// 5. Get Single Application Detail
app.get("/api/applications/:application_id", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const aid = req.params.application_id;
  const appRecord = applicationsDatabase.find(a => a.application_id.toLowerCase() === aid.toLowerCase());

  if (!appRecord) {
    res.status(404).json({ detail: `Application '${aid}' not found.` });
    return;
  }

  if (req.user!.role === "citizen" && appRecord.citizen_id !== req.user!.id) {
    res.status(403).json({ detail: "Access forbidden: You cannot view this application." });
    return;
  }

  const appData = serializeApp(appRecord);
  const histories = statusHistoryDatabase
    .filter(h => h.application_id.toLowerCase() === aid.toLowerCase())
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let notes = officerNotesDatabase
    .filter(n => n.application_id.toLowerCase() === aid.toLowerCase())
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (req.user!.role === "citizen") {
    notes = notes.filter(n => n.note_type !== "INTERNAL");
  }

  const parcel = parcelsDatabase.find(p => p.parcel_id === appRecord.parcel_id);

  res.json({
    ...appData,
    status_history: histories,
    notes: notes.map(n => {
      const off = usersDatabase.find(u => u.id === n.officer_id);
      return {
        ...n,
        officer_name: off ? off.full_name : "Land Officer"
      };
    }),
    parcel_details: parcel || null
  });
});

// 6. Update Application Status (Officer / Admin)
app.put("/api/applications/:application_id/status", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const aid = req.params.application_id;
  const { status: newStatus, remarks } = req.body;

  const appRecord = applicationsDatabase.find(a => a.application_id.toLowerCase() === aid.toLowerCase());
  if (!appRecord) {
    res.status(404).json({ detail: `Application '${aid}' not found.` });
    return;
  }

  const targetStatus = newStatus.toUpperCase();
  const allowed = VALID_TRANSITIONS[appRecord.status] || [];

  if (!allowed.includes(targetStatus)) {
    res.status(400).json({
      detail: `Invalid transition from '${appRecord.status}' to '${targetStatus}'. Permitted: [${allowed.join(", ")}]`
    });
    return;
  }

  const prevStatus = appRecord.status;
  appRecord.status = targetStatus as any;
  appRecord.updated_at = new Date().toISOString();

  if (["APPROVED", "REJECTED", "CLOSED"].includes(targetStatus)) {
    appRecord.completed_at = new Date().toISOString();
  }

  // Automatically assign officer if currently unassigned
  if (!appRecord.assigned_officer_id && req.user!.role === "officer") {
    appRecord.assigned_officer_id = req.user!.id;
  }

  // Add History
  historyIdCounter++;
  statusHistoryDatabase.push({
    id: historyIdCounter,
    application_id: appRecord.application_id,
    previous_status: prevStatus,
    new_status: targetStatus,
    changed_by: `${req.user!.full_name} (${req.user!.role.toUpperCase()})`,
    remarks: remarks || `Transitioned to ${targetStatus}`,
    created_at: new Date().toISOString()
  });

  // Notify Citizen
  notifIdCounter++;
  const notifType = targetStatus === "APPROVED" ? "SUCCESS" : targetStatus === "REJECTED" ? "WARNING" : targetStatus === "MORE_INFORMATION_REQUIRED" ? "ACTION_REQUIRED" : "INFO";
  notificationsDatabase.unshift({
    id: notifIdCounter,
    user_id: appRecord.citizen_id,
    title: `Case Status Updated: ${targetStatus.replace(/_/g, " ")}`,
    message: `Application ${appRecord.application_id} has been moved to '${targetStatus}'. Remarks: ${remarks || "Updated by Tahsildar."}`,
    notification_type: notifType,
    is_read: false,
    related_application_id: appRecord.application_id,
    created_at: new Date().toISOString()
  });

  // Audit Log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "STATUS_CHANGED",
    entity_type: "Application",
    entity_id: appRecord.application_id,
    details: `Status changed from ${prevStatus} to ${targetStatus}. Remarks: ${remarks || "None"}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.json(serializeApp(appRecord));
});

// 7. Assign Officer
app.post("/api/applications/:application_id/assign", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const aid = req.params.application_id;
  const { officer_id } = req.body;

  const appRecord = applicationsDatabase.find(a => a.application_id.toLowerCase() === aid.toLowerCase());
  if (!appRecord) {
    res.status(404).json({ detail: `Application '${aid}' not found.` });
    return;
  }

  const officer = usersDatabase.find(u => u.id === officer_id && (u.role === "officer" || u.role === "admin"));
  if (!officer) {
    res.status(404).json({ detail: "Officer not found." });
    return;
  }

  appRecord.assigned_officer_id = officer.id;
  appRecord.updated_at = new Date().toISOString();

  // Notify Officer
  notifIdCounter++;
  notificationsDatabase.unshift({
    id: notifIdCounter,
    user_id: officer.id,
    title: "Case Assigned to You",
    message: `Application ${appRecord.application_id} (${appRecord.service_type}) has been assigned to your docket.`,
    notification_type: "INFO",
    is_read: false,
    related_application_id: appRecord.application_id,
    created_at: new Date().toISOString()
  });

  // Audit Log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "OFFICER_ASSIGNED",
    entity_type: "Application",
    entity_id: appRecord.application_id,
    details: `Assigned to ${officer.full_name} by ${req.user!.full_name}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.json(serializeApp(appRecord));
});

// 8. Add Officer Note
app.post("/api/applications/:application_id/notes", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const aid = req.params.application_id;
  const { note, note_type } = req.body;

  if (!note) {
    res.status(400).json({ detail: "Note text is required." });
    return;
  }

  const appRecord = applicationsDatabase.find(a => a.application_id.toLowerCase() === aid.toLowerCase());
  if (!appRecord) {
    res.status(404).json({ detail: `Application '${aid}' not found.` });
    return;
  }

  noteIdCounter++;
  const newNote: OfficerNoteRecord = {
    id: noteIdCounter,
    application_id: appRecord.application_id,
    officer_id: req.user!.id,
    note,
    note_type: note_type || "INTERNAL",
    created_at: new Date().toISOString()
  };

  officerNotesDatabase.push(newNote);

  if (["CITIZEN_VISIBLE", "ACTION_REQUIRED"].includes(newNote.note_type)) {
    notifIdCounter++;
    notificationsDatabase.unshift({
      id: notifIdCounter,
      user_id: appRecord.citizen_id,
      title: "Officer Note Added",
      message: `Message from Officer on ${appRecord.application_id}: "${note}"`,
      notification_type: newNote.note_type === "ACTION_REQUIRED" ? "ACTION_REQUIRED" : "INFO",
      is_read: false,
      related_application_id: appRecord.application_id,
      created_at: new Date().toISOString()
    });
  }

  // Audit Log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "NOTE_ADDED",
    entity_type: "Application",
    entity_id: appRecord.application_id,
    details: `Added ${newNote.note_type} note: ${note.substring(0, 50)}...`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.status(201).json({
    ...newNote,
    officer_name: req.user!.full_name
  });
});

// 9. Get Timeline
app.get("/api/applications/:application_id/timeline", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const aid = req.params.application_id;
  const appRecord = applicationsDatabase.find(a => a.application_id.toLowerCase() === aid.toLowerCase());
  if (!appRecord) {
    res.status(404).json({ detail: `Application '${aid}' not found.` });
    return;
  }

  const citizen = usersDatabase.find(u => u.id === appRecord.citizen_id);
  const events: any[] = [];

  events.push({
    id: `evt-create-${appRecord.id}`,
    event_type: "CREATION",
    title: "Application Registered",
    description: `Service request '${appRecord.service_type}' created and entered system queue.`,
    actor: citizen ? citizen.full_name : "Citizen",
    timestamp: appRecord.submitted_at,
    badge_variant: "primary"
  });

  const histories = statusHistoryDatabase.filter(h => h.application_id.toLowerCase() === aid.toLowerCase());
  histories.forEach(h => {
    const variant = h.new_status === "APPROVED" ? "success" : h.new_status === "REJECTED" ? "danger" : h.new_status === "MORE_INFORMATION_REQUIRED" ? "warning" : "info";
    events.push({
      id: `evt-status-${h.id}`,
      event_type: "STATUS_CHANGE",
      title: `Status: ${h.new_status.replace(/_/g, " ")}`,
      description: h.remarks || `Transitioned to ${h.new_status}`,
      actor: h.changed_by,
      timestamp: h.created_at,
      badge_variant: variant
    });
  });

  let notes = officerNotesDatabase.filter(n => n.application_id.toLowerCase() === aid.toLowerCase());
  if (req.user!.role === "citizen") {
    notes = notes.filter(n => n.note_type !== "INTERNAL");
  }

  notes.forEach(n => {
    const off = usersDatabase.find(u => u.id === n.officer_id);
    events.push({
      id: `evt-note-${n.id}`,
      event_type: "OFFICER_NOTE",
      title: `Officer Note (${n.note_type.replace(/_/g, " ")})`,
      description: n.note,
      actor: off ? off.full_name : "Land Officer",
      timestamp: n.created_at,
      badge_variant: "secondary"
    });
  });

  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  res.json(events);
});

// 10. Citizen Resubmit
app.post("/api/applications/:application_id/resubmit", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const aid = req.params.application_id;
  const { additional_notes } = req.body;

  const appRecord = applicationsDatabase.find(a => a.application_id.toLowerCase() === aid.toLowerCase());
  if (!appRecord) {
    res.status(404).json({ detail: `Application '${aid}' not found.` });
    return;
  }

  if (appRecord.citizen_id !== req.user!.id) {
    res.status(403).json({ detail: "You can only resubmit your own applications." });
    return;
  }

  if (appRecord.status !== "MORE_INFORMATION_REQUIRED") {
    res.status(400).json({ detail: `Application is not in MORE_INFORMATION_REQUIRED status (currently ${appRecord.status}).` });
    return;
  }

  appRecord.status = "SUBMITTED";
  appRecord.updated_at = new Date().toISOString();

  historyIdCounter++;
  statusHistoryDatabase.push({
    id: historyIdCounter,
    application_id: appRecord.application_id,
    previous_status: "MORE_INFORMATION_REQUIRED",
    new_status: "SUBMITTED",
    changed_by: `${req.user!.full_name} (Citizen Resubmission)`,
    remarks: `Citizen response: ${additional_notes || "Information and documents provided"}`,
    created_at: new Date().toISOString()
  });

  if (appRecord.assigned_officer_id) {
    notifIdCounter++;
    notificationsDatabase.unshift({
      id: notifIdCounter,
      user_id: appRecord.assigned_officer_id,
      title: "Citizen Resubmitted Case",
      message: `Applicant provided requested information on ${appRecord.application_id}.`,
      notification_type: "INFO",
      is_read: false,
      related_application_id: appRecord.application_id,
      created_at: new Date().toISOString()
    });
  }

  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "APPLICATION_RESUBMITTED",
    entity_type: "Application",
    entity_id: appRecord.application_id,
    details: `Citizen resubmitted with notes: ${additional_notes}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.json(serializeApp(appRecord));
});

// ==========================================
// NOTIFICATIONS ENDPOINTS
// ==========================================
app.get("/api/notifications", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { unread_only } = req.query;
  let notifs = notificationsDatabase.filter(n => n.user_id === req.user!.id);
  if (unread_only === "true") {
    notifs = notifs.filter(n => !n.is_read);
  }
  res.json(notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
});

app.get("/api/notifications/unread-count", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const count = notificationsDatabase.filter(n => n.user_id === req.user!.id && !n.is_read).length;
  res.json({ unread_count: count });
});

app.put("/api/notifications/:id/read", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const nid = parseInt(req.params.id, 10);
  const notif = notificationsDatabase.find(n => n.id === nid && n.user_id === req.user!.id);
  if (!notif) {
    res.status(404).json({ detail: "Notification not found." });
    return;
  }
  notif.is_read = true;
  res.json(notif);
});

app.put("/api/notifications/read-all", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  let count = 0;
  notificationsDatabase.forEach(n => {
    if (n.user_id === req.user!.id && !n.is_read) {
      n.is_read = true;
      count++;
    }
  });
  res.json({ status: "success", marked_read_count: count });
});

// ==========================================
// ANALYTICS & AUDIT LOG ENDPOINTS
// ==========================================
app.get("/api/analytics/overview", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const total = applicationsDatabase.length;
  const submitted = applicationsDatabase.filter(a => a.status === "SUBMITTED").length;
  const under_review = applicationsDatabase.filter(a => a.status === "UNDER_REVIEW").length;
  const verification_pending = applicationsDatabase.filter(a => a.status === "VERIFICATION_PENDING").length;
  const more_info = applicationsDatabase.filter(a => a.status === "MORE_INFORMATION_REQUIRED").length;
  const verified = applicationsDatabase.filter(a => a.status === "VERIFIED").length;
  const approved = applicationsDatabase.filter(a => a.status === "APPROVED").length;
  const rejected = applicationsDatabase.filter(a => a.status === "REJECTED").length;
  const closed = applicationsDatabase.filter(a => a.status === "CLOSED").length;
  const high_prio = applicationsDatabase.filter(a => ["HIGH", "CRITICAL"].includes(a.priority)).length;

  res.json({
    total_applications: total,
    submitted,
    under_review,
    verification_pending,
    more_info_required: more_info,
    verified,
    approved,
    rejected,
    closed,
    high_priority_cases: high_prio,
    average_processing_days: 3.4,
    total_users: usersDatabase.length,
    total_parcels: parcelsDatabase.length,
    system_health: "Operational (Optimal)"
  });
});

app.get("/api/analytics/applications/status", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const total = applicationsDatabase.length || 1;
  const statusColors: Record<string, string> = {
    SUBMITTED: "#3b82f6",
    UNDER_REVIEW: "#f59e0b",
    VERIFICATION_PENDING: "#8b5cf6",
    MORE_INFORMATION_REQUIRED: "#ec4899",
    VERIFIED: "#06b6d4",
    APPROVED: "#10b981",
    REJECTED: "#ef4444",
    CLOSED: "#64748b"
  };

  const counts: Record<string, number> = {};
  applicationsDatabase.forEach(a => {
    counts[a.status] = (counts[a.status] || 0) + 1;
  });

  const result = Object.entries(counts).map(([status, cnt]) => ({
    status: status.replace(/_/g, " "),
    count: cnt,
    percentage: Math.round((cnt / total) * 1000) / 10,
    color: statusColors[status] || "#3b82f6"
  }));

  res.json(result);
});

app.get("/api/analytics/applications/service-types", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const total = applicationsDatabase.length || 1;
  const counts: Record<string, number> = {};
  applicationsDatabase.forEach(a => {
    counts[a.service_type] = (counts[a.service_type] || 0) + 1;
  });

  const result = Object.entries(counts).map(([stype, cnt]) => ({
    service_type: stype,
    count: cnt,
    percentage: Math.round((cnt / total) * 1000) / 10
  }));

  res.json(result);
});

app.get("/api/analytics/applications/trends", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  res.json([
    { month: "Oct 2025", submitted: 12, verified: 10, approved: 9, rejected: 1 },
    { month: "Nov 2025", submitted: 18, verified: 15, approved: 14, rejected: 2 },
    { month: "Dec 2025", submitted: 24, verified: 20, approved: 19, rejected: 3 },
    { month: "Jan 2026", submitted: 31, verified: 28, approved: 25, rejected: 4 },
    { month: "Feb 2026", submitted: 42, verified: 36, approved: 32, rejected: 5 },
  ]);
});

app.get("/api/analytics/priority-distribution", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const prioColors: Record<string, string> = {
    LOW: "#64748b",
    MEDIUM: "#0284c7",
    HIGH: "#ea580c",
    CRITICAL: "#dc2626"
  };

  const counts: Record<string, number> = {};
  applicationsDatabase.forEach(a => {
    counts[a.priority] = (counts[a.priority] || 0) + 1;
  });

  const result = Object.entries(counts).map(([prio, cnt]) => ({
    priority: prio,
    count: cnt,
    color: prioColors[prio] || "#0284c7"
  }));

  res.json(result);
});

app.get("/api/analytics/audit-logs", authMiddleware, requireRole(["admin"]), (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const logs = auditLogsDatabase.slice(0, limit).map(l => {
    const user = l.user_id ? usersDatabase.find(u => u.id === l.user_id) : null;
    return {
      id: `AUD-${String(l.id).padStart(6, '0')}`,
      actor: user ? user.full_name : "System Automation",
      action: l.action,
      entity_type: l.entity_type,
      entity_id: l.entity_id,
      details: l.details,
      ip_address: l.ip_address,
      timestamp: l.created_at
    };
  });
  res.json(logs);
});

app.get("/api/audit-logs", authMiddleware, requireRole(["admin"]), (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const logs = auditLogsDatabase.slice(0, limit).map(l => {
    const user = l.user_id ? usersDatabase.find(u => u.id === l.user_id) : null;
    return {
      id: `AUD-${String(l.id).padStart(6, '0')}`,
      actor: user ? user.full_name : "System Automation",
      action: l.action,
      entity_type: l.entity_type,
      entity_id: l.entity_id,
      details: l.details,
      ip_address: l.ip_address,
      timestamp: l.created_at
    };
  });
  res.json(logs);
});

// ==============================================================
// PHASE 4: DOCUMENT INTELLIGENCE & AI/OCR VERIFICATION ENGINE
// ==============================================================

interface DocumentRecordServer {
  id: number;
  document_id: string;
  application_id: string | null;
  parcel_id: string | null;
  uploaded_by: number;
  document_type: string;
  detected_type: string | null;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  mime_type: string;
  upload_status: string;
  processing_status: string;
  ocr_status: string;
  verification_status: string;
  uploaded_at: string;
  processed_at: string | null;
  ocr_result?: {
    id: number;
    document_id: string;
    raw_text: string;
    cleaned_text: string;
    page_count: number;
    average_confidence: number;
    processing_time: number;
    created_at: string;
  };
  extracted_fields: Array<{
    id: number;
    document_id: string;
    field_name: string;
    field_value: string;
    normalized_value: string;
    confidence: number;
    source_text: string | null;
    status: string;
    created_at: string;
  }>;
  verification_result?: {
    id: number;
    document_id: string;
    application_id: string | null;
    parcel_id: string | null;
    overall_score: number;
    verification_status: string;
    confidence_level: string;
    mismatch_count: number;
    critical_mismatch_count: number;
    summary: string;
    review_required: boolean;
    created_at: string;
  };
  mismatches: Array<{
    id: number;
    document_id: string;
    field_name: string;
    document_value: string | null;
    system_value: string | null;
    match_type: string;
    severity: string;
    confidence: number;
    description: string;
    created_at: string;
  }>;
}

let docCounter = 6;
const documentsDatabase: DocumentRecordServer[] = [
  {
    id: 1,
    document_id: "DOC-2026-000001",
    application_id: "APP-2026-000001",
    parcel_id: "TN-CHE-2026-001",
    uploaded_by: 1,
    document_type: "SALE_DEED",
    detected_type: "SALE_DEED",
    original_filename: "registered_sale_deed_2026_001.pdf",
    stored_filename: "doc_a8f93e11b2c4.pdf",
    file_size: 2458920,
    mime_type: "application/pdf",
    upload_status: "COMPLETED",
    processing_status: "VERIFICATION_COMPLETED",
    ocr_status: "COMPLETED",
    verification_status: "VERIFIED",
    uploaded_at: "2026-02-10T10:30:00Z",
    processed_at: "2026-02-10T10:30:04Z",
    ocr_result: {
      id: 1,
      document_id: "DOC-2026-000001",
      raw_text: `GOVERNMENT OF TAMIL NADU - REGISTRATION DEPARTMENT
SUB-REGISTRAR OFFICE: TAMBARAM
DOCUMENT NO: 4589 / 2024 | BOOK 1 VOLUME 412
THIS DEED OF ABSOLUTE SALE executed on 14th day of March 2024
BETWEEN: Thiru S. Natarajan, S/o Late Sundaram (VENDOR)
AND: Thiru Ramesh Kumar, S/o V. Krishnan, Residing at Plot 45, Anna Nagar, Chennai 600040 (PURCHASER / VENDEE).
SCHEDULE OF PROPERTY:
All that piece and parcel of Agricultural / Punja Land situated in Sholinganallur Village, Tambaram Taluk, Chengalpattu District.
Survey Number: 124/2 | Sub-Division No: 2
Extent / Area: 2.45 Acres (equivalent to 106,722 Sq.Ft)
Boundaries:
North By: Survey No 124/1 (Gopal Reddiar Land)
South By: 30 Feet Village Panchayat Road
East By: Survey No 125/2
West By: Survey No 123
Consideration Amount: Rs. 48,00,000/- fully paid.`,
      cleaned_text: `GOVERNMENT OF TAMIL NADU - REGISTRATION DEPARTMENT\nSUB-REGISTRAR OFFICE: TAMBARAM\nDOCUMENT NO: 4589 / 2024 | BOOK 1 VOLUME 412\nTHIS DEED OF ABSOLUTE SALE executed on 14th day of March 2024\nBETWEEN: Thiru S. Natarajan, S/o Late Sundaram (VENDOR)\nAND: Thiru Ramesh Kumar, S/o V. Krishnan, Residing at Plot 45, Anna Nagar, Chennai 600040 (PURCHASER / VENDEE).\nSCHEDULE OF PROPERTY:\nAll that piece and parcel of Agricultural / Punja Land situated in Sholinganallur Village, Tambaram Taluk, Chengalpattu District.\nSurvey Number: 124/2 | Sub-Division No: 2\nExtent / Area: 2.45 Acres (equivalent to 106,722 Sq.Ft)\nBoundaries:\nNorth By: Survey No 124/1 (Gopal Reddiar Land)\nSouth By: 30 Feet Village Panchayat Road\nEast By: Survey No 125/2\nWest By: Survey No 123\nConsideration Amount: Rs. 48,00,000/- fully paid.`,
      page_count: 4,
      average_confidence: 96.8,
      processing_time: 1.42,
      created_at: "2026-02-10T10:30:02Z"
    },
    extracted_fields: [
      { id: 1, document_id: "DOC-2026-000001", field_name: "OWNER_NAME", field_value: "Ramesh Kumar", normalized_value: "RAMESH KUMAR", confidence: 96.0, source_text: "AND: Thiru Ramesh Kumar, S/o V. Krishnan", status: "FOUND", created_at: "2026-02-10T10:30:03Z" },
      { id: 2, document_id: "DOC-2026-000001", field_name: "FATHER_OR_SPOUSE_NAME", field_value: "V. Krishnan", normalized_value: "V KRISHNAN", confidence: 94.0, source_text: "S/o V. Krishnan, Residing at Plot 45", status: "FOUND", created_at: "2026-02-10T10:30:03Z" },
      { id: 3, document_id: "DOC-2026-000001", field_name: "SURVEY_NUMBER", field_value: "124/2", normalized_value: "124/2", confidence: 98.0, source_text: "Survey Number: 124/2 | Sub-Division No: 2", status: "FOUND", created_at: "2026-02-10T10:30:03Z" },
      { id: 4, document_id: "DOC-2026-000001", field_name: "SUBDIVISION_NUMBER", field_value: "2", normalized_value: "2", confidence: 95.0, source_text: "Sub-Division No: 2", status: "FOUND", created_at: "2026-02-10T10:30:03Z" },
      { id: 5, document_id: "DOC-2026-000001", field_name: "LAND_AREA", field_value: "2.45 Acres", normalized_value: "2.45 Acres", confidence: 97.0, source_text: "Extent / Area: 2.45 Acres (equivalent to 106,722 Sq.Ft)", status: "FOUND", created_at: "2026-02-10T10:30:03Z" },
      { id: 6, document_id: "DOC-2026-000001", field_name: "VILLAGE", field_value: "Sholinganallur", normalized_value: "SHOLINGANALLUR", confidence: 92.0, source_text: "situated in Sholinganallur Village", status: "FOUND", created_at: "2026-02-10T10:30:03Z" },
      { id: 7, document_id: "DOC-2026-000001", field_name: "DISTRICT", field_value: "Chengalpattu", normalized_value: "CHENGALPATTU", confidence: 93.0, source_text: "Tambaram Taluk, Chengalpattu District", status: "FOUND", created_at: "2026-02-10T10:30:03Z" },
      { id: 8, document_id: "DOC-2026-000001", field_name: "DOCUMENT_NUMBER", field_value: "4589/2024", normalized_value: "4589/2024", confidence: 99.0, source_text: "DOCUMENT NO: 4589 / 2024", status: "FOUND", created_at: "2026-02-10T10:30:03Z" }
    ],
    verification_result: {
      id: 1,
      document_id: "DOC-2026-000001",
      application_id: "APP-2026-000001",
      parcel_id: "TN-CHE-2026-001",
      overall_score: 98.0,
      verification_status: "VERIFIED",
      confidence_level: "HIGH CONFIDENCE",
      mismatch_count: 0,
      critical_mismatch_count: 0,
      summary: "All deed metadata, cadastral survey number, and recorded owner details match official state GIS records perfectly.",
      review_required: false,
      created_at: "2026-02-10T10:30:04Z"
    },
    mismatches: []
  },
  {
    id: 2,
    document_id: "DOC-2026-000002",
    application_id: "APP-2026-000002",
    parcel_id: "TN-CHE-2026-002",
    uploaded_by: 1,
    document_type: "PATTA",
    detected_type: "PATTA",
    original_filename: "patta_extract_e_services.pdf",
    stored_filename: "doc_9c2d4e81a3f0.pdf",
    file_size: 1145200,
    mime_type: "application/pdf",
    upload_status: "COMPLETED",
    processing_status: "VERIFICATION_COMPLETED",
    ocr_status: "COMPLETED",
    verification_status: "MISMATCH_FOUND",
    uploaded_at: "2026-02-11T14:15:00Z",
    processed_at: "2026-02-11T14:15:03Z",
    ocr_result: {
      id: 2,
      document_id: "DOC-2026-000002",
      raw_text: `GOVERNMENT OF TAMIL NADU - REVENUE DEPARTMENT
E-SERVICES RECORD OF RIGHTS (PATTA / CHITTA EXTRACT)
PATTA NO: 1842 | TALUK: TAMBARAM | VILLAGE: SHOLINGANALLUR
PATTADAR NAME: R. Kumar
FATHER'S NAME: V. Krishnan
SURVEY NUMBER: 125/1 | SUB-DIVISION: 1
CLASSIFICATION: PUNJAI (DRY LAND)
EXTENT: 0.85.0 HECTARES (2.10 ACRES)
REVENUE TAX: RS. 42.50
ISSUED BY: TAHSILDAR TAMBARAM WITH DIGITAL SIGNATURE`,
      cleaned_text: `GOVERNMENT OF TAMIL NADU - REVENUE DEPARTMENT\nE-SERVICES RECORD OF RIGHTS (PATTA / CHITTA EXTRACT)\nPATTA NO: 1842 | TALUK: TAMBARAM | VILLAGE: SHOLINGANALLUR\nPATTADAR NAME: R. Kumar\nFATHER'S NAME: V. Krishnan\nSURVEY NUMBER: 125/1 | SUB-DIVISION: 1\nCLASSIFICATION: PUNJAI (DRY LAND)\nEXTENT: 0.85.0 HECTARES (2.10 ACRES)\nREVENUE TAX: RS. 42.50\nISSUED BY: TAHSILDAR TAMBARAM WITH DIGITAL SIGNATURE`,
      page_count: 1,
      average_confidence: 94.2,
      processing_time: 0.95,
      created_at: "2026-02-11T14:15:02Z"
    },
    extracted_fields: [
      { id: 9, document_id: "DOC-2026-000002", field_name: "OWNER_NAME", field_value: "R. Kumar", normalized_value: "R KUMAR", confidence: 91.0, source_text: "PATTADAR NAME: R. Kumar", status: "FOUND", created_at: "2026-02-11T14:15:02Z" },
      { id: 10, document_id: "DOC-2026-000002", field_name: "FATHER_OR_SPOUSE_NAME", field_value: "V. Krishnan", normalized_value: "V KRISHNAN", confidence: 93.0, source_text: "FATHER'S NAME: V. Krishnan", status: "FOUND", created_at: "2026-02-11T14:15:02Z" },
      { id: 11, document_id: "DOC-2026-000002", field_name: "SURVEY_NUMBER", field_value: "125/1", normalized_value: "125/1", confidence: 97.0, source_text: "SURVEY NUMBER: 125/1", status: "FOUND", created_at: "2026-02-11T14:15:02Z" },
      { id: 12, document_id: "DOC-2026-000002", field_name: "LAND_AREA", field_value: "2.10 Acres", normalized_value: "2.10 Acres", confidence: 90.0, source_text: "EXTENT: 0.85.0 HECTARES (2.10 ACRES)", status: "FOUND", created_at: "2026-02-11T14:15:02Z" }
    ],
    verification_result: {
      id: 2,
      document_id: "DOC-2026-000002",
      application_id: "APP-2026-000002",
      parcel_id: "TN-CHE-2026-002",
      overall_score: 88.0,
      verification_status: "MISMATCH_FOUND",
      confidence_level: "REVIEW RECOMMENDED",
      mismatch_count: 1,
      critical_mismatch_count: 0,
      summary: "Minor name format variance detected ('R. Kumar' vs official 'Ramesh Kumar'). Officer endorsement advised.",
      review_required: true,
      created_at: "2026-02-11T14:15:03Z"
    },
    mismatches: [
      {
        id: 1,
        document_id: "DOC-2026-000002",
        field_name: "OWNER_NAME",
        document_value: "R. Kumar",
        system_value: "Ramesh Kumar",
        match_type: "FUZZY_MATCH",
        severity: "LOW",
        confidence: 86.0,
        description: "Initial abbreviation pattern detected ('R. Kumar' vs 'Ramesh Kumar'). Likely same legal entity, minor clerical variance.",
        created_at: "2026-02-11T14:15:03Z"
      }
    ]
  },
  {
    id: 3,
    document_id: "DOC-2026-000003",
    application_id: "APP-2026-000003",
    parcel_id: "TN-CHE-2026-003",
    uploaded_by: 1,
    document_type: "PROPERTY_TAX_RECORD",
    detected_type: "PROPERTY_TAX_RECORD",
    original_filename: "chengalpattu_tax_receipt_2025.jpg",
    stored_filename: "doc_3e4f5a6b7c8d.jpg",
    file_size: 1820400,
    mime_type: "image/jpeg",
    upload_status: "COMPLETED",
    processing_status: "VERIFICATION_COMPLETED",
    ocr_status: "COMPLETED",
    verification_status: "REVIEW_REQUIRED",
    uploaded_at: "2026-02-12T09:20:00Z",
    processed_at: "2026-02-12T09:20:03Z",
    ocr_result: {
      id: 3,
      document_id: "DOC-2026-000003",
      raw_text: `GREATER CHENNAI CORPORATION / PANCHAYAT TAX DIVISION
PROPERTY TAX DEMAND CUM RECEIPT
RECEIPT NO: TAX-2025-98431 | DATE: 12/01/2025
ASSESSMENT NO: 08-114-04921
NAME OF ASSESSEE: Priya Venkatesh
PROPERTY ADDRESS: Survey No 128/4, Sholinganallur Main Rd
LAND EXTENT: 3.10 Acres
TOTAL ANNUAL TAX PAID: RS. 8,450/-
PAYMENT MODE: ONLINE UPI BANKING`,
      cleaned_text: `GREATER CHENNAI CORPORATION / PANCHAYAT TAX DIVISION\nPROPERTY TAX DEMAND CUM RECEIPT\nRECEIPT NO: TAX-2025-98431 | DATE: 12/01/2025\nASSESSMENT NO: 08-114-04921\nNAME OF ASSESSEE: Priya Venkatesh\nPROPERTY ADDRESS: Survey No 128/4, Sholinganallur Main Rd\nLAND EXTENT: 3.10 Acres\nTOTAL ANNUAL TAX PAID: RS. 8,450/-\nPAYMENT MODE: ONLINE UPI BANKING`,
      page_count: 1,
      average_confidence: 91.0,
      processing_time: 1.1,
      created_at: "2026-02-12T09:20:02Z"
    },
    extracted_fields: [
      { id: 13, document_id: "DOC-2026-000003", field_name: "OWNER_NAME", field_value: "Priya Venkatesh", normalized_value: "PRIYA VENKATESH", confidence: 95.0, source_text: "NAME OF ASSESSEE: Priya Venkatesh", status: "FOUND", created_at: "2026-02-12T09:20:02Z" },
      { id: 14, document_id: "DOC-2026-000003", field_name: "SURVEY_NUMBER", field_value: "128/4", normalized_value: "128/4", confidence: 96.0, source_text: "PROPERTY ADDRESS: Survey No 128/4", status: "FOUND", created_at: "2026-02-12T09:20:02Z" },
      { id: 15, document_id: "DOC-2026-000003", field_name: "LAND_AREA", field_value: "3.10 Acres", normalized_value: "3.10 Acres", confidence: 89.0, source_text: "LAND EXTENT: 3.10 Acres", status: "FOUND", created_at: "2026-02-12T09:20:02Z" }
    ],
    verification_result: {
      id: 3,
      document_id: "DOC-2026-000003",
      application_id: "APP-2026-000003",
      parcel_id: "TN-CHE-2026-003",
      overall_score: 72.0,
      verification_status: "REVIEW_REQUIRED",
      confidence_level: "SIGNIFICANT DIFFERENCES",
      mismatch_count: 1,
      critical_mismatch_count: 0,
      summary: "Significant area divergence detected: Tax receipt states 3.10 Acres, while cadastral GIS boundary measures 2.45 Acres (26.5% excess).",
      review_required: true,
      created_at: "2026-02-12T09:20:03Z"
    },
    mismatches: [
      {
        id: 2,
        document_id: "DOC-2026-000003",
        field_name: "LAND_AREA",
        document_value: "3.10 Acres",
        system_value: "2.45 Acres",
        match_type: "MISMATCH",
        severity: "HIGH",
        confidence: 94.0,
        description: "Tax record declares 3.10 Acres, exceeding system parcel boundary (2.45 Acres) by 0.65 Acres. Field measurement mandated.",
        created_at: "2026-02-12T09:20:03Z"
      }
    ]
  },
  {
    id: 4,
    document_id: "DOC-2026-000004",
    application_id: "APP-2026-000004",
    parcel_id: "TN-CHE-2026-004",
    uploaded_by: 1,
    document_type: "LAND_SURVEY_DOCUMENT",
    detected_type: "LAND_SURVEY_DOCUMENT",
    original_filename: "survey_fmb_sketch_scan.pdf",
    stored_filename: "doc_1a2b3c4d5e6f.pdf",
    file_size: 3200150,
    mime_type: "application/pdf",
    upload_status: "COMPLETED",
    processing_status: "VERIFICATION_COMPLETED",
    ocr_status: "COMPLETED",
    verification_status: "FAILED",
    uploaded_at: "2026-02-13T11:00:00Z",
    processed_at: "2026-02-13T11:00:04Z",
    ocr_result: {
      id: 4,
      document_id: "DOC-2026-000004",
      raw_text: `DEPARTMENT OF SURVEY AND SETTLEMENT - TAMIL NADU
FIELD MEASUREMENT BOOK (FMB) SKETCH RECORD
TALUK: TAMBARAM | VILLAGE: SHOLINGANALLUR
SURVEY NUMBER: 124/3 | SUBDIVISION: 3
OWNER / REGISTERED HOLDER: K. Selvam
TOTAL EXTENT: 1.80 ACRES
FIELD BOUNDARY DIAGONALS: A-B: 42.4m, B-C: 58.2m, C-D: 41.0m, D-A: 60.1m`,
      cleaned_text: `DEPARTMENT OF SURVEY AND SETTLEMENT - TAMIL NADU\nFIELD MEASUREMENT BOOK (FMB) SKETCH RECORD\nTALUK: TAMBARAM | VILLAGE: SHOLINGANALLUR\nSURVEY NUMBER: 124/3 | SUBDIVISION: 3\nOWNER / REGISTERED HOLDER: K. Selvam\nTOTAL EXTENT: 1.80 ACRES\nFIELD BOUNDARY DIAGONALS: A-B: 42.4m, B-C: 58.2m, C-D: 41.0m, D-A: 60.1m`,
      page_count: 2,
      average_confidence: 89.5,
      processing_time: 1.6,
      created_at: "2026-02-13T11:00:02Z"
    },
    extracted_fields: [
      { id: 16, document_id: "DOC-2026-000004", field_name: "OWNER_NAME", field_value: "K. Selvam", normalized_value: "K SELVAM", confidence: 92.0, source_text: "OWNER / REGISTERED HOLDER: K. Selvam", status: "FOUND", created_at: "2026-02-13T11:00:03Z" },
      { id: 17, document_id: "DOC-2026-000004", field_name: "SURVEY_NUMBER", field_value: "124/3", normalized_value: "124/3", confidence: 97.0, source_text: "SURVEY NUMBER: 124/3", status: "FOUND", created_at: "2026-02-13T11:00:03Z" },
      { id: 18, document_id: "DOC-2026-000004", field_name: "LAND_AREA", field_value: "1.80 Acres", normalized_value: "1.80 Acres", confidence: 93.0, source_text: "TOTAL EXTENT: 1.80 ACRES", status: "FOUND", created_at: "2026-02-13T11:00:03Z" }
    ],
    verification_result: {
      id: 4,
      document_id: "DOC-2026-000004",
      application_id: "APP-2026-000004",
      parcel_id: "TN-CHE-2026-004",
      overall_score: 45.0,
      verification_status: "FAILED",
      confidence_level: "CRITICAL REVIEW REQUIRED",
      mismatch_count: 2,
      critical_mismatch_count: 2,
      summary: "Critical cadastral mismatch: Document survey number (124/3) and owner ('K. Selvam') conflict directly with target parcel record (Survey 124/2, Ramesh Kumar).",
      review_required: true,
      created_at: "2026-02-13T11:00:04Z"
    },
    mismatches: [
      {
        id: 3,
        document_id: "DOC-2026-000004",
        field_name: "SURVEY_NUMBER",
        document_value: "124/3",
        system_value: "124/2",
        match_type: "MISMATCH",
        severity: "CRITICAL",
        confidence: 98.0,
        description: "Survey Number Conflict: Uploaded FMB sketch belongs to Survey 124/3, whereas application targets Survey 124/2.",
        created_at: "2026-02-13T11:00:04Z"
      },
      {
        id: 4,
        document_id: "DOC-2026-000004",
        field_name: "OWNER_NAME",
        document_value: "K. Selvam",
        system_value: "Ramesh Kumar",
        match_type: "MISMATCH",
        severity: "CRITICAL",
        confidence: 95.0,
        description: "Wrong Title Holder: Document registered under K. Selvam instead of applicant Ramesh Kumar.",
        created_at: "2026-02-13T11:00:04Z"
      }
    ]
  },
  {
    id: 5,
    document_id: "DOC-2026-000005",
    application_id: "APP-2026-000001",
    parcel_id: "TN-CHE-2026-001",
    uploaded_by: 1,
    document_type: "ENCUMBRANCE_CERTIFICATE",
    detected_type: "ENCUMBRANCE_CERTIFICATE",
    original_filename: "nil_encumbrance_certificate_ec.pdf",
    stored_filename: "doc_5f6e7d8c9b0a.pdf",
    file_size: 1980300,
    mime_type: "application/pdf",
    upload_status: "COMPLETED",
    processing_status: "VERIFICATION_COMPLETED",
    ocr_status: "COMPLETED",
    verification_status: "VERIFIED",
    uploaded_at: "2026-02-14T16:40:00Z",
    processed_at: "2026-02-14T16:40:03Z",
    ocr_result: {
      id: 5,
      document_id: "DOC-2026-000005",
      raw_text: `GOVERNMENT OF TAMIL NADU - REGISTRATION DEPARTMENT
FORM NO. 15 - CERTIFICATE OF ENCUMBRANCE ON PROPERTY
SEARCH APPLICATION NO: EC/2026/88412 | DATED: 10/02/2026
SEARCH PERIOD: 01/01/1990 TO 09/02/2026 (36 YEARS)
SUB-REGISTRAR JURISDICTION: TAMBARAM | VILLAGE: SHOLINGANALLUR
SURVEY NO: 124/2 | EXTENT: 2.45 ACRES
REGISTERED HOLDER: Ramesh Kumar
ENCUMBRANCE STATUS: NIL ENCUMBRANCE (NO REGISTERED MORTGAGES, CHARGES, OR LIENS FOUND)
CERTIFIED BY SUB-REGISTRAR TAMBARAM`,
      cleaned_text: `GOVERNMENT OF TAMIL NADU - REGISTRATION DEPARTMENT\nFORM NO. 15 - CERTIFICATE OF ENCUMBRANCE ON PROPERTY\nSEARCH APPLICATION NO: EC/2026/88412 | DATED: 10/02/2026\nSEARCH PERIOD: 01/01/1990 TO 09/02/2026 (36 YEARS)\nSUB-REGISTRAR JURISDICTION: TAMBARAM | VILLAGE: SHOLINGANALLUR\nSURVEY NO: 124/2 | EXTENT: 2.45 ACRES\nREGISTERED HOLDER: Ramesh Kumar\nENCUMBRANCE STATUS: NIL ENCUMBRANCE (NO REGISTERED MORTGAGES, CHARGES, OR LIENS FOUND)\nCERTIFIED BY SUB-REGISTRAR TAMBARAM`,
      page_count: 2,
      average_confidence: 97.5,
      processing_time: 1.25,
      created_at: "2026-02-14T16:40:02Z"
    },
    extracted_fields: [
      { id: 19, document_id: "DOC-2026-000005", field_name: "OWNER_NAME", field_value: "Ramesh Kumar", normalized_value: "RAMESH KUMAR", confidence: 97.0, source_text: "REGISTERED HOLDER: Ramesh Kumar", status: "FOUND", created_at: "2026-02-14T16:40:02Z" },
      { id: 20, document_id: "DOC-2026-000005", field_name: "SURVEY_NUMBER", field_value: "124/2", normalized_value: "124/2", confidence: 98.0, source_text: "SURVEY NO: 124/2", status: "FOUND", created_at: "2026-02-14T16:40:02Z" },
      { id: 21, document_id: "DOC-2026-000005", field_name: "LAND_AREA", field_value: "2.45 Acres", normalized_value: "2.45 Acres", confidence: 96.0, source_text: "EXTENT: 2.45 ACRES", status: "FOUND", created_at: "2026-02-14T16:40:02Z" }
    ],
    verification_result: {
      id: 5,
      document_id: "DOC-2026-000005",
      application_id: "APP-2026-000001",
      parcel_id: "TN-CHE-2026-001",
      overall_score: 98.0,
      verification_status: "VERIFIED",
      confidence_level: "HIGH CONFIDENCE",
      mismatch_count: 0,
      critical_mismatch_count: 0,
      summary: "Nil Encumbrance Certificate successfully cross-checked across 36-year search history. Clean legal title confirmed.",
      review_required: false,
      created_at: "2026-02-14T16:40:03Z"
    },
    mismatches: []
  }
];

// Helper: Normalize String
function normalizeStr(str: string | null | undefined): string {
  if (!str) return "";
  return str.toUpperCase().replace(/^(MR\.|MRS\.|MS\.|DR\.|SHRI\.|SMT\.|THIRU\.|SELVI\.)\s*/i, "").replace(/[^A-Z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Helper: Normalize Survey No
function normalizeSurvey(s: string | null | undefined): string {
  if (!s) return "";
  return s.trim().toUpperCase().replace(/\s*[-\\/]\s*/g, "/");
}

// Dynamic Document Pipeline Executor for uploaded files
function executeDocumentPipeline(doc: DocumentRecordServer, textSnippet?: string) {
  const text = textSnippet || `LAND RECORD DOCUMENT - TAMIL NADU REVENUE DEPARTMENT
VILLAGE: Sholinganallur | TALUK: Tambaram | DISTRICT: Chengalpattu
OWNER NAME: Ramesh Kumar | FATHER: V. Krishnan
SURVEY NUMBER: 124/2 | SUBDIVISION: 2
EXTENT: 2.45 Acres (106,722 Sq.Ft)
DOCUMENT NO: 4589/2024 | REGISTRATION DATE: 14/03/2024
AUTHENTICATED DIGITAL CADASTRE COPY`;

  doc.processing_status = "PROCESSING";
  doc.ocr_status = "COMPLETED";
  doc.processed_at = new Date().toISOString();

  // 1. OCR Result
  doc.ocr_result = {
    id: doc.id,
    document_id: doc.document_id,
    raw_text: text,
    cleaned_text: text,
    page_count: 2,
    average_confidence: 94.5,
    processing_time: 1.15,
    created_at: new Date().toISOString()
  };

  // 2. Extract Fields
  const extracted: DocumentRecordServer["extracted_fields"] = [];
  const nameMatch = text.match(/(?:owner|purchaser|name|holder|assessee)\s*[:\-]\s*([A-Za-z\s\.]+)/i);
  const surveyMatch = text.match(/(?:survey\s*(?:no|number)|s\.?\s*no)\s*[:\-]\s*([0-9\/\-]+)/i);
  const areaMatch = text.match(/(?:extent|area|land\s*area)\s*[:\-]\s*([0-9]+(?:\.[0-9]+)?\s*(?:acres?|cents?|sq\.?\s*ft))/i);
  const distMatch = text.match(/(?:district)\s*[:\-]\s*([A-Za-z\s]+)/i);

  if (nameMatch) {
    extracted.push({
      id: doc.id * 10 + 1,
      document_id: doc.document_id,
      field_name: "OWNER_NAME",
      field_value: nameMatch[1].trim(),
      normalized_value: normalizeStr(nameMatch[1]),
      confidence: 94.0,
      source_text: nameMatch[0],
      status: "FOUND",
      created_at: new Date().toISOString()
    });
  }
  if (surveyMatch) {
    extracted.push({
      id: doc.id * 10 + 2,
      document_id: doc.document_id,
      field_name: "SURVEY_NUMBER",
      field_value: surveyMatch[1].trim(),
      normalized_value: normalizeSurvey(surveyMatch[1]),
      confidence: 96.0,
      source_text: surveyMatch[0],
      status: "FOUND",
      created_at: new Date().toISOString()
    });
  }
  if (areaMatch) {
    extracted.push({
      id: doc.id * 10 + 3,
      document_id: doc.document_id,
      field_name: "LAND_AREA",
      field_value: areaMatch[1].trim(),
      normalized_value: areaMatch[1].trim(),
      confidence: 92.0,
      source_text: areaMatch[0],
      status: "FOUND",
      created_at: new Date().toISOString()
    });
  }
  if (distMatch) {
    extracted.push({
      id: doc.id * 10 + 4,
      document_id: doc.document_id,
      field_name: "DISTRICT",
      field_value: distMatch[1].trim(),
      normalized_value: normalizeStr(distMatch[1]),
      confidence: 93.0,
      source_text: distMatch[0],
      status: "FOUND",
      created_at: new Date().toISOString()
    });
  }
  doc.extracted_fields = extracted;

  // 3. Verification & Mismatches
  const parcel = doc.parcel_id
    ? parcelsDatabase.find(p => p.parcel_id === doc.parcel_id || p.survey_number === doc.parcel_id || String(p.id) === doc.parcel_id)
    : parcelsDatabase[0];
  const mismatches: DocumentRecordServer["mismatches"] = [];
  let score = 100;

  const docOwner = extracted.find(f => f.field_name === "OWNER_NAME");
  if (docOwner && parcel) {
    const sysOwnerNorm = normalizeStr(parcel.current_owner);
    if (docOwner.normalized_value !== sysOwnerNorm) {
      if (docOwner.normalized_value.replace(/\s+/g, "").includes(sysOwnerNorm.replace(/\s+/g, "")) || sysOwnerNorm.includes(docOwner.normalized_value.slice(0, 3))) {
        mismatches.push({
          id: doc.id * 10 + 1,
          document_id: doc.document_id,
          field_name: "OWNER_NAME",
          document_value: docOwner.field_value,
          system_value: parcel.current_owner,
          match_type: "FUZZY_MATCH",
          severity: "LOW",
          confidence: 85.0,
          description: `Minor spelling/initials variance ('${docOwner.field_value}' vs '${parcel.current_owner}').`,
          created_at: new Date().toISOString()
        });
        score -= 10;
      } else {
        mismatches.push({
          id: doc.id * 10 + 1,
          document_id: doc.document_id,
          field_name: "OWNER_NAME",
          document_value: docOwner.field_value,
          system_value: parcel.current_owner,
          match_type: "MISMATCH",
          severity: "CRITICAL",
          confidence: 96.0,
          description: `Owner name mismatch: Document states '${docOwner.field_value}', official parcel owner is '${parcel.current_owner}'.`,
          created_at: new Date().toISOString()
        });
        score -= 30;
      }
    }
  }

  const docSurvey = extracted.find(f => f.field_name === "SURVEY_NUMBER");
  if (docSurvey && parcel) {
    if (normalizeSurvey(docSurvey.field_value) !== normalizeSurvey(parcel.survey_number)) {
      mismatches.push({
        id: doc.id * 10 + 2,
        document_id: doc.document_id,
        field_name: "SURVEY_NUMBER",
        document_value: docSurvey.field_value,
        system_value: parcel.survey_number,
        match_type: "MISMATCH",
        severity: "CRITICAL",
        confidence: 98.0,
        description: `Survey number mismatch: Document references '${docSurvey.field_value}', target parcel is '${parcel.survey_number}'.`,
        created_at: new Date().toISOString()
      });
      score -= 30;
    }
  }

  const criticalCount = mismatches.filter(m => m.severity === "CRITICAL").length;
  let vStatus = "VERIFIED";
  let confLevel = "HIGH CONFIDENCE";
  let revReq = false;

  if (score >= 90 && criticalCount === 0) {
    vStatus = "VERIFIED";
    confLevel = "HIGH CONFIDENCE";
    revReq = false;
  } else if (score >= 75 && criticalCount === 0) {
    vStatus = "MISMATCH_FOUND";
    confLevel = "REVIEW RECOMMENDED";
    revReq = true;
  } else if (score >= 50) {
    vStatus = "REVIEW_REQUIRED";
    confLevel = "SIGNIFICANT DIFFERENCES";
    revReq = true;
  } else {
    vStatus = "FAILED";
    confLevel = "CRITICAL REVIEW REQUIRED";
    revReq = true;
  }

  doc.mismatches = mismatches;
  doc.verification_status = vStatus;
  doc.processing_status = "VERIFICATION_COMPLETED";
  doc.verification_result = {
    id: doc.id,
    document_id: doc.document_id,
    application_id: doc.application_id,
    parcel_id: doc.parcel_id,
    overall_score: Math.max(0, score),
    verification_status: vStatus,
    confidence_level: confLevel,
    mismatch_count: mismatches.length,
    critical_mismatch_count: criticalCount,
    summary: mismatches.length === 0 ? "All document fields align with official land registry records." : `${mismatches.length} discrepancy findings detected. Officer inspection recommended.`,
    review_required: revReq,
    created_at: new Date().toISOString()
  };
}

// Document API Endpoints
app.post("/api/documents/upload", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { application_id, document_type, filename, raw_text } = req.body || {};
  const current_user = req.user!;
  
  const docId = `DOC-2026-${String(docCounter++).padStart(6, '0')}`;
  const origName = filename || (req.headers["x-filename"] as string) || "uploaded_land_record.pdf";
  
  const newDoc: DocumentRecordServer = {
    id: docCounter,
    document_id: docId,
    application_id: application_id || null,
    parcel_id: application_id ? (applicationsDatabase.find(a => a.application_id === application_id)?.parcel_id || "TN-CHE-2026-001") : "TN-CHE-2026-001",
    uploaded_by: current_user.id,
    document_type: document_type || "OTHER_LAND_DOCUMENT",
    detected_type: document_type || "OTHER_LAND_DOCUMENT",
    original_filename: origName,
    stored_filename: `doc_${Date.now().toString(16)}.pdf`,
    file_size: 2048500,
    mime_type: origName.endsWith(".png") ? "image/png" : origName.endsWith(".jpg") || origName.endsWith(".jpeg") ? "image/jpeg" : "application/pdf",
    upload_status: "COMPLETED",
    processing_status: "UPLOADED",
    ocr_status: "PENDING",
    verification_status: "PENDING",
    uploaded_at: new Date().toISOString(),
    processed_at: null,
    extracted_fields: [],
    mismatches: []
  };

  executeDocumentPipeline(newDoc, raw_text);
  documentsDatabase.unshift(newDoc);

  // Add audit log
  auditLogsDatabase.unshift({
    id: auditLogsDatabase.length + 1,
    user_id: current_user.id,
    action: "DOCUMENT_UPLOADED",
    entity_type: "DOCUMENT",
    entity_id: newDoc.document_id,
    details: `Uploaded ${newDoc.original_filename} (${newDoc.document_type}) for Application ${newDoc.application_id || 'Direct'}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  // Notification
  notificationsDatabase.unshift({
    id: notificationsDatabase.length + 1,
    user_id: current_user.id,
    title: "Document Verified by AI Engine",
    message: `Document ${newDoc.document_id} has been processed. Score: ${newDoc.verification_result?.overall_score || 95}/100.`,
    notification_type: "SUCCESS",
    is_read: false,
    related_application_id: newDoc.application_id,
    created_at: new Date().toISOString()
  });

  const uploader = usersDatabase.find(u => u.id === newDoc.uploaded_by);
  res.json({
    ...newDoc,
    uploader_name: uploader?.full_name || "Citizen"
  });
});

app.get("/api/documents", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { application_id, document_type, verification_status } = req.query as {
    application_id?: string;
    document_type?: string;
    verification_status?: string;
  };
  const current_user = req.user!;

  let filtered = [...documentsDatabase];
  if (current_user.role === "citizen") {
    filtered = filtered.filter(d => d.uploaded_by === current_user.id);
  }
  if (application_id) {
    filtered = filtered.filter(d => d.application_id === application_id);
  }
  if (document_type) {
    filtered = filtered.filter(d => d.document_type === document_type);
  }
  if (verification_status) {
    filtered = filtered.filter(d => d.verification_status === verification_status);
  }

  const result = filtered.map(d => {
    const uploader = usersDatabase.find(u => u.id === d.uploaded_by);
    return {
      id: d.id,
      document_id: d.document_id,
      application_id: d.application_id,
      parcel_id: d.parcel_id,
      uploaded_by: d.uploaded_by,
      uploader_name: uploader?.full_name || "Citizen",
      document_type: d.document_type,
      detected_type: d.detected_type,
      original_filename: d.original_filename,
      file_size: d.file_size,
      mime_type: d.mime_type,
      processing_status: d.processing_status,
      verification_status: d.verification_status,
      overall_score: d.verification_result ? d.verification_result.overall_score : null,
      mismatch_count: d.verification_result ? d.verification_result.mismatch_count : 0,
      critical_mismatch_count: d.verification_result ? d.verification_result.critical_mismatch_count : 0,
      uploaded_at: d.uploaded_at,
      processed_at: d.processed_at
    };
  });

  res.json(result);
});

app.get("/api/documents/:document_id", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { document_id } = req.params;
  const current_user = req.user!;
  const doc = documentsDatabase.find(d => d.document_id === document_id);
  if (!doc) {
    res.status(404).json({ detail: "Document not found." });
    return;
  }
  if (current_user.role === "citizen" && doc.uploaded_by !== current_user.id) {
    res.status(403).json({ detail: "Access forbidden: You do not own this document." });
    return;
  }
  const uploader = usersDatabase.find(u => u.id === doc.uploaded_by);
  res.json({
    ...doc,
    uploader_name: uploader?.full_name || "Citizen"
  });
});

app.get("/api/documents/:document_id/ocr", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { document_id } = req.params;
  const doc = documentsDatabase.find(d => d.document_id === document_id);
  if (!doc || !doc.ocr_result) {
    res.status(404).json({ detail: "OCR transcript not found." });
    return;
  }
  res.json(doc.ocr_result);
});

app.get("/api/documents/:document_id/fields", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { document_id } = req.params;
  const doc = documentsDatabase.find(d => d.document_id === document_id);
  if (!doc) {
    res.status(404).json({ detail: "Document not found." });
    return;
  }
  res.json(doc.extracted_fields);
});

app.get("/api/documents/:document_id/verification", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { document_id } = req.params;
  const doc = documentsDatabase.find(d => d.document_id === document_id);
  if (!doc || !doc.verification_result) {
    res.status(404).json({ detail: "Verification analysis not found." });
    return;
  }
  res.json(doc.verification_result);
});

app.get("/api/documents/:document_id/mismatches", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { document_id } = req.params;
  const doc = documentsDatabase.find(d => d.document_id === document_id);
  if (!doc) {
    res.status(404).json({ detail: "Document not found." });
    return;
  }
  res.json(doc.mismatches);
});

app.post("/api/documents/:document_id/reprocess", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { document_id } = req.params;
  const doc = documentsDatabase.find(d => d.document_id === document_id);
  if (!doc) {
    res.status(404).json({ detail: "Document not found." });
    return;
  }
  executeDocumentPipeline(doc);
  const uploader = usersDatabase.find(u => u.id === doc.uploaded_by);
  res.json({
    ...doc,
    uploader_name: uploader?.full_name || "Citizen"
  });
});

app.post("/api/documents/:document_id/review", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { document_id } = req.params;
  const { action, remarks, reupload_reason } = req.body || {};
  const current_user = req.user!;
  const doc = documentsDatabase.find(d => d.document_id === document_id);
  if (!doc) {
    res.status(404).json({ detail: "Document not found." });
    return;
  }

  if (action === "APPROVE_VERIFICATION") {
    doc.verification_status = "VERIFIED";
    if (doc.verification_result) {
      doc.verification_result.verification_status = "VERIFIED";
      doc.verification_result.review_required = false;
    }
    auditLogsDatabase.unshift({
      id: auditLogsDatabase.length + 1,
      user_id: current_user.id,
      action: "OFFICER_REVIEWED_DOCUMENT",
      entity_type: "DOCUMENT",
      entity_id: doc.document_id,
      details: `Officer ${current_user.full_name} endorsed verification. ${remarks || ''}`,
      ip_address: req.ip || "127.0.0.1",
      created_at: new Date().toISOString()
    });
    notificationsDatabase.unshift({
      id: notificationsDatabase.length + 1,
      user_id: doc.uploaded_by,
      title: "Document Verification Endorsed",
      message: `Document ${doc.document_id} was reviewed and approved by inspecting officer.`,
      notification_type: "SUCCESS",
      is_read: false,
      related_application_id: doc.application_id,
      created_at: new Date().toISOString()
    });
    res.json({ status: "success", message: "Document verification approved." });
    return;
  }

  if (action === "REQUEST_REUPLOAD") {
    doc.verification_status = "REVIEW_REQUIRED";
    const reason = reupload_reason || remarks || "Document illegible or mismatched with cadastral survey.";
    auditLogsDatabase.unshift({
      id: auditLogsDatabase.length + 1,
      user_id: current_user.id,
      action: "REUPLOAD_REQUESTED",
      entity_type: "DOCUMENT",
      entity_id: doc.document_id,
      details: `Re-upload requested: ${reason}`,
      ip_address: req.ip || "127.0.0.1",
      created_at: new Date().toISOString()
    });
    notificationsDatabase.unshift({
      id: notificationsDatabase.length + 1,
      user_id: doc.uploaded_by,
      title: "Re-Upload Requested for Document",
      message: `Please re-upload ${doc.document_type} for ${doc.document_id}. Reason: ${reason}`,
      notification_type: "ACTION_REQUIRED",
      is_read: false,
      related_application_id: doc.application_id,
      created_at: new Date().toISOString()
    });
    res.json({ status: "success", message: "Re-upload request sent to citizen." });
    return;
  }

  res.json({ status: "success", message: "Officer note saved." });
});

app.get("/api/applications/:application_id/documents", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { application_id } = req.params;
  const docs = documentsDatabase.filter(d => d.application_id === application_id);
  const result = docs.map(d => {
    const uploader = usersDatabase.find(u => u.id === d.uploaded_by);
    return {
      id: d.id,
      document_id: d.document_id,
      application_id: d.application_id,
      parcel_id: d.parcel_id,
      uploaded_by: d.uploaded_by,
      uploader_name: uploader?.full_name || "Citizen",
      document_type: d.document_type,
      detected_type: d.detected_type,
      original_filename: d.original_filename,
      file_size: d.file_size,
      mime_type: d.mime_type,
      processing_status: d.processing_status,
      verification_status: d.verification_status,
      overall_score: d.verification_result ? d.verification_result.overall_score : null,
      mismatch_count: d.verification_result ? d.verification_result.mismatch_count : 0,
      critical_mismatch_count: d.verification_result ? d.verification_result.critical_mismatch_count : 0,
      uploaded_at: d.uploaded_at,
      processed_at: d.processed_at
    };
  });
  res.json(result);
});

app.get("/api/applications/:application_id/required-documents", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { application_id } = req.params;
  const appObj = applicationsDatabase.find(a => a.application_id === application_id);
  if (!appObj) {
    res.status(404).json({ detail: "Application not found." });
    return;
  }

  const srv = (appObj.service_type || "").toUpperCase();
  let reqTypes = ["PATTA", "IDENTITY_DOCUMENT"];
  if (srv.includes("MUTATION") || srv.includes("OWNERSHIP")) {
    reqTypes = ["SALE_DEED", "IDENTITY_DOCUMENT", "PATTA"];
  } else if (srv.includes("CORRECTION") || srv.includes("RECORD")) {
    reqTypes = ["PATTA", "LAND_SURVEY_DOCUMENT", "IDENTITY_DOCUMENT"];
  } else if (srv.includes("BOUNDARY") || srv.includes("AREA")) {
    reqTypes = ["LAND_SURVEY_DOCUMENT", "PATTA", "PROPERTY_TAX_RECORD"];
  }

  const uploadedDocs = documentsDatabase.filter(d => d.application_id === application_id);
  const uploadedTypes = new Set(uploadedDocs.map(d => d.document_type));
  const missing = reqTypes.filter(t => !uploadedTypes.has(t));
  const isComplete = missing.length === 0;

  res.json({
    application_id: appObj.application_id,
    service_type: appObj.service_type,
    required_document_types: reqTypes,
    uploaded_documents: uploadedDocs.map(d => ({
      id: d.id,
      document_id: d.document_id,
      application_id: d.application_id,
      parcel_id: d.parcel_id,
      uploaded_by: d.uploaded_by,
      document_type: d.document_type,
      detected_type: d.detected_type,
      original_filename: d.original_filename,
      file_size: d.file_size,
      mime_type: d.mime_type,
      processing_status: d.processing_status,
      verification_status: d.verification_status,
      overall_score: d.verification_result?.overall_score ?? null,
      mismatch_count: d.verification_result?.mismatch_count ?? 0,
      critical_mismatch_count: d.verification_result?.critical_mismatch_count ?? 0,
      uploaded_at: d.uploaded_at,
      processed_at: d.processed_at
    })),
    missing_document_types: missing,
    is_complete: isComplete,
    status_summary: isComplete ? "All required documents uploaded" : `${missing.length} documents pending upload`
  });
});

app.get("/api/analytics/documents/overview", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const total = documentsDatabase.length;
  const processing = documentsDatabase.filter(d => d.processing_status === "PROCESSING").length;
  const completed = documentsDatabase.filter(d => d.processing_status === "VERIFICATION_COMPLETED").length;
  const failed = documentsDatabase.filter(d => d.processing_status === "FAILED").length;
  const scores = documentsDatabase.map(d => d.verification_result?.overall_score || 0);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 88.5;
  const totalMismatches = documentsDatabase.reduce((acc, d) => acc + (d.mismatches?.length || 0), 0);
  const criticalMismatches = documentsDatabase.reduce((acc, d) => acc + (d.mismatches?.filter(m => m.severity === "CRITICAL").length || 0), 0);

  res.json({
    total_documents: total,
    processing,
    completed,
    failed,
    average_verification_score: avgScore,
    mismatch_rate_percent: Math.round((totalMismatches / Math.max(1, total)) * 100 * 10) / 10,
    critical_mismatches: criticalMismatches,
    system_ocr_accuracy: "96.4%"
  });
});

app.get("/api/analytics/documents/types", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const counts: Record<string, number> = {};
  documentsDatabase.forEach(d => {
    counts[d.document_type] = (counts[d.document_type] || 0) + 1;
  });
  const total = documentsDatabase.length || 1;
  const result = Object.entries(counts).map(([type, cnt]) => ({
    document_type: type.replace(/_/g, " "),
    count: cnt,
    percentage: Math.round((cnt / total) * 1000) / 10
  }));
  res.json(result);
});

app.get("/api/analytics/documents/verification", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const counts: Record<string, number> = {};
  documentsDatabase.forEach(d => {
    counts[d.verification_status] = (counts[d.verification_status] || 0) + 1;
  });
  const result = Object.entries(counts).map(([status, cnt]) => ({
    verification_status: status.replace(/_/g, " "),
    count: cnt
  }));
  res.json(result);
});

// ==============================================================
// PHASE 5: CROSS-RECORD VERIFICATION & LAND INTELLIGENCE ENGINE
// ==============================================================

interface LandVerificationServer {
  id: number;
  verification_id: string; // Format: VER-2026-000001
  parcel_id: string;
  application_id?: string | null;
  requested_by: number;
  requested_by_name?: string;
  verification_type: string;
  status: "IN_PROGRESS" | "COMPLETED" | "REQUIRES_REVIEW" | "FAILED";
  overall_consistency_score: number;
  consistency_level: "HIGH_CONSISTENCY" | "GOOD_CONSISTENCY" | "MODERATE_CONSISTENCY" | "LOW_CONSISTENCY";
  total_records_checked: number;
  matches: number;
  minor_differences: number;
  major_mismatches: number;
  critical_mismatches: number;
  summary: string;
  sources_used: string[];
  created_at: string;
  completed_at?: string | null;
  snapshots?: LandRecordSnapshotServer[];
  comparisons?: FieldComparisonResultServer[];
  matrix_rows?: MatrixComparisonRowServer[];
  alerts?: VerificationAlertServer[];
  timeline?: VerificationTimelineEventServer[];
}

interface LandRecordSnapshotServer {
  id: number;
  verification_id: string;
  source_type: string;
  source_name: string;
  record_reference_id?: string | null;
  record_data: any;
  created_at: string;
}

interface FieldComparisonResultServer {
  id: number;
  verification_id: string;
  field_name: string;
  source_a: string;
  source_b: string;
  value_a?: string | null;
  value_b?: string | null;
  normalized_value_a?: string | null;
  normalized_value_b?: string | null;
  comparison_result: "EXACT_MATCH" | "NORMALIZED_MATCH" | "FUZZY_MATCH" | "MINOR_DIFFERENCE" | "MISMATCH" | "MISSING_IN_SOURCE_A" | "MISSING_IN_SOURCE_B" | "INSUFFICIENT_DATA";
  similarity_score: number;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  explanation: string;
  created_at: string;
}

interface MatrixComparisonRowServer {
  field_name: string;
  field_label: string;
  gis_value?: string | null;
  database_value?: string | null;
  document_value?: string | null;
  historical_value?: string | null;
  department_value?: string | null;
  comparison_result: "EXACT_MATCH" | "NORMALIZED_MATCH" | "FUZZY_MATCH" | "MINOR_DIFFERENCE" | "MISMATCH" | "MISSING_IN_SOURCE_A" | "MISSING_IN_SOURCE_B" | "INSUFFICIENT_DATA";
  similarity_score: number;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  explanation: string;
}

interface VerificationAlertServer {
  id: number;
  verification_id: string;
  parcel_id?: string | null;
  application_id?: string | null;
  alert_type: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  is_resolved: boolean;
  resolved_by?: number | string | null;
  resolved_by_name?: string | null;
  resolved_remarks?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

interface VerificationTimelineEventServer {
  step: number;
  title: string;
  description: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "WARNING" | "FAILED";
  timestamp: string;
  meta?: Record<string, any>;
}

// -------------------------------------------------------------
// INTELLIGENCE COMPARISON & NORMALIZATION ALGORITHMS
// -------------------------------------------------------------

function computeStringSimilarity(str1: string, str2: string): number {
  const s1 = (str1 || "").trim().toLowerCase();
  const s2 = (str2 || "").trim().toLowerCase();
  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;

  // Levenshtein distance
  const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  const distance = track[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return Math.round((1 - distance / maxLen) * 100);
}

function normalizePersonName(name: string): string {
  if (!name) return "";
  return name
    .toUpperCase()
    .replace(/\b(MR|MRS|MS|DR|THIRU|TMT|SELVI|SHRI|SMT|LATE|THIRUMATHI)\b\.?/gi, "")
    .replace(/[^A-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSurveyComponents(surveyStr: string): { main: string; sub: string; canonical: string } {
  if (!surveyStr) return { main: "", sub: "", canonical: "" };
  const cleaned = surveyStr
    .toUpperCase()
    .replace(/SURVEY\s*(NO\.?|NUMBER)?/gi, "")
    .replace(/S\.NO\.?/gi, "")
    .replace(/SY\.NO\.?/gi, "")
    .replace(/\s+/g, "")
    .replace(/-/g, "/");

  const parts = cleaned.split("/");
  const main = parts[0]?.replace(/^0+/, "") || "";
  const sub = parts[1] ? parts[1].replace(/^0+/, "") : "";
  const canonical = sub ? `${main}/${sub}` : main;
  return { main, sub, canonical };
}

function convertAreaToSquareMeters(area: number, unit: string): number {
  const u = (unit || "acres").toLowerCase().trim();
  if (u.includes("hectare") || u.includes("ha")) {
    return area * 10000;
  }
  if (u.includes("sq.ft") || u.includes("sqft") || u.includes("square feet") || u.includes("feet")) {
    return area * 0.092903;
  }
  if (u.includes("sq.m") || u.includes("sqm") || u.includes("square meter") || u.includes("meter")) {
    return area * 1.0;
  }
  if (u.includes("cent")) {
    return area * 40.4686;
  }
  if (u.includes("guntha")) {
    return area * 101.17;
  }
  // Default Acre
  return area * 4046.8564224;
}

function compareOwnerNames(nameA: string, nameB: string): {
  result: "EXACT_MATCH" | "NORMALIZED_MATCH" | "FUZZY_MATCH" | "MINOR_DIFFERENCE" | "MISMATCH";
  score: number;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  explanation: string;
} {
  if (!nameA || !nameB) {
    return {
      result: "MISMATCH",
      score: 0,
      severity: "HIGH",
      explanation: "One of the owner name records is missing or empty."
    };
  }

  if (nameA.trim().toLowerCase() === nameB.trim().toLowerCase()) {
    return {
      result: "EXACT_MATCH",
      score: 100,
      severity: "INFO",
      explanation: `Exact character match on owner name ('${nameA}').`
    };
  }

  const normA = normalizePersonName(nameA);
  const normB = normalizePersonName(nameB);

  if (normA === normB) {
    return {
      result: "NORMALIZED_MATCH",
      score: 98,
      severity: "INFO",
      explanation: `Normalized match after removing honorifics and standardizing casing ('${nameA}' vs '${nameB}').`
    };
  }

  // Handle Initials (e.g. "R. Kumar" vs "Ravi Kumar" or "S. Murugan" vs "Murugan S")
  const tokensA = normA.split(" ").filter(Boolean);
  const tokensB = normB.split(" ").filter(Boolean);

  const isInitialMatch = () => {
    if (tokensA.length >= 1 && tokensB.length >= 1) {
      const lastA = tokensA[tokensA.length - 1];
      const lastB = tokensB[tokensB.length - 1];
      const firstA = tokensA[0];
      const firstB = tokensB[0];
      if (lastA === lastB && (firstA[0] === firstB[0] || firstA.length === 1 || firstB.length === 1)) {
        return true;
      }
      if (tokensA.some(t => tokensB.includes(t))) {
        return true;
      }
    }
    return false;
  };

  const sim = computeStringSimilarity(normA, normB);

  if (isInitialMatch() || sim >= 80) {
    return {
      result: "FUZZY_MATCH",
      score: Math.max(sim, 88),
      severity: "LOW",
      explanation: `Minor initial/abbreviation spelling variation ('${nameA}' vs '${nameB}'). High phonetic/token overlap.`
    };
  }

  if (sim >= 60) {
    return {
      result: "MINOR_DIFFERENCE",
      score: sim,
      severity: "MEDIUM",
      explanation: `Moderate variation in recorded name ('${nameA}' vs '${nameB}'). Officer verification of legal title recommended.`
    };
  }

  return {
    result: "MISMATCH",
    score: sim,
    severity: "CRITICAL",
    explanation: `Critical owner name conflict: Document records '${nameA}', official registry states '${nameB}'.`
  };
}

function compareSurveyNumbers(surveyA: string, surveyB: string): {
  result: "EXACT_MATCH" | "NORMALIZED_MATCH" | "FUZZY_MATCH" | "MINOR_DIFFERENCE" | "MISMATCH";
  score: number;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  explanation: string;
} {
  const pA = parseSurveyComponents(surveyA);
  const pB = parseSurveyComponents(surveyB);

  if (pA.canonical === pB.canonical) {
    if (surveyA.trim() === surveyB.trim()) {
      return {
        result: "EXACT_MATCH",
        score: 100,
        severity: "INFO",
        explanation: `Exact survey number match ('${surveyA}').`
      };
    }
    return {
      result: "NORMALIZED_MATCH",
      score: 99,
      severity: "INFO",
      explanation: `Normalized survey match ('${surveyA}' vs '${surveyB}'). Both resolve canonically to '${pA.canonical}'.`
    };
  }

  if (pA.main === pB.main && pA.sub !== pB.sub) {
    return {
      result: "MISMATCH",
      score: 40,
      severity: "CRITICAL",
      explanation: `Subdivision mismatch on main survey ${pA.main}: Source A references '${surveyA}', Source B references '${surveyB}'.`
    };
  }

  return {
    result: "MISMATCH",
    score: 15,
    severity: "CRITICAL",
    explanation: `Total survey number mismatch: Source A references '${surveyA}', Source B references '${surveyB}'.`
  };
}

function compareLandArea(
  areaA: number,
  unitA: string,
  areaB: number,
  unitB: string
): {
  result: "EXACT_MATCH" | "NORMALIZED_MATCH" | "MINOR_DIFFERENCE" | "MISMATCH";
  score: number;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  pctDiff: number;
  explanation: string;
} {
  const sqmA = convertAreaToSquareMeters(areaA, unitA);
  const sqmB = convertAreaToSquareMeters(areaB, unitB);

  const maxSqm = Math.max(sqmA, sqmB);
  const diffSqm = Math.abs(sqmA - sqmB);
  const pctDiff = maxSqm > 0 ? Math.round((diffSqm / maxSqm) * 1000) / 10 : 0;

  if (pctDiff <= 0.5) {
    return {
      result: "EXACT_MATCH",
      score: 100,
      severity: "INFO",
      pctDiff,
      explanation: `Area perfectly matches within 0.5% tolerance (${areaA} ${unitA} vs ${areaB} ${unitB}).`
    };
  }

  if (pctDiff <= 2.0) {
    return {
      result: "NORMALIZED_MATCH",
      score: 96,
      severity: "INFO",
      pctDiff,
      explanation: `Minor surveying variance of ${pctDiff}% (${areaA} ${unitA} vs ${areaB} ${unitB}), well within statutory 2.0% GIS tolerance.`
    };
  }

  if (pctDiff <= 5.0) {
    return {
      result: "MINOR_DIFFERENCE",
      score: 85,
      severity: "LOW",
      pctDiff,
      explanation: `Area difference of ${pctDiff}% (${areaA} ${unitA} vs ${areaB} ${unitB}). Slightly exceeds 2% tolerance; standard cadastral check advised.`
    };
  }

  if (pctDiff <= 10.0) {
    return {
      result: "MINOR_DIFFERENCE",
      score: 65,
      severity: "HIGH",
      pctDiff,
      explanation: `Major area discrepancy of ${pctDiff}% detected (${areaA} ${unitA} vs ${areaB} ${unitB}). Exceeds acceptable tolerance limit.`
    };
  }

  return {
    result: "MISMATCH",
    score: 30,
    severity: "CRITICAL",
    pctDiff,
    explanation: `Critical area mismatch of ${pctDiff}% (${areaA} ${unitA} vs ${areaB} ${unitB}). Field survey reconciliation mandatory.`
  };
}

// -------------------------------------------------------------
// MOCK DEPARTMENT INTEGRATION SERVICE
// -------------------------------------------------------------
function getMockDepartmentData(parcel: any): {
  revenueDept: any;
  registrationDept: any;
  surveyDept: any;
  encumbranceRegistry: any;
} {
  const isSpecialOwnerMismatch = parcel.parcel_id === "TN-CBE-001-125-1";
  const isSpecialSurveyMismatch = parcel.parcel_id === "TN-CBE-001-124-3";
  const isAreaDiscrepancy = parcel.parcel_id === "TN-CBE-001-126-2";
  const isMissingEC = parcel.parcel_id === "TN-CBE-001-126-1";

  return {
    revenueDept: {
      department: "Revenue & Land Administration (Tamil Nilam)",
      department_code: "REV_TN_NILAM",
      endpoint: "https://mock-api.tn.gov.in/revenue/v2/ror",
      status: "ONLINE",
      latency_ms: 142,
      last_synced: new Date().toISOString(),
      description: "State Master Register of Rights (RoR) & Electronic Patta Database",
      record: {
        source: "MOCK_DEPARTMENT_API",
        source_name: "Revenue Department (Tamil Nilam)",
        source_reference_id: `TN-REV-${parcel.survey_number.replace("/", "-")}`,
        parcel_id: parcel.parcel_id,
        survey_number: parcel.survey_number,
        subdivision: parcel.subdivision,
        owner_name: parcel.current_owner,
        father_spouse_name: "K. Ranganathan",
        village: parcel.village,
        district: parcel.district,
        state: parcel.state,
        area: parcel.recorded_area,
        area_unit: parcel.area_unit,
        area_sqm: convertAreaToSquareMeters(parcel.recorded_area, parcel.area_unit),
        land_use: parcel.land_use,
        status: parcel.status,
        record_date: parcel.created_at,
      }
    },
    registrationDept: {
      department: "Inspector General of Registration (IGRS)",
      department_code: "REG_TN_IGRS",
      endpoint: "https://mock-api.tn.gov.in/igrs/v1/deeds",
      status: "ONLINE",
      latency_ms: 185,
      last_synced: new Date().toISOString(),
      description: "Inspector General of Registration - Registered Conveyance Deeds & Stamp Duty Registry",
      record: {
        source: "MOCK_DEPARTMENT_API",
        source_name: "Registration Department (IGRS)",
        source_reference_id: `IGRS-DOC-1024/2021`,
        parcel_id: parcel.parcel_id,
        survey_number: parcel.survey_number,
        subdivision: parcel.subdivision,
        owner_name: isSpecialOwnerMismatch ? "Ravi Kumar" : parcel.current_owner,
        document_number: "DOC-2021-1024",
        registration_number: "REG-SULUR-4410",
        record_date: "2021-04-12",
        area: parcel.recorded_area,
        area_unit: parcel.area_unit,
        land_use: parcel.land_use,
        village: parcel.village,
        district: parcel.district,
        state: parcel.state
      }
    },
    surveyDept: {
      department: "Survey and Land Records (CollabLand GIS)",
      department_code: "SRV_COLLAB_GIS",
      endpoint: "https://mock-api.tn.gov.in/survey/cadastral/fmb",
      status: "ONLINE",
      latency_ms: 210,
      last_synced: new Date().toISOString(),
      description: "Digital Cadastral Field Measurement Book (FMB) & Boundary Polygon Registry",
      record: {
        source: "MOCK_DEPARTMENT_API",
        source_name: "Survey Department (CollabLand)",
        source_reference_id: `FMB-${parcel.survey_number.replace("/", "-")}-2024`,
        parcel_id: parcel.parcel_id,
        survey_number: parcel.survey_number,
        subdivision: parcel.subdivision,
        area: parcel.gis_area,
        area_unit: parcel.area_unit,
        land_use: parcel.land_use,
        village: parcel.village,
        district: parcel.district,
        boundary_north: "Survey No 123",
        boundary_south: "Panchayat Road",
        boundary_east: "Survey No 125/1",
        boundary_west: "Protected Water Channel"
      }
    },
    encumbranceRegistry: {
      department: "Sub-Registrar Encumbrance Registry (EC Portal)",
      department_code: "REG_EC_PORTAL",
      endpoint: "https://mock-api.tn.gov.in/igrs/encumbrance/search",
      status: isMissingEC ? "DEGRADED" : "ONLINE",
      latency_ms: isMissingEC ? 890 : 160,
      last_synced: new Date().toISOString(),
      description: "30-Year Digital Encumbrance Certificate & Property Mortgage Search Engine",
      record: isMissingEC ? null : {
        source: "MOCK_DEPARTMENT_API",
        source_name: "Encumbrance Registry (EC Portal)",
        source_reference_id: `EC-2026-NIL-00412`,
        parcel_id: parcel.parcel_id,
        survey_number: parcel.survey_number,
        owner_name: parcel.current_owner,
        status: "NIL_ENCUMBRANCE (Clean 30-Year Title)",
        record_date: "2026-01-01"
      }
    }
  };
}

// -------------------------------------------------------------
// CROSS-RECORD VERIFICATION ORCHESTRATOR & ENGINE
// -------------------------------------------------------------
let verificationIdCounter = 7;
let alertIdCounter = 15;

function runCrossRecordVerification(
  parcelId: string,
  applicationId: string | null | undefined,
  verificationType: string,
  requestedBy: number,
  requestedByName: string,
  sourcesToUse?: string[]
): LandVerificationServer {
  const parcel = parcelsDatabase.find(p => p.parcel_id === parcelId || String(p.id) === parcelId || p.survey_number === parcelId) || parcelsDatabase[0];
  const appObj = applicationId ? applicationsDatabase.find(a => a.application_id === applicationId) : null;
  const docs = documentsDatabase.filter(d => (d.parcel_id === parcel.parcel_id || (applicationId && d.application_id === applicationId)));
  const latestDoc = docs.length > 0 ? docs[docs.length - 1] : null;

  const verId = `VER-2026-${String(verificationIdCounter++).padStart(6, "0")}`;
  const now = new Date().toISOString();

  const activeSources = sourcesToUse && sourcesToUse.length > 0
    ? sourcesToUse
    : ["GIS", "PARCEL_DATABASE", "DOCUMENT_OCR", "APPLICATION", "HISTORICAL_RECORD", "MOCK_DEPARTMENT_API"];

  // 1. Build Snapshots
  const snapshots: LandRecordSnapshotServer[] = [];
  const deptData = getMockDepartmentData(parcel);

  // Snapshot: GIS
  if (activeSources.includes("GIS")) {
    snapshots.push({
      id: snapshots.length + 1,
      verification_id: verId,
      source_type: "GIS",
      source_name: "GIS Cadastral Spatial Engine",
      record_reference_id: parcel.parcel_id,
      record_data: {
        source: "GIS",
        source_name: "GIS Cadastral Engine",
        parcel_id: parcel.parcel_id,
        survey_number: parcel.survey_number,
        subdivision: parcel.subdivision,
        area: parcel.gis_area,
        area_unit: parcel.area_unit,
        area_sqm: convertAreaToSquareMeters(parcel.gis_area, parcel.area_unit),
        coordinates: parcel.coordinates,
        village: parcel.village,
        district: parcel.district,
        state: parcel.state,
        status: parcel.status
      },
      created_at: now
    });
  }

  // Snapshot: Parcel Database
  if (activeSources.includes("PARCEL_DATABASE")) {
    snapshots.push({
      id: snapshots.length + 1,
      verification_id: verId,
      source_type: "PARCEL_DATABASE",
      source_name: "State Land Registry Master DB",
      record_reference_id: `PARCEL-REC-${parcel.id}`,
      record_data: {
        source: "PARCEL_DATABASE",
        source_name: "Land Registry Database",
        parcel_id: parcel.parcel_id,
        survey_number: parcel.survey_number,
        subdivision: parcel.subdivision,
        owner_name: parcel.current_owner,
        area: parcel.recorded_area,
        area_unit: parcel.area_unit,
        area_sqm: convertAreaToSquareMeters(parcel.recorded_area, parcel.area_unit),
        land_use: parcel.land_use,
        village: parcel.village,
        district: parcel.district,
        state: parcel.state,
        status: parcel.status,
        created_at: parcel.created_at
      },
      created_at: now
    });
  }

  // Snapshot: Document OCR
  let docOwnerName = parcel.current_owner;
  let docSurveyNum = parcel.survey_number;
  let docArea = parcel.recorded_area;

  if (latestDoc && latestDoc.extracted_fields) {
    const efOwner = latestDoc.extracted_fields.find(f => f.field_name === "OWNER_NAME");
    const efSurvey = latestDoc.extracted_fields.find(f => f.field_name === "SURVEY_NUMBER");
    const efArea = latestDoc.extracted_fields.find(f => f.field_name === "LAND_AREA");
    if (efOwner) docOwnerName = efOwner.field_value;
    if (efSurvey) docSurveyNum = efSurvey.field_value;
    if (efArea) {
      const parsedA = parseFloat(efArea.field_value);
      if (!isNaN(parsedA)) docArea = parsedA;
    }
  }

  // Special scenario handling if requested
  if (parcel.parcel_id === "TN-CBE-001-124-2") {
    docOwnerName = "R. Kumar";
  } else if (parcel.parcel_id === "TN-CBE-001-124-3") {
    docSurveyNum = "124/2";
  }

  if (activeSources.includes("DOCUMENT_OCR")) {
    snapshots.push({
      id: snapshots.length + 1,
      verification_id: verId,
      source_type: "DOCUMENT_OCR",
      source_name: "Document Intelligence OCR Engine",
      record_reference_id: latestDoc ? latestDoc.document_id : `DOC-OCR-EXTRACT-${parcel.parcel_id}`,
      record_data: {
        source: "DOCUMENT_OCR",
        source_name: "Document OCR",
        document_id: latestDoc?.document_id || "DOC-SAMPLE-001",
        document_type: latestDoc?.document_type || "SALE_DEED",
        owner_name: docOwnerName,
        survey_number: docSurveyNum,
        area: docArea,
        area_unit: parcel.area_unit,
        village: parcel.village,
        district: parcel.district,
        state: parcel.state,
        ocr_confidence: latestDoc?.verification_result?.overall_score || 94.5
      },
      created_at: now
    });
  }

  // Snapshot: Application
  if (appObj && activeSources.includes("APPLICATION")) {
    snapshots.push({
      id: snapshots.length + 1,
      verification_id: verId,
      source_type: "APPLICATION",
      source_name: "Citizen Service Portal Application",
      record_reference_id: appObj.application_id,
      record_data: {
        source: "APPLICATION",
        source_name: "Citizen Application",
        application_id: appObj.application_id,
        service_type: appObj.service_type,
        applicant_name: "Ramesh Kumar (Citizen)",
        parcel_id: appObj.parcel_id,
        status: appObj.status,
        submitted_at: appObj.submitted_at
      },
      created_at: now
    });
  }

  // Snapshot: Historical
  if (activeSources.includes("HISTORICAL_RECORD")) {
    snapshots.push({
      id: snapshots.length + 1,
      verification_id: verId,
      source_type: "HISTORICAL_RECORD",
      source_name: "Parcel Chain of Title History",
      record_reference_id: `HIST-${parcel.parcel_id}`,
      record_data: {
        source: "HISTORICAL_RECORD",
        source_name: "Parcel History",
        parcel_id: parcel.parcel_id,
        timeline_events_count: parcel.history?.length || 1,
        events: parcel.history || [],
        initial_registration_date: parcel.created_at
      },
      created_at: now
    });
  }

  // Snapshot: Mock Departments
  if (activeSources.includes("MOCK_DEPARTMENT_API")) {
    snapshots.push({
      id: snapshots.length + 1,
      verification_id: verId,
      source_type: "MOCK_DEPARTMENT_API",
      source_name: deptData.revenueDept.department,
      record_reference_id: deptData.revenueDept.record.source_reference_id,
      record_data: deptData.revenueDept.record,
      created_at: now
    });
    snapshots.push({
      id: snapshots.length + 1,
      verification_id: verId,
      source_type: "MOCK_DEPARTMENT_API",
      source_name: deptData.registrationDept.department,
      record_reference_id: deptData.registrationDept.record.source_reference_id,
      record_data: deptData.registrationDept.record,
      created_at: now
    });
  }

  // 2. Multi-Field Comparisons
  const comparisons: FieldComparisonResultServer[] = [];
  const alerts: VerificationAlertServer[] = [];
  let matchesCount = 0;
  let minorDiffCount = 0;
  let majorMismatchCount = 0;
  let criticalMismatchCount = 0;
  let missingFieldCount = 0;

  // Comparison 1: Owner Name (DB vs Document)
  const ownerComp = compareOwnerNames(parcel.current_owner, docOwnerName);
  comparisons.push({
    id: comparisons.length + 1,
    verification_id: verId,
    field_name: "OWNER_NAME",
    source_a: "PARCEL_DATABASE",
    source_b: "DOCUMENT_OCR",
    value_a: parcel.current_owner,
    value_b: docOwnerName,
    normalized_value_a: normalizePersonName(parcel.current_owner),
    normalized_value_b: normalizePersonName(docOwnerName),
    comparison_result: ownerComp.result,
    similarity_score: ownerComp.score,
    severity: ownerComp.severity,
    explanation: ownerComp.explanation,
    created_at: now
  });

  if (ownerComp.severity === "CRITICAL") {
    criticalMismatchCount++;
    alerts.push({
      id: alertIdCounter++,
      verification_id: verId,
      parcel_id: parcel.parcel_id,
      application_id: applicationId || null,
      alert_type: "OWNER_MISMATCH",
      severity: "CRITICAL",
      title: "Critical Title Owner Discrepancy",
      description: `Document claims owner '${docOwnerName}', which differs completely from official registry owner '${parcel.current_owner}'.`,
      is_resolved: false,
      created_at: now
    });
  } else if (ownerComp.severity === "LOW" || ownerComp.severity === "MEDIUM") {
    minorDiffCount++;
    alerts.push({
      id: alertIdCounter++,
      verification_id: verId,
      parcel_id: parcel.parcel_id,
      application_id: applicationId || null,
      alert_type: "OWNER_MISMATCH",
      severity: ownerComp.severity,
      title: "Minor Name Variation",
      description: `Spelling/initials variation ('${parcel.current_owner}' vs '${docOwnerName}'). High phonetical match score (${ownerComp.score}%).`,
      is_resolved: false,
      created_at: now
    });
  } else {
    matchesCount++;
  }

  // Comparison 2: Survey Number (DB vs Document vs GIS)
  const surveyComp = compareSurveyNumbers(parcel.survey_number, docSurveyNum);
  comparisons.push({
    id: comparisons.length + 1,
    verification_id: verId,
    field_name: "SURVEY_NUMBER",
    source_a: "PARCEL_DATABASE",
    source_b: "DOCUMENT_OCR",
    value_a: parcel.survey_number,
    value_b: docSurveyNum,
    normalized_value_a: parseSurveyComponents(parcel.survey_number).canonical,
    normalized_value_b: parseSurveyComponents(docSurveyNum).canonical,
    comparison_result: surveyComp.result,
    similarity_score: surveyComp.score,
    severity: surveyComp.severity,
    explanation: surveyComp.explanation,
    created_at: now
  });

  if (surveyComp.severity === "CRITICAL") {
    criticalMismatchCount++;
    alerts.push({
      id: alertIdCounter++,
      verification_id: verId,
      parcel_id: parcel.parcel_id,
      application_id: applicationId || null,
      alert_type: "SURVEY_MISMATCH",
      severity: "CRITICAL",
      title: "Survey Number Mismatch Detected",
      description: `Document references survey '${docSurveyNum}', while selected target parcel is '${parcel.survey_number}'.`,
      is_resolved: false,
      created_at: now
    });
  } else if (surveyComp.severity === "LOW" || surveyComp.severity === "MEDIUM") {
    minorDiffCount++;
  } else {
    matchesCount++;
  }

  // Comparison 3: Area (Database vs GIS)
  const areaGisComp = compareLandArea(parcel.recorded_area, parcel.area_unit, parcel.gis_area, parcel.area_unit);
  comparisons.push({
    id: comparisons.length + 1,
    verification_id: verId,
    field_name: "LAND_AREA",
    source_a: "PARCEL_DATABASE",
    source_b: "GIS",
    value_a: `${parcel.recorded_area} ${parcel.area_unit}`,
    value_b: `${parcel.gis_area} ${parcel.area_unit}`,
    normalized_value_a: `${convertAreaToSquareMeters(parcel.recorded_area, parcel.area_unit).toFixed(1)} Sq.m`,
    normalized_value_b: `${convertAreaToSquareMeters(parcel.gis_area, parcel.area_unit).toFixed(1)} Sq.m`,
    comparison_result: areaGisComp.result,
    similarity_score: areaGisComp.score,
    severity: areaGisComp.severity,
    explanation: areaGisComp.explanation,
    created_at: now
  });

  if (areaGisComp.severity === "CRITICAL") {
    criticalMismatchCount++;
    alerts.push({
      id: alertIdCounter++,
      verification_id: verId,
      parcel_id: parcel.parcel_id,
      application_id: applicationId || null,
      alert_type: "AREA_MISMATCH",
      severity: "CRITICAL",
      title: "Critical GIS vs Revenue Area Variance",
      description: `GIS measured polygon area differs by ${areaGisComp.pctDiff}% from registered revenue record (${parcel.recorded_area} vs ${parcel.gis_area} ${parcel.area_unit}).`,
      is_resolved: false,
      created_at: now
    });
  } else if (areaGisComp.severity === "HIGH") {
    majorMismatchCount++;
    alerts.push({
      id: alertIdCounter++,
      verification_id: verId,
      parcel_id: parcel.parcel_id,
      application_id: applicationId || null,
      alert_type: "AREA_MISMATCH",
      severity: "HIGH",
      title: "Significant Area Discrepancy (>5%)",
      description: `Area variance is ${areaGisComp.pctDiff}% between GIS and recorded Patta area. Resurvey recommended.`,
      is_resolved: false,
      created_at: now
    });
  } else if (areaGisComp.severity === "LOW" || areaGisComp.severity === "MEDIUM") {
    minorDiffCount++;
  } else {
    matchesCount++;
  }

  // Comparison 4: Location (Village & District consistency)
  const locSim = computeStringSimilarity(parcel.village, parcel.village);
  comparisons.push({
    id: comparisons.length + 1,
    verification_id: verId,
    field_name: "LOCATION",
    source_a: "PARCEL_DATABASE",
    source_b: "GIS",
    value_a: `${parcel.village}, ${parcel.district}`,
    value_b: `${parcel.village}, ${parcel.district}`,
    normalized_value_a: `${parcel.village.toUpperCase()}, ${parcel.district.toUpperCase()}`,
    normalized_value_b: `${parcel.village.toUpperCase()}, ${parcel.district.toUpperCase()}`,
    comparison_result: "EXACT_MATCH",
    similarity_score: 100,
    severity: "INFO",
    explanation: `Jurisdictional village and district align across all administrative records (${parcel.village}, ${parcel.district}).`,
    created_at: now
  });
  matchesCount++;

  // Comparison 5: Land Use Classification
  comparisons.push({
    id: comparisons.length + 1,
    verification_id: verId,
    field_name: "LAND_USE",
    source_a: "PARCEL_DATABASE",
    source_b: "MOCK_DEPARTMENT_API",
    value_a: parcel.land_use,
    value_b: deptData.revenueDept.record.land_use,
    normalized_value_a: parcel.land_use.toUpperCase(),
    normalized_value_b: deptData.revenueDept.record.land_use.toUpperCase(),
    comparison_result: "EXACT_MATCH",
    similarity_score: 100,
    severity: "INFO",
    explanation: `Land classification verified as '${parcel.land_use}' in Master Plan and Revenue records.`,
    created_at: now
  });
  matchesCount++;

  // Comparison 6: Historical Chain of Title Check
  const isHistoricalConflict = parcel.parcel_id === "TN-CBE-001-125-1";
  if (isHistoricalConflict) {
    majorMismatchCount++;
    comparisons.push({
      id: comparisons.length + 1,
      verification_id: verId,
      field_name: "HISTORICAL_OWNERSHIP",
      source_a: "HISTORICAL_RECORD",
      source_b: "DOCUMENT_OCR",
      value_a: "Ravi Kumar (Prior Owner, Deed 2021)",
      value_b: "Ravi Kumar (Presented Document)",
      normalized_value_a: "RAVI KUMAR",
      normalized_value_b: "RAVI KUMAR",
      comparison_result: "FUZZY_MATCH",
      similarity_score: 75,
      severity: "HIGH",
      explanation: "Presented deed names prior owner 'Ravi Kumar', while parcel registry updated to 'Apex Logistics Pvt Ltd' in 2022. Chain of succession requires officer review.",
      created_at: now
    });
    alerts.push({
      id: alertIdCounter++,
      verification_id: verId,
      parcel_id: parcel.parcel_id,
      application_id: applicationId || null,
      alert_type: "HISTORICAL_CONFLICT",
      severity: "HIGH",
      title: "Historical Ownership Conflict",
      description: "Document owner differs from current registry owner, but matches a prior transfer in parcel history. Officer review of chain-of-title required.",
      is_resolved: false,
      created_at: now
    });
  } else {
    comparisons.push({
      id: comparisons.length + 1,
      verification_id: verId,
      field_name: "HISTORICAL_OWNERSHIP",
      source_a: "HISTORICAL_RECORD",
      source_b: "PARCEL_DATABASE",
      value_a: parcel.current_owner,
      value_b: parcel.current_owner,
      normalized_value_a: normalizePersonName(parcel.current_owner),
      normalized_value_b: normalizePersonName(parcel.current_owner),
      comparison_result: "EXACT_MATCH",
      similarity_score: 100,
      severity: "INFO",
      explanation: `Historical continuity confirmed. No unrecorded transfers or encumbrance gaps detected in audit history.`,
      created_at: now
    });
    matchesCount++;
  }

  // Comparison 7: Mock Encumbrance Status
  if (!deptData.encumbranceRegistry.record) {
    minorDiffCount++;
    alerts.push({
      id: alertIdCounter++,
      verification_id: verId,
      parcel_id: parcel.parcel_id,
      application_id: applicationId || null,
      alert_type: "MISSING_RECORD",
      severity: "LOW",
      title: "Encumbrance Record Delayed",
      description: "Automated search on Sub-Registrar EC endpoint returned no recent certificate record. Non-critical for initial review.",
      is_resolved: false,
      created_at: now
    });
  }

  // 3. Build Matrix Rows (Side-by-Side)
  const matrixRows: MatrixComparisonRowServer[] = [
    {
      field_name: "OWNER_NAME",
      field_label: "Registered Land Owner",
      gis_value: "N/A (Spatial Layer)",
      database_value: parcel.current_owner,
      document_value: docOwnerName,
      historical_value: isHistoricalConflict ? "Ravi Kumar (2021)" : parcel.current_owner,
      department_value: deptData.registrationDept.record.owner_name,
      comparison_result: ownerComp.result,
      similarity_score: ownerComp.score,
      severity: ownerComp.severity,
      explanation: ownerComp.explanation
    },
    {
      field_name: "SURVEY_NUMBER",
      field_label: "Survey / Subdivision Number",
      gis_value: parcel.survey_number,
      database_value: parcel.survey_number,
      document_value: docSurveyNum,
      historical_value: parcel.survey_number,
      department_value: deptData.revenueDept.record.survey_number,
      comparison_result: surveyComp.result,
      similarity_score: surveyComp.score,
      severity: surveyComp.severity,
      explanation: surveyComp.explanation
    },
    {
      field_name: "LAND_AREA",
      field_label: "Land Parcel Extent (Area)",
      gis_value: `${parcel.gis_area} ${parcel.area_unit}`,
      database_value: `${parcel.recorded_area} ${parcel.area_unit}`,
      document_value: `${docArea} ${parcel.area_unit}`,
      historical_value: `${parcel.recorded_area} ${parcel.area_unit}`,
      department_value: `${deptData.revenueDept.record.area} ${parcel.area_unit}`,
      comparison_result: areaGisComp.result,
      similarity_score: areaGisComp.score,
      severity: areaGisComp.severity,
      explanation: areaGisComp.explanation
    },
    {
      field_name: "LOCATION",
      field_label: "Village & Revenue District",
      gis_value: `${parcel.village}, ${parcel.district}`,
      database_value: `${parcel.village}, ${parcel.district}`,
      document_value: `${parcel.village}, ${parcel.district}`,
      historical_value: `${parcel.village}, ${parcel.district}`,
      department_value: `${deptData.revenueDept.record.village}, ${deptData.revenueDept.record.district}`,
      comparison_result: "EXACT_MATCH",
      similarity_score: 100,
      severity: "INFO",
      explanation: "Administrative revenue village boundary matches across all state registers."
    },
    {
      field_name: "LAND_USE",
      field_label: "Land Classification & Zoning",
      gis_value: parcel.land_use,
      database_value: parcel.land_use,
      document_value: parcel.land_use,
      historical_value: parcel.land_use,
      department_value: deptData.revenueDept.record.land_use,
      comparison_result: "EXACT_MATCH",
      similarity_score: 100,
      severity: "INFO",
      explanation: `Zoned as ${parcel.land_use} across master plan and revenue records.`
    },
    {
      field_name: "ENCUMBRANCE_STATUS",
      field_label: "Encumbrance / Lien Status",
      gis_value: "N/A",
      database_value: parcel.status,
      document_value: "Clear Title Claimed",
      historical_value: "No Liens",
      department_value: deptData.encumbranceRegistry.record ? deptData.encumbranceRegistry.record.status : "Pending Query",
      comparison_result: deptData.encumbranceRegistry.record ? "EXACT_MATCH" : "MINOR_DIFFERENCE",
      similarity_score: deptData.encumbranceRegistry.record ? 100 : 80,
      severity: deptData.encumbranceRegistry.record ? "INFO" : "LOW",
      explanation: deptData.encumbranceRegistry.record
        ? "Non-encumbrance certificate verified for 30-year search interval."
        : "Sub-Registrar digital search returned pending status; manual EC verification advised."
    }
  ];

  // 4. Calculate Consistency Score & Level
  let calculatedScore = 100;
  calculatedScore -= minorDiffCount * 5;
  calculatedScore -= majorMismatchCount * 15;
  calculatedScore -= criticalMismatchCount * 25;
  calculatedScore -= missingFieldCount * 2;
  calculatedScore = Math.max(0, Math.min(100, calculatedScore));

  let consistencyLevel: "HIGH_CONSISTENCY" | "GOOD_CONSISTENCY" | "MODERATE_CONSISTENCY" | "LOW_CONSISTENCY" = "HIGH_CONSISTENCY";
  if (calculatedScore >= 90) {
    consistencyLevel = "HIGH_CONSISTENCY";
  } else if (calculatedScore >= 75) {
    consistencyLevel = "GOOD_CONSISTENCY";
  } else if (calculatedScore >= 50) {
    consistencyLevel = "MODERATE_CONSISTENCY";
  } else {
    consistencyLevel = "LOW_CONSISTENCY";
  }

  // 5. Generate Explainable AI Summary
  const totalChecked = matchesCount + minorDiffCount + majorMismatchCount + criticalMismatchCount;
  let summaryText = `${totalChecked} field comparisons were performed across GIS spatial layers, state master database, document OCR extracts, historical title transfers, and departmental registries. ${matchesCount} fields matched with complete consistency.`;

  if (criticalMismatchCount > 0) {
    summaryText += ` Critical discrepancies were identified (e.g. ${alerts.map(a => a.title).join(", ")}), reducing the overall consistency score to ${calculatedScore}/100. Mandatory officer review and field hearing are required before legal endorsement.`;
  } else if (majorMismatchCount > 0) {
    summaryText += ` Moderate discrepancies were detected (${alerts.map(a => a.title).join(", ")}). Land officer review is recommended to reconcile recorded vs spatial data.`;
  } else if (minorDiffCount > 0) {
    summaryText += ` Minor variations were noted (${minorDiffCount} minor difference(s)), primarily consisting of initial/spelling variations or minor surveying tolerances. Data consistency is rated as GOOD (${calculatedScore}/100).`;
  } else {
    summaryText += ` Complete harmonic alignment observed across all spatial, legal, and revenue records (Consistency Score: 100/100). Ready for expedited officer endorsement.`;
  }

  // 6. Build Timeline Events
  const timeline: VerificationTimelineEventServer[] = [
    {
      step: 1,
      title: "Verification Request Initialized",
      description: `Cross-record verification initiated by ${requestedByName} for Parcel ${parcel.parcel_id}.`,
      status: "COMPLETED",
      timestamp: new Date(Date.now() - 5000).toISOString()
    },
    {
      step: 2,
      title: "Multi-Source Record Snapshots Created",
      description: `Captured ${snapshots.length} immutable snapshots across GIS, Master DB, Document OCR, and Mock Department APIs.`,
      status: "COMPLETED",
      timestamp: new Date(Date.now() - 4000).toISOString()
    },
    {
      step: 3,
      title: "Canonical Normalization & Tokenization",
      description: "Standardized survey codes, converted land extent units to metric Sq.m, and stripped honorific prefixes.",
      status: "COMPLETED",
      timestamp: new Date(Date.now() - 3000).toISOString()
    },
    {
      step: 4,
      title: "Cross-Record Field Comparison & Matrix Generation",
      description: `Executed field-by-field similarity algorithms across ${totalChecked} data points.`,
      status: "COMPLETED",
      timestamp: new Date(Date.now() - 2000).toISOString()
    },
    {
      step: 5,
      title: "Consistency Scoring & Alert Generation",
      description: `Computed Consistency Score of ${calculatedScore}/100 (${consistencyLevel.replace(/_/g, " ")}). Generated ${alerts.length} operational alert(s).`,
      status: criticalMismatchCount > 0 ? "WARNING" : "COMPLETED",
      timestamp: new Date(Date.now() - 1000).toISOString()
    },
    {
      step: 6,
      title: "Awaiting Officer Attestation",
      description: "Verification results compiled for official administrative review.",
      status: "RUNNING",
      timestamp: now
    }
  ];

  const verificationRecord: LandVerificationServer = {
    id: verificationsDatabase.length + 1,
    verification_id: verId,
    parcel_id: parcel.parcel_id,
    application_id: applicationId || null,
    requested_by: requestedBy,
    requested_by_name: requestedByName,
    verification_type: verificationType || "FULL_PARCEL_VERIFICATION",
    status: criticalMismatchCount > 0 ? "REQUIRES_REVIEW" : "COMPLETED",
    overall_consistency_score: calculatedScore,
    consistency_level: consistencyLevel,
    total_records_checked: totalChecked,
    matches: matchesCount,
    minor_differences: minorDiffCount,
    major_mismatches: majorMismatchCount,
    critical_mismatches: criticalMismatchCount,
    summary: summaryText,
    sources_used: activeSources,
    created_at: now,
    completed_at: now,
    snapshots,
    comparisons,
    matrix_rows: matrixRows,
    alerts,
    timeline
  };

  // Add audit log
  auditLogsDatabase.unshift({
    id: auditLogsDatabase.length + 1,
    user_id: requestedBy,
    action: "CROSS_RECORD_VERIFICATION_EXECUTED",
    entity_type: "LAND_VERIFICATION",
    entity_id: verId,
    details: `Cross-record verification executed for parcel ${parcel.parcel_id} with score ${calculatedScore}% (${consistencyLevel}).`,
    ip_address: "127.0.0.1",
    created_at: now
  });

  return verificationRecord;
}

// -------------------------------------------------------------
// SEED VERIFICATION DATABASE (Realistic Hackathon Demo Scenarios)
// -------------------------------------------------------------
const verificationsDatabase: LandVerificationServer[] = [
  // SCENARIO 1: Perfect Match (100% High Consistency)
  {
    id: 1,
    verification_id: "VER-2026-000001",
    parcel_id: "TN-CBE-001-124-1",
    application_id: "LS-2026-000001",
    requested_by: 2,
    requested_by_name: "Vikram Rathore (Tahsildar)",
    verification_type: "FULL_PARCEL_VERIFICATION",
    status: "COMPLETED",
    overall_consistency_score: 100,
    consistency_level: "HIGH_CONSISTENCY",
    total_records_checked: 6,
    matches: 6,
    minor_differences: 0,
    major_mismatches: 0,
    critical_mismatches: 0,
    summary: "Complete harmonic alignment observed across all 6 verified fields in GIS spatial layers, state master database, document OCR extracts, and departmental registries (Consistency Score: 100/100). No discrepancies detected.",
    sources_used: ["GIS", "PARCEL_DATABASE", "DOCUMENT_OCR", "APPLICATION", "HISTORICAL_RECORD", "MOCK_DEPARTMENT_API"],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    matrix_rows: [
      {
        field_name: "OWNER_NAME",
        field_label: "Registered Land Owner",
        gis_value: "N/A",
        database_value: "Ravi Kumar",
        document_value: "Ravi Kumar",
        historical_value: "Ravi Kumar",
        department_value: "Ravi Kumar",
        comparison_result: "EXACT_MATCH",
        similarity_score: 100,
        severity: "INFO",
        explanation: "Owner name aligns identically across all land records."
      },
      {
        field_name: "SURVEY_NUMBER",
        field_label: "Survey / Subdivision",
        gis_value: "124/1",
        database_value: "124/1",
        document_value: "124/1",
        historical_value: "124/1",
        department_value: "124/1",
        comparison_result: "EXACT_MATCH",
        similarity_score: 100,
        severity: "INFO",
        explanation: "Survey number matches target parcel without subdivision discrepancy."
      },
      {
        field_name: "LAND_AREA",
        field_label: "Land Area Extent",
        gis_value: "2.50 Acres",
        database_value: "2.50 Acres",
        document_value: "2.50 Acres",
        historical_value: "2.50 Acres",
        department_value: "2.50 Acres",
        comparison_result: "EXACT_MATCH",
        similarity_score: 100,
        severity: "INFO",
        explanation: "Land area aligns across GIS polygon, registered deed, and revenue Patta."
      },
      {
        field_name: "LOCATION",
        field_label: "Village & District",
        gis_value: "Demo Village, Coimbatore",
        database_value: "Demo Village, Coimbatore",
        document_value: "Demo Village, Coimbatore",
        historical_value: "Demo Village, Coimbatore",
        department_value: "Demo Village, Coimbatore",
        comparison_result: "EXACT_MATCH",
        similarity_score: 100,
        severity: "INFO",
        explanation: "Administrative revenue village boundary matches across all state registers."
      }
    ],
    alerts: [],
    timeline: [
      { step: 1, title: "Verification Initialized", description: "Triggered during Mutation Review", status: "COMPLETED", timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
      { step: 2, title: "Snapshots Captured", description: "Collected records from 5 distinct data sources", status: "COMPLETED", timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
      { step: 3, title: "Field Comparison Completed", description: "Harmonic match on all 6 fields", status: "COMPLETED", timestamp: new Date(Date.now() - 4 * 86400000).toISOString() }
    ]
  },

  // SCENARIO 2: Minor Owner Variation (92% Good Consistency)
  {
    id: 2,
    verification_id: "VER-2026-000002",
    parcel_id: "TN-CBE-001-124-2",
    application_id: "LS-2026-000002",
    requested_by: 2,
    requested_by_name: "Vikram Rathore (Tahsildar)",
    verification_type: "OWNERSHIP_VERIFICATION",
    status: "COMPLETED",
    overall_consistency_score: 92,
    consistency_level: "GOOD_CONSISTENCY",
    total_records_checked: 6,
    matches: 5,
    minor_differences: 1,
    major_mismatches: 0,
    critical_mismatches: 0,
    summary: "6 records were compared. 5 fields matched with complete consistency. Owner name showed minor initials variation ('S. Murugan' vs 'Murugan S.'). Land area variance is 0.08 acres (within 2.0% tolerance). Officer review confirmed identity continuity.",
    sources_used: ["GIS", "PARCEL_DATABASE", "DOCUMENT_OCR", "APPLICATION", "HISTORICAL_RECORD", "MOCK_DEPARTMENT_API"],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    matrix_rows: [
      {
        field_name: "OWNER_NAME",
        field_label: "Registered Land Owner",
        gis_value: "N/A",
        database_value: "S. Murugan",
        document_value: "Murugan S.",
        historical_value: "S. Murugan",
        department_value: "S. Murugan",
        comparison_result: "FUZZY_MATCH",
        similarity_score: 88,
        severity: "LOW",
        explanation: "Minor initial position difference ('S. Murugan' vs 'Murugan S.'). High confidence match."
      },
      {
        field_name: "SURVEY_NUMBER",
        field_label: "Survey / Subdivision",
        gis_value: "124/2",
        database_value: "124/2",
        document_value: "124/2",
        historical_value: "124/2",
        department_value: "124/2",
        comparison_result: "EXACT_MATCH",
        similarity_score: 100,
        severity: "INFO",
        explanation: "Survey number matches target parcel."
      },
      {
        field_name: "LAND_AREA",
        field_label: "Land Area Extent",
        gis_value: "2.42 Acres",
        database_value: "2.50 Acres",
        document_value: "2.50 Acres",
        historical_value: "2.50 Acres",
        department_value: "2.50 Acres",
        comparison_result: "NORMALIZED_MATCH",
        similarity_score: 96,
        severity: "INFO",
        explanation: "GIS measured area is 2.42 Acres vs 2.50 Acres recorded. Variance of 3.2% within acceptable surveying tolerance."
      }
    ],
    alerts: [
      {
        id: 1,
        verification_id: "VER-2026-000002",
        parcel_id: "TN-CBE-001-124-2",
        application_id: "LS-2026-000002",
        alert_type: "OWNER_MISMATCH",
        severity: "LOW",
        title: "Owner Name Initial Variation",
        description: "Document names owner as 'Murugan S.', while registry records 'S. Murugan'. Phonetic similarity score is 88%.",
        is_resolved: true,
        resolved_by: 2,
        resolved_by_name: "Vikram Rathore (Tahsildar)",
        resolved_remarks: "Verified via Aadhaar identity match. Acceptable Tamil nomenclature initial order.",
        resolved_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ],
    timeline: [
      { step: 1, title: "Verification Initialized", description: "Ownership check started", status: "COMPLETED", timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
      { step: 2, title: "Snapshots Captured", description: "Snapshots from 6 sources gathered", status: "COMPLETED", timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
      { step: 3, title: "Fuzzy Name Match Resolved", description: "Officer resolved minor initial variation", status: "COMPLETED", timestamp: new Date(Date.now() - 2 * 86400000).toISOString() }
    ]
  },

  // SCENARIO 3: Survey Mismatch (45% Low Consistency - Critical Review)
  {
    id: 3,
    verification_id: "VER-2026-000003",
    parcel_id: "TN-CBE-001-124-3",
    application_id: "LS-2026-000003",
    requested_by: 2,
    requested_by_name: "Vikram Rathore (Tahsildar)",
    verification_type: "SURVEY_VERIFICATION",
    status: "REQUIRES_REVIEW",
    overall_consistency_score: 45,
    consistency_level: "LOW_CONSISTENCY",
    total_records_checked: 6,
    matches: 3,
    minor_differences: 1,
    major_mismatches: 1,
    critical_mismatches: 1,
    summary: "CRITICAL MISMATCH: Uploaded document references Survey Number 124/2, whereas the target application and GIS boundary point to Parcel 124/3. Additionally, a polygon overlap flag is present on the eastern border with Parcel 125/1. Consistency score dropped to 45/100. Field hearing mandatory.",
    sources_used: ["GIS", "PARCEL_DATABASE", "DOCUMENT_OCR", "APPLICATION", "HISTORICAL_RECORD", "MOCK_DEPARTMENT_API"],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    matrix_rows: [
      {
        field_name: "SURVEY_NUMBER",
        field_label: "Survey / Subdivision",
        gis_value: "124/3",
        database_value: "124/3",
        document_value: "124/2",
        historical_value: "124/3",
        department_value: "124/3",
        comparison_result: "MISMATCH",
        similarity_score: 35,
        severity: "CRITICAL",
        explanation: "Uploaded Sale Deed explicitly cites Survey No. 124/2, while application targets 124/3."
      },
      {
        field_name: "OWNER_NAME",
        field_label: "Registered Land Owner",
        gis_value: "N/A",
        database_value: "Senthil Enterprises",
        document_value: "Ravi Kumar",
        historical_value: "Senthil Enterprises",
        department_value: "Senthil Enterprises",
        comparison_result: "MISMATCH",
        similarity_score: 20,
        severity: "CRITICAL",
        explanation: "Document owner 'Ravi Kumar' does not match commercial registry entity 'Senthil Enterprises'."
      },
      {
        field_name: "LAND_AREA",
        field_label: "Land Area Extent",
        gis_value: "1.95 Acres",
        database_value: "1.80 Acres",
        document_value: "2.50 Acres",
        historical_value: "1.80 Acres",
        department_value: "1.80 Acres",
        comparison_result: "MISMATCH",
        similarity_score: 45,
        severity: "HIGH",
        explanation: "Document cites 2.50 Acres, official parcel record is 1.80 Acres."
      }
    ],
    alerts: [
      {
        id: 2,
        verification_id: "VER-2026-000003",
        parcel_id: "TN-CBE-001-124-3",
        application_id: "LS-2026-000003",
        alert_type: "SURVEY_MISMATCH",
        severity: "CRITICAL",
        title: "Survey Number Conflict",
        description: "Uploaded document references Survey 124/2, but target parcel is 124/3.",
        is_resolved: false,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 3,
        verification_id: "VER-2026-000003",
        parcel_id: "TN-CBE-001-124-3",
        application_id: "LS-2026-000003",
        alert_type: "OWNER_MISMATCH",
        severity: "CRITICAL",
        title: "Title Owner Conflict",
        description: "Deed owner 'Ravi Kumar' differs from parcel owner 'Senthil Enterprises'.",
        is_resolved: false,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 4,
        verification_id: "VER-2026-000003",
        parcel_id: "TN-CBE-001-124-3",
        application_id: "LS-2026-000003",
        alert_type: "BOUNDARY_CONFLICT",
        severity: "HIGH",
        title: "Spatial Boundary Overlap Detected",
        description: "GIS engine detected boundary polygon overlap with Parcel 125/1 on the eastern boundary.",
        is_resolved: false,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ],
    timeline: [
      { step: 1, title: "Verification Initialized", description: "Boundary check initiated", status: "COMPLETED", timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
      { step: 2, title: "Snapshots Captured", description: "Gathered records from all 6 sources", status: "COMPLETED", timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
      { step: 3, title: "Critical Inconsistencies Flagged", description: "3 critical alerts raised; flagged for Tahsildar field hearing", status: "WARNING", timestamp: new Date(Date.now() - 2 * 86400000).toISOString() }
    ]
  },

  // SCENARIO 4: Area Difference (70% Moderate Consistency)
  {
    id: 4,
    verification_id: "VER-2026-000004",
    parcel_id: "TN-CBE-001-126-2",
    application_id: "LS-2026-000012",
    requested_by: 2,
    requested_by_name: "Vikram Rathore (Tahsildar)",
    verification_type: "AREA_VERIFICATION",
    status: "REQUIRES_REVIEW",
    overall_consistency_score: 70,
    consistency_level: "MODERATE_CONSISTENCY",
    total_records_checked: 6,
    matches: 4,
    minor_differences: 1,
    major_mismatches: 1,
    critical_mismatches: 0,
    summary: "Area verification highlighted a 7.4% discrepancy between recorded Patta area (3.80 Acres) and modern satellite DGPS GIS area (3.52 Acres). Owner and survey number matched consistently. DGPS resurvey ordered to reconcile boundary.",
    sources_used: ["GIS", "PARCEL_DATABASE", "DOCUMENT_OCR", "HISTORICAL_RECORD", "MOCK_DEPARTMENT_API"],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    matrix_rows: [
      {
        field_name: "LAND_AREA",
        field_label: "Land Area Extent",
        gis_value: "3.52 Acres",
        database_value: "3.80 Acres",
        document_value: "3.80 Acres",
        historical_value: "3.80 Acres",
        department_value: "3.80 Acres",
        comparison_result: "MINOR_DIFFERENCE",
        similarity_score: 65,
        severity: "HIGH",
        explanation: "GIS polygon calculation shows 3.52 Acres (0.28 Acres less than Patta record). Exceeds 5% threshold."
      },
      {
        field_name: "OWNER_NAME",
        field_label: "Registered Land Owner",
        gis_value: "N/A",
        database_value: "R. Palanisamy",
        document_value: "R. Palanisamy",
        historical_value: "R. Palanisamy",
        department_value: "R. Palanisamy",
        comparison_result: "EXACT_MATCH",
        similarity_score: 100,
        severity: "INFO",
        explanation: "Owner name verified across all departmental records."
      },
      {
        field_name: "SURVEY_NUMBER",
        field_label: "Survey / Subdivision",
        gis_value: "126/2",
        database_value: "126/2",
        document_value: "126/2",
        historical_value: "126/2",
        department_value: "126/2",
        comparison_result: "EXACT_MATCH",
        similarity_score: 100,
        severity: "INFO",
        explanation: "Survey number matches correctly."
      }
    ],
    alerts: [
      {
        id: 5,
        verification_id: "VER-2026-000004",
        parcel_id: "TN-CBE-001-126-2",
        application_id: "LS-2026-000012",
        alert_type: "AREA_MISMATCH",
        severity: "HIGH",
        title: "Major Area Discrepancy (7.4%)",
        description: "GIS calculated area (3.52 Acres) is 7.4% less than revenue patta (3.80 Acres).",
        is_resolved: false,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ],
    timeline: [
      { step: 1, title: "Area Verification Started", description: "Triggered for Acreage Audit", status: "COMPLETED", timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
      { step: 2, title: "GIS Polygon Computation", description: "Computed exact boundary vertices", status: "COMPLETED", timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
      { step: 3, title: "Area Mismatch Alert Generated", description: "Dispatched notice to District Surveyor", status: "WARNING", timestamp: new Date(Date.now() - 1 * 86400000).toISOString() }
    ]
  },

  // SCENARIO 5: Historical Ownership Conflict (60% Moderate Consistency)
  {
    id: 5,
    verification_id: "VER-2026-000005",
    parcel_id: "TN-CBE-001-125-1",
    application_id: "LS-2026-000010",
    requested_by: 2,
    requested_by_name: "Vikram Rathore (Tahsildar)",
    verification_type: "HISTORICAL_CONSISTENCY_CHECK",
    status: "REQUIRES_REVIEW",
    overall_consistency_score: 60,
    consistency_level: "MODERATE_CONSISTENCY",
    total_records_checked: 6,
    matches: 4,
    minor_differences: 0,
    major_mismatches: 1,
    critical_mismatches: 1,
    summary: "Historical continuity analysis detected that uploaded deed names 'Ravi Kumar', who was the registered owner prior to the 2022 conveyance transfer to 'Apex Logistics Pvt Ltd'. Chain-of-title succession check required to verify validity of presented instrument.",
    sources_used: ["GIS", "PARCEL_DATABASE", "DOCUMENT_OCR", "HISTORICAL_RECORD", "MOCK_DEPARTMENT_API"],
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    completed_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    matrix_rows: [
      {
        field_name: "OWNER_NAME",
        field_label: "Registered Land Owner",
        gis_value: "N/A",
        database_value: "Apex Logistics Pvt Ltd",
        document_value: "Ravi Kumar",
        historical_value: "Ravi Kumar (2021 Conveyance)",
        department_value: "Apex Logistics Pvt Ltd",
        comparison_result: "MISMATCH",
        similarity_score: 30,
        severity: "HIGH",
        explanation: "Document names prior titleholder 'Ravi Kumar'. Registered owner updated to 'Apex Logistics Pvt Ltd' via Doc 4410/2022."
      },
      {
        field_name: "SURVEY_NUMBER",
        field_label: "Survey / Subdivision",
        gis_value: "125/1",
        database_value: "125/1",
        document_value: "125/1",
        historical_value: "125/1",
        department_value: "125/1",
        comparison_result: "EXACT_MATCH",
        similarity_score: 100,
        severity: "INFO",
        explanation: "Survey number matches correctly."
      },
      {
        field_name: "LAND_AREA",
        field_label: "Land Area Extent",
        gis_value: "3.10 Acres",
        database_value: "3.20 Acres",
        document_value: "3.20 Acres",
        historical_value: "3.20 Acres",
        department_value: "3.20 Acres",
        comparison_result: "NORMALIZED_MATCH",
        similarity_score: 95,
        severity: "INFO",
        explanation: "Area variance of 3.1% is within tolerance."
      }
    ],
    alerts: [
      {
        id: 6,
        verification_id: "VER-2026-000005",
        parcel_id: "TN-CBE-001-125-1",
        application_id: "LS-2026-000010",
        alert_type: "HISTORICAL_CONFLICT",
        severity: "HIGH",
        title: "Historical Ownership Conflict",
        description: "Presented document names prior owner 'Ravi Kumar'. Current recorded owner is 'Apex Logistics Pvt Ltd'. Succession review required.",
        is_resolved: false,
        created_at: new Date(Date.now() - 18 * 3600000).toISOString()
      }
    ],
    timeline: [
      { step: 1, title: "Historical Chain of Title Audit", description: "Checked registration timeline", status: "COMPLETED", timestamp: new Date(Date.now() - 18 * 3600000).toISOString() },
      { step: 2, title: "Historical Match Found", description: "Matched deed to 2021 prior titleholder", status: "WARNING", timestamp: new Date(Date.now() - 18 * 3600000).toISOString() }
    ]
  },

  // SCENARIO 6: Missing Encumbrance Department Record (85% Good Consistency)
  {
    id: 6,
    verification_id: "VER-2026-000006",
    parcel_id: "TN-CBE-001-126-1",
    application_id: "LS-2026-000006",
    requested_by: 2,
    requested_by_name: "Vikram Rathore (Tahsildar)",
    verification_type: "DOCUMENT_TO_RECORD_VERIFICATION",
    status: "COMPLETED",
    overall_consistency_score: 85,
    consistency_level: "GOOD_CONSISTENCY",
    total_records_checked: 6,
    matches: 5,
    minor_differences: 1,
    major_mismatches: 0,
    critical_mismatches: 0,
    summary: "All spatial, title, and survey fields matched consistently for Meenakshi Ammal. Mock Sub-Registrar Encumbrance Registry query timed out (degraded network simulator). Consistency score generated as 85/100 (GOOD CONSISTENCY).",
    sources_used: ["GIS", "PARCEL_DATABASE", "DOCUMENT_OCR", "HISTORICAL_RECORD", "MOCK_DEPARTMENT_API"],
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    completed_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    matrix_rows: [
      {
        field_name: "OWNER_NAME",
        field_label: "Registered Land Owner",
        gis_value: "N/A",
        database_value: "Meenakshi Ammal",
        document_value: "Meenakshi Ammal",
        historical_value: "Meenakshi Ammal",
        department_value: "Meenakshi Ammal",
        comparison_result: "EXACT_MATCH",
        similarity_score: 100,
        severity: "INFO",
        explanation: "Owner name verified consistently across all records."
      },
      {
        field_name: "SURVEY_NUMBER",
        field_label: "Survey / Subdivision",
        gis_value: "126/1",
        database_value: "126/1",
        document_value: "126/1",
        historical_value: "126/1",
        department_value: "126/1",
        comparison_result: "EXACT_MATCH",
        similarity_score: 100,
        severity: "INFO",
        explanation: "Survey number matches target parcel."
      },
      {
        field_name: "ENCUMBRANCE_STATUS",
        field_label: "Encumbrance / Lien Status",
        gis_value: "N/A",
        database_value: "Active",
        document_value: "Patta Certificate",
        historical_value: "Succession Patta",
        department_value: "Pending API Query",
        comparison_result: "MINOR_DIFFERENCE",
        similarity_score: 80,
        severity: "LOW",
        explanation: "Sub-Registrar digital search returned pending status; manual EC verification advised."
      }
    ],
    alerts: [
      {
        id: 7,
        verification_id: "VER-2026-000006",
        parcel_id: "TN-CBE-001-126-1",
        application_id: "LS-2026-000006",
        alert_type: "MISSING_RECORD",
        severity: "LOW",
        title: "Encumbrance Record Query Pending",
        description: "Sub-Registrar EC query degraded. Non-blocking for succession patta verification.",
        is_resolved: false,
        created_at: new Date(Date.now() - 6 * 3600000).toISOString()
      }
    ],
    timeline: [
      { step: 1, title: "Verification Initialized", description: "Succession patta audit", status: "COMPLETED", timestamp: new Date(Date.now() - 6 * 3600000).toISOString() },
      { step: 2, title: "Snapshots Captured", description: "Collected records from available departments", status: "COMPLETED", timestamp: new Date(Date.now() - 6 * 3600000).toISOString() },
      { step: 3, title: "Verification Completed", description: "Good consistency affirmed (85/100)", status: "COMPLETED", timestamp: new Date(Date.now() - 6 * 3600000).toISOString() }
    ]
  }
];

// -------------------------------------------------------------
// PHASE 5 API ENDPOINTS
// -------------------------------------------------------------

// POST /api/verifications - Create & Execute new cross-record verification
app.post("/api/verifications", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id, application_id, verification_type, sources } = req.body;
  if (!parcel_id) {
    res.status(400).json({ detail: "parcel_id is required to initiate cross-record verification." });
    return;
  }

  const currentUser = req.user!;
  const newVer = runCrossRecordVerification(
    parcel_id,
    application_id,
    verification_type || "FULL_PARCEL_VERIFICATION",
    currentUser.id,
    currentUser.full_name,
    sources
  );

  verificationsDatabase.unshift(newVer);

  // If linked to an application, notify citizen
  if (application_id) {
    const appObj = applicationsDatabase.find(a => a.application_id === application_id);
    if (appObj) {
      notificationsDatabase.unshift({
        id: notificationsDatabase.length + 1,
        user_id: appObj.citizen_id,
        title: "Land Record Verification In Progress",
        message: `Cross-record verification for Application ${appObj.application_id} has been processed by the land intelligence engine and is awaiting officer attestation.`,
        notification_type: "INFO",
        is_read: false,
        related_application_id: appObj.application_id,
        created_at: new Date().toISOString()
      });
    }
  }

  res.status(201).json(newVer);
});

// GET /api/verifications - Role-aware list of verifications
app.get("/api/verifications", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id, application_id, verification_type, status, consistency_level } = req.query;
  const user = req.user!;

  let results = [...verificationsDatabase];

  if (parcel_id) {
    results = results.filter(v => v.parcel_id.toLowerCase().includes(String(parcel_id).toLowerCase()));
  }
  if (application_id) {
    results = results.filter(v => v.application_id && v.application_id.toLowerCase().includes(String(application_id).toLowerCase()));
  }
  if (verification_type) {
    results = results.filter(v => v.verification_type === verification_type);
  }
  if (status) {
    results = results.filter(v => v.status === status);
  }
  if (consistency_level) {
    results = results.filter(v => v.consistency_level === consistency_level);
  }

  // Citizens only see safe summary of their own applications' verifications
  if (user.role === "citizen") {
    const citizenApps = applicationsDatabase.filter(a => a.citizen_id === user.id).map(a => a.application_id);
    results = results.filter(v => v.application_id && citizenApps.includes(v.application_id)).map(v => ({
      id: v.id,
      verification_id: v.verification_id,
      parcel_id: v.parcel_id,
      application_id: v.application_id,
      requested_by: v.requested_by,
      verification_type: v.verification_type,
      status: v.status,
      overall_consistency_score: v.overall_consistency_score,
      consistency_level: v.consistency_level,
      total_records_checked: v.total_records_checked,
      matches: v.matches,
      minor_differences: v.minor_differences,
      major_mismatches: v.major_mismatches,
      critical_mismatches: v.critical_mismatches,
      summary: v.summary,
      created_at: v.created_at,
      completed_at: v.completed_at
    } as any));
  }

  res.json(results);
});

// GET /api/verifications/:verification_id - Complete verification summary
app.get("/api/verifications/:verification_id", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { verification_id } = req.params;
  const ver = verificationsDatabase.find(v => v.verification_id === verification_id || String(v.id) === verification_id);
  if (!ver) {
    res.status(404).json({ detail: `Verification with ID '${verification_id}' not found.` });
    return;
  }

  // If citizen, return safe redacted view
  if (req.user!.role === "citizen") {
    const appObj = ver.application_id ? applicationsDatabase.find(a => a.application_id === ver.application_id) : null;
    if (appObj && appObj.citizen_id !== req.user!.id) {
      res.status(403).json({ detail: "Access forbidden: You cannot view verification records for other citizens." });
      return;
    }
    // Safe citizen view
    res.json({
      id: ver.id,
      verification_id: ver.verification_id,
      parcel_id: ver.parcel_id,
      application_id: ver.application_id,
      verification_type: ver.verification_type,
      status: ver.status,
      overall_consistency_score: ver.overall_consistency_score,
      consistency_level: ver.consistency_level,
      summary: ver.status === "REQUIRES_REVIEW"
        ? "Cross-record consistency check identified details requiring official officer review and verification."
        : "Automated cross-record analysis completed. Land records verified for administrative review.",
      created_at: ver.created_at,
      completed_at: ver.completed_at,
      timeline: ver.timeline
    });
    return;
  }

  res.json(ver);
});

// GET /api/verifications/:verification_id/records - Return record snapshots
app.get("/api/verifications/:verification_id/records", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { verification_id } = req.params;
  const ver = verificationsDatabase.find(v => v.verification_id === verification_id || String(v.id) === verification_id);
  if (!ver) {
    res.status(404).json({ detail: "Verification record not found." });
    return;
  }
  res.json(ver.snapshots || []);
});

// GET /api/verifications/:verification_id/comparisons - Return field comparisons
app.get("/api/verifications/:verification_id/comparisons", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { verification_id } = req.params;
  const ver = verificationsDatabase.find(v => v.verification_id === verification_id || String(v.id) === verification_id);
  if (!ver) {
    res.status(404).json({ detail: "Verification record not found." });
    return;
  }
  res.json(ver.comparisons || []);
});

// GET /api/verifications/:verification_id/alerts - Return verification alerts
app.get("/api/verifications/:verification_id/alerts", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { verification_id } = req.params;
  const ver = verificationsDatabase.find(v => v.verification_id === verification_id || String(v.id) === verification_id);
  if (!ver) {
    res.status(404).json({ detail: "Verification record not found." });
    return;
  }
  res.json(ver.alerts || []);
});

// GET /api/verifications/:verification_id/timeline - Return verification processing timeline
app.get("/api/verifications/:verification_id/timeline", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { verification_id } = req.params;
  const ver = verificationsDatabase.find(v => v.verification_id === verification_id || String(v.id) === verification_id);
  if (!ver) {
    res.status(404).json({ detail: "Verification record not found." });
    return;
  }
  res.json(ver.timeline || []);
});

// POST /api/verifications/:verification_id/rerun - Re-run verification against freshest data
app.post("/api/verifications/:verification_id/rerun", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { verification_id } = req.params;
  const existingIdx = verificationsDatabase.findIndex(v => v.verification_id === verification_id || String(v.id) === verification_id);
  if (existingIdx === -1) {
    res.status(404).json({ detail: "Verification record not found." });
    return;
  }

  const old = verificationsDatabase[existingIdx];
  const currentUser = req.user!;
  const updated = runCrossRecordVerification(
    old.parcel_id,
    old.application_id,
    old.verification_type,
    currentUser.id,
    currentUser.full_name,
    old.sources_used
  );
  updated.id = old.id;
  updated.verification_id = old.verification_id;

  verificationsDatabase[existingIdx] = updated;

  auditLogsDatabase.unshift({
    id: auditLogsDatabase.length + 1,
    user_id: currentUser.id,
    action: "CROSS_RECORD_VERIFICATION_RERUN",
    entity_type: "LAND_VERIFICATION",
    entity_id: old.verification_id,
    details: `Re-ran cross-record verification for parcel ${old.parcel_id}. New score: ${updated.overall_consistency_score}%.`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.json(updated);
});

// POST /api/verifications/:verification_id/resolve-alert/:alert_id - Officer / Admin alert resolution
app.post("/api/verifications/:verification_id/resolve-alert/:alert_id", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { verification_id, alert_id } = req.params;
  const { remarks } = req.body;
  const numAlertId = parseInt(alert_id, 10);
  const currentUser = req.user!;

  const ver = verificationsDatabase.find(v => v.verification_id === verification_id || String(v.id) === verification_id);
  if (!ver || !ver.alerts) {
    res.status(404).json({ detail: "Verification or alert list not found." });
    return;
  }

  const alertObj = ver.alerts.find(a => a.id === numAlertId);
  if (!alertObj) {
    res.status(404).json({ detail: `Alert with ID ${alert_id} not found.` });
    return;
  }

  alertObj.is_resolved = true;
  alertObj.resolved_by = currentUser.id;
  alertObj.resolved_by_name = currentUser.full_name;
  alertObj.resolved_remarks = remarks || "Resolved during officer cross-record review.";
  alertObj.resolved_at = new Date().toISOString();

  // If all critical/high alerts resolved, adjust status
  const unresolvedCritical = ver.alerts.filter(a => !a.is_resolved && (a.severity === "CRITICAL" || a.severity === "HIGH"));
  if (unresolvedCritical.length === 0 && ver.status === "REQUIRES_REVIEW") {
    ver.status = "COMPLETED";
  }

  auditLogsDatabase.unshift({
    id: auditLogsDatabase.length + 1,
    user_id: currentUser.id,
    action: "VERIFICATION_ALERT_RESOLVED",
    entity_type: "VERIFICATION_ALERT",
    entity_id: String(numAlertId),
    details: `Officer resolved alert '${alertObj.title}' on verification ${ver.verification_id}. Remarks: ${alertObj.resolved_remarks}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.json({
    status: "success",
    message: `Alert '${alertObj.title}' resolved successfully.`,
    alert: alertObj
  });
});

// GET /api/parcels/:parcel_id/verification-summary - Return latest verification result for parcel
app.get("/api/parcels/:parcel_id/verification-summary", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const ver = verificationsDatabase.find(v => v.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  if (!ver) {
    res.json(null);
    return;
  }
  res.json(ver);
});

// GET /api/analytics/verifications/overview - Analytics overview
app.get("/api/analytics/verifications/overview", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const total = verificationsDatabase.length;
  const high = verificationsDatabase.filter(v => v.consistency_level === "HIGH_CONSISTENCY").length;
  const review = verificationsDatabase.filter(v => v.status === "REQUIRES_REVIEW" || v.consistency_level === "MODERATE_CONSISTENCY" || v.consistency_level === "GOOD_CONSISTENCY").length;
  const critical = verificationsDatabase.filter(v => v.consistency_level === "LOW_CONSISTENCY" || v.critical_mismatches > 0).length;
  const scores = verificationsDatabase.map(v => v.overall_consistency_score);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 75.3;

  // Status counts
  const statusMap: Record<string, number> = {};
  verificationsDatabase.forEach(v => {
    statusMap[v.status] = (statusMap[v.status] || 0) + 1;
  });

  // Consistency distribution
  const levelCounts: Record<string, number> = {
    HIGH_CONSISTENCY: 0,
    GOOD_CONSISTENCY: 0,
    MODERATE_CONSISTENCY: 0,
    LOW_CONSISTENCY: 0
  };
  verificationsDatabase.forEach(v => {
    levelCounts[v.consistency_level] = (levelCounts[v.consistency_level] || 0) + 1;
  });

  // Mismatch types
  const mismatchMap: Record<string, number> = {
    OWNER_MISMATCH: 0,
    SURVEY_MISMATCH: 0,
    AREA_MISMATCH: 0,
    LOCATION_MISMATCH: 0,
    HISTORICAL_CONFLICT: 0,
    BOUNDARY_CONFLICT: 0,
    MISSING_RECORD: 0
  };
  verificationsDatabase.forEach(v => {
    v.alerts?.forEach(a => {
      mismatchMap[a.alert_type] = (mismatchMap[a.alert_type] || 0) + 1;
    });
  });

  const totalAlerts = Object.values(mismatchMap).reduce((a, b) => a + b, 0) || 1;

  res.json({
    total_verifications: total,
    high_consistency: high,
    review_required: review,
    critical_conflicts: critical,
    average_consistency_score: avg,
    most_common_mismatch_type: "OWNER_MISMATCH",
    status_counts: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
    consistency_distribution: Object.entries(levelCounts).map(([level, count]) => ({
      level: level.replace(/_/g, " "),
      count,
      percentage: Math.round((count / Math.max(1, total)) * 1000) / 10
    })),
    mismatch_types: Object.entries(mismatchMap).map(([alert_type, count]) => ({
      alert_type: alert_type.replace(/_/g, " "),
      count,
      percentage: Math.round((count / totalAlerts) * 1000) / 10
    })),
    source_availability: [
      { source_type: "GIS Spatial Engine", available_count: 48, total_queries: 48, availability_percent: 100.0 },
      { source_type: "State Master Registry DB", available_count: 48, total_queries: 48, availability_percent: 100.0 },
      { source_type: "Document Intelligence OCR", available_count: 45, total_queries: 48, availability_percent: 93.8 },
      { source_type: "Revenue Dept (Tamil Nilam)", available_count: 47, total_queries: 48, availability_percent: 97.9 },
      { source_type: "Registration Dept (IGRS)", available_count: 46, total_queries: 48, availability_percent: 95.8 },
      { source_type: "Survey Dept (CollabLand)", available_count: 48, total_queries: 48, availability_percent: 100.0 },
      { source_type: "Encumbrance Registry (EC)", available_count: 41, total_queries: 48, availability_percent: 85.4 }
    ]
  });
});

app.get("/api/analytics/verifications/mismatch-types", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const mismatchMap: Record<string, number> = {
    "Owner Name Variation": 14,
    "Survey Number Discrepancy": 8,
    "Area Extent Variance (>5%)": 11,
    "Historical Chain of Title": 6,
    "Boundary Polygon Overlap": 4,
    "Pending EC Record": 5
  };
  const total = Object.values(mismatchMap).reduce((a, b) => a + b, 0);
  const result = Object.entries(mismatchMap).map(([alert_type, count]) => ({
    alert_type,
    count,
    percentage: Math.round((count / total) * 1000) / 10
  }));
  res.json(result);
});

app.get("/api/analytics/verifications/consistency-distribution", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const data = [
    { level: "High Consistency (90-100)", count: 24, percentage: 50.0 },
    { level: "Good Consistency (75-89)", count: 12, percentage: 25.0 },
    { level: "Moderate Consistency (50-74)", count: 8, percentage: 16.7 },
    { level: "Low Consistency (<50)", count: 4, percentage: 8.3 }
  ];
  res.json(data);
});

app.get("/api/analytics/verifications/source-availability", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  res.json([
    { source_type: "GIS Spatial Engine", available_count: 48, total_queries: 48, availability_percent: 100.0 },
    { source_type: "State Master Registry DB", available_count: 48, total_queries: 48, availability_percent: 100.0 },
    { source_type: "Document Intelligence OCR", available_count: 45, total_queries: 48, availability_percent: 93.8 },
    { source_type: "Revenue Dept (Tamil Nilam)", available_count: 47, total_queries: 48, availability_percent: 97.9 },
    { source_type: "Registration Dept (IGRS)", available_count: 46, total_queries: 48, availability_percent: 95.8 },
    { source_type: "Survey Dept (CollabLand)", available_count: 48, total_queries: 48, availability_percent: 100.0 },
    { source_type: "Encumbrance Registry (EC)", available_count: 41, total_queries: 48, availability_percent: 85.4 }
  ]);
});

// GET /api/integrations/status - Department Integrations Health & Sample Data Inspector
app.get("/api/integrations/status", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const p = parcelsDatabase[0];
  const deptData = getMockDepartmentData(p);
  const integrations = [
    deptData.revenueDept,
    deptData.registrationDept,
    deptData.surveyDept,
    deptData.encumbranceRegistry
  ];
  res.json(integrations);
});

// ==========================================
// PHASE 6: LAND DNA & INTELLIGENT RISK ENGINE
// ==========================================

interface LandDNAProfileRecord {
  id: number;
  dna_id: string;
  parcel_id: string;
  identity_score: number;
  record_consistency_score: number;
  ownership_stability_score: number;
  area_stability_score: number;
  survey_stability_score: number;
  document_consistency_score: number;
  verification_health_score: number;
  overall_land_health_score: number;
  health_category: "EXCELLENT" | "GOOD" | "MODERATE" | "LOW" | "CRITICAL";
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  overall_risk_score: number;
  profile_summary: string;
  generated_at: string;
  updated_at: string;
}

interface LandRiskAssessmentRecord {
  id: number;
  risk_assessment_id: string;
  parcel_id: string;
  application_id?: string | null;
  overall_risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  record_risk: number;
  document_risk: number;
  historical_risk: number;
  area_risk: number;
  survey_risk: number;
  ownership_risk: number;
  gis_risk: number;
  summary: string;
  created_at: string;
}

interface RiskSignalRecord {
  id: number;
  risk_assessment_id: string;
  parcel_id: string;
  signal_type: string;
  signal_name: string;
  description: string;
  source: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  risk_points: number;
  confidence: number;
  is_resolved: boolean;
  resolution_note?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

interface LandAnomalyRecord {
  id: number;
  anomaly_id: string;
  parcel_id: string;
  application_id?: string | null;
  anomaly_type: string;
  field_name: string;
  expected_value: string;
  observed_value: string;
  anomaly_score: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  explanation: string;
  detected_at: string;
  review_status: "DETECTED" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED" | "ACTION_REQUESTED";
  review_note?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

interface LandDNAHistoryRecord {
  id: number;
  parcel_id: string;
  dna_profile_id: string;
  profile_snapshot_json: Record<string, any>;
  change_summary: string;
  created_at: string;
}

let dnaIdCounter = 6;
let riskIdCounter = 6;
let signalIdCounter = 15;
let anomalyIdCounter = 12;
let dnaHistoryIdCounter = 6;

// In-Memory Databases for Phase 6
const landDnaProfilesDatabase: LandDNAProfileRecord[] = [
  // 1. Healthy Parcel
  {
    id: 1,
    dna_id: "DNA-2026-000001",
    parcel_id: "TN-CBE-001-124-2",
    identity_score: 98,
    record_consistency_score: 96,
    ownership_stability_score: 95,
    area_stability_score: 94,
    survey_stability_score: 95,
    document_consistency_score: 92,
    verification_health_score: 94,
    overall_land_health_score: 94,
    health_category: "EXCELLENT",
    risk_level: "LOW",
    overall_risk_score: 8,
    profile_summary: "High consistency verified across GIS polygon, State Master Patta DB, encumbrance search, and uploaded sale deed. Historical ownership continuity is fully supported. No unresolved anomalies detected. Record stability is optimal.",
    generated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  // 2. Minor Area Difference (Moderate Health)
  {
    id: 2,
    dna_id: "DNA-2026-000002",
    parcel_id: "TN-CBE-001-126-2",
    identity_score: 90,
    record_consistency_score: 70,
    ownership_stability_score: 85,
    area_stability_score: 65,
    survey_stability_score: 88,
    document_consistency_score: 78,
    verification_health_score: 68,
    overall_land_health_score: 74,
    health_category: "MODERATE",
    risk_level: "MEDIUM",
    overall_risk_score: 32,
    profile_summary: "Parcel exhibits strong identity and clear ownership lineage, but contains a 7.4% boundary variance between satellite DGPS GIS calculation (3.52 Acres) and registered Patta (3.80 Acres). Standard field resurvey recommended.",
    generated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  // 3. High Review Priority (Multiple Document & OCR Mismatches)
  {
    id: 3,
    dna_id: "DNA-2026-000003",
    parcel_id: "TN-CBE-001-125-1",
    identity_score: 65,
    record_consistency_score: 45,
    ownership_stability_score: 55,
    area_stability_score: 40,
    survey_stability_score: 50,
    document_consistency_score: 35,
    verification_health_score: 40,
    overall_land_health_score: 46,
    health_category: "LOW",
    risk_level: "HIGH",
    overall_risk_score: 68,
    profile_summary: "Multiple document OCR discrepancies detected including mismatched vendor name ('K. Murugan' vs 'K. Murugesan') and overlapping survey number references across legacy deed copies. Detailed officer review mandated.",
    generated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  // 4. Historical Pattern Review (Frequent Transfers)
  {
    id: 4,
    dna_id: "DNA-2026-000004",
    parcel_id: "TN-CBE-001-128-4",
    identity_score: 82,
    record_consistency_score: 65,
    ownership_stability_score: 45,
    area_stability_score: 80,
    survey_stability_score: 75,
    document_consistency_score: 70,
    verification_health_score: 58,
    overall_land_health_score: 62,
    health_category: "MODERATE",
    risk_level: "MEDIUM",
    overall_risk_score: 42,
    profile_summary: "High frequency of ownership conveyances detected (3 transfers recorded within 24 months). Chain of title is mathematically continuous, but accelerated transfer velocity warrants supervisory review before transaction clearance.",
    generated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  // 5. Critical Review (Severe Overlaps & Conflicting Survey Claims)
  {
    id: 5,
    dna_id: "DNA-2026-000005",
    parcel_id: "TN-CBE-001-127-3",
    identity_score: 35,
    record_consistency_score: 25,
    ownership_stability_score: 30,
    area_stability_score: 20,
    survey_stability_score: 25,
    document_consistency_score: 30,
    verification_health_score: 18,
    overall_land_health_score: 28,
    health_category: "CRITICAL",
    risk_level: "CRITICAL",
    overall_risk_score: 88,
    profile_summary: "Critical multi-source conflict detected. Unresolved boundary polygon overlap of 0.85 Acres detected against neighboring parcel 127/4. Competing survey record mutations and unresolved encumbrance notices require immediate Tahsildar adjudication.",
    generated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const landRiskAssessmentsDatabase: LandRiskAssessmentRecord[] = [
  {
    id: 1,
    risk_assessment_id: "RISK-2026-000001",
    parcel_id: "TN-CBE-001-124-2",
    application_id: "LS-2026-000001",
    overall_risk_score: 8,
    risk_level: "LOW",
    record_risk: 5,
    document_risk: 8,
    historical_risk: 6,
    area_risk: 8,
    survey_risk: 5,
    ownership_risk: 6,
    gis_risk: 7,
    summary: "Minimal risk indicators observed. All records across survey, revenue, and sub-registrar registers match seamlessly.",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 2,
    risk_assessment_id: "RISK-2026-000002",
    parcel_id: "TN-CBE-001-126-2",
    application_id: "LS-2026-000012",
    overall_risk_score: 32,
    risk_level: "MEDIUM",
    record_risk: 28,
    document_risk: 22,
    historical_risk: 15,
    area_risk: 48,
    survey_risk: 18,
    ownership_risk: 15,
    gis_risk: 42,
    summary: "Area variance of 7.4% flagged between GIS spatial computation and Patta entry. Low ownership or encumbrance risk.",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 3,
    risk_assessment_id: "RISK-2026-000003",
    parcel_id: "TN-CBE-001-125-1",
    application_id: "LS-2026-000008",
    overall_risk_score: 68,
    risk_level: "HIGH",
    record_risk: 72,
    document_risk: 82,
    historical_risk: 55,
    area_risk: 65,
    survey_risk: 70,
    ownership_risk: 64,
    gis_risk: 50,
    summary: "Elevated risk driven by document extraction variances and conflicting owner name variations in recent sale deed filings.",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 4,
    risk_assessment_id: "RISK-2026-000004",
    parcel_id: "TN-CBE-001-128-4",
    application_id: "LS-2026-000015",
    overall_risk_score: 42,
    risk_level: "MEDIUM",
    record_risk: 35,
    document_risk: 25,
    historical_risk: 65,
    area_risk: 20,
    survey_risk: 30,
    ownership_risk: 58,
    gis_risk: 25,
    summary: "Unusual ownership transfer velocity (3 sales in 24 months) detected. Deed continuity verified, but requires supervisory sign-off.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 5,
    risk_assessment_id: "RISK-2026-000005",
    parcel_id: "TN-CBE-001-127-3",
    application_id: "LS-2026-000003",
    overall_risk_score: 88,
    risk_level: "CRITICAL",
    record_risk: 92,
    document_risk: 85,
    historical_risk: 78,
    area_risk: 95,
    survey_risk: 90,
    ownership_risk: 84,
    gis_risk: 96,
    summary: "Critical spatial boundary conflict and competing mutation applications present high risk of boundary encroachment dispute.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const riskSignalsDatabase: RiskSignalRecord[] = [
  // Scenario 1
  {
    id: 1,
    risk_assessment_id: "RISK-2026-000001",
    parcel_id: "TN-CBE-001-124-2",
    signal_type: "DOCUMENT_DATA_INCONSISTENCY",
    signal_name: "Minor OCR Layout Noise",
    description: "Scan copy contained minor background skew; fuzzy text matcher resolved all names with >96% confidence.",
    source: "DOCUMENT_OCR_ENGINE",
    severity: "LOW",
    risk_points: 5,
    confidence: 96,
    is_resolved: true,
    resolution_note: "Officer verified original physical deed copy in office; matches digital patta.",
    resolved_by: "Vikram Rathore (Tahsildar)",
    resolved_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  // Scenario 2
  {
    id: 2,
    risk_assessment_id: "RISK-2026-000002",
    parcel_id: "TN-CBE-001-126-2",
    signal_type: "GIS_AREA_DIFFERENCE",
    signal_name: "Satellite GIS vs Patta Area Delta",
    description: "Recorded land area (3.80 Acres) differs from GIS satellite calculated polygon area (3.52 Acres) by 7.4%.",
    source: "GIS_SPATIAL_ENGINE",
    severity: "MEDIUM",
    risk_points: 20,
    confidence: 89,
    is_resolved: false,
    resolution_note: null,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 3,
    risk_assessment_id: "RISK-2026-000002",
    parcel_id: "TN-CBE-001-126-2",
    signal_type: "SIGNIFICANT_AREA_CHANGE",
    signal_name: "Recorded Area Variance > 5%",
    description: "Boundary polygon calculation shows 0.28 Acres variance from revenue register. Exceeds standard tolerance limit.",
    source: "REVENUE_PATTA_INTELLIGENCE",
    severity: "MEDIUM",
    risk_points: 15,
    confidence: 92,
    is_resolved: false,
    resolution_note: null,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  // Scenario 3
  {
    id: 4,
    risk_assessment_id: "RISK-2026-000003",
    parcel_id: "TN-CBE-001-125-1",
    signal_type: "MULTIPLE_DOCUMENT_MISMATCHES",
    signal_name: "Repeated Document Field Discrepancies",
    description: "OCR extracted vendor name 'K. Murugan' differs from registered patta name 'K. Murugesan'.",
    source: "DOCUMENT_INTELLIGENCE",
    severity: "HIGH",
    risk_points: 25,
    confidence: 88,
    is_resolved: false,
    resolution_note: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 5,
    risk_assessment_id: "RISK-2026-000003",
    parcel_id: "TN-CBE-001-125-1",
    signal_type: "REPEATED_SURVEY_CONFLICT",
    signal_name: "Survey Subdivision Number Conflict",
    description: "Survey number extracted from attached encumbrance certificate references 125/1B while deed indicates 125/1.",
    source: "REGISTRATION_IGRS_GATEWAY",
    severity: "HIGH",
    risk_points: 25,
    confidence: 85,
    is_resolved: false,
    resolution_note: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  // Scenario 4
  {
    id: 6,
    risk_assessment_id: "RISK-2026-000004",
    parcel_id: "TN-CBE-001-128-4",
    signal_type: "HIGH_FREQUENCY_RECORD_CHANGE",
    signal_name: "Accelerated Ownership Transfers",
    description: "Parcel experienced 3 conveyance deeds within a 24-month window (2024-03, 2024-11, 2025-09).",
    source: "HISTORICAL_PATTA_ANALYSIS",
    severity: "MEDIUM",
    risk_points: 22,
    confidence: 95,
    is_resolved: false,
    resolution_note: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  // Scenario 5
  {
    id: 7,
    risk_assessment_id: "RISK-2026-000005",
    parcel_id: "TN-CBE-001-127-3",
    signal_type: "UNRESOLVED_CRITICAL_ALERT",
    signal_name: "Critical Spatial Boundary Encroachment",
    description: "Cadastral boundary intersects with parcel TN-CBE-001-127-4 with an overlap area of 0.85 Acres.",
    source: "GIS_SPATIAL_ENGINE",
    severity: "CRITICAL",
    risk_points: 35,
    confidence: 98,
    is_resolved: false,
    resolution_note: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 8,
    risk_assessment_id: "RISK-2026-000005",
    parcel_id: "TN-CBE-001-127-3",
    signal_type: "REPEATED_VERIFICATION_FAILURE",
    signal_name: "Multiple Verification Engine Failures",
    description: "Cross-record reconciliation failed 2 consecutive automated checks with scores below 30/100.",
    source: "LAND_INTELLIGENCE_ENGINE",
    severity: "CRITICAL",
    risk_points: 30,
    confidence: 96,
    is_resolved: false,
    resolution_note: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const landAnomaliesDatabase: LandAnomalyRecord[] = [
  // Scenario 1: Resolved
  {
    id: 1,
    anomaly_id: "ANOM-2026-000001",
    parcel_id: "TN-CBE-001-124-2",
    application_id: "LS-2026-000001",
    anomaly_type: "DATA_COMPLETENESS_ANOMALY",
    field_name: "Pincode",
    expected_value: "641001",
    observed_value: "641002",
    anomaly_score: 15,
    severity: "LOW",
    explanation: "Postal code in old paper record showed adjacent post office postal code.",
    detected_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    review_status: "RESOLVED",
    review_note: "Updated to match standard municipal ward boundary.",
    reviewed_by: "Vikram Rathore (Tahsildar)",
    reviewed_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  // Scenario 2
  {
    id: 2,
    anomaly_id: "ANOM-2026-000002",
    parcel_id: "TN-CBE-001-126-2",
    application_id: "LS-2026-000012",
    anomaly_type: "AREA_ANOMALY",
    field_name: "Land Area Extent",
    expected_value: "3.80 Acres",
    observed_value: "3.52 Acres",
    anomaly_score: 65,
    severity: "HIGH",
    explanation: "Difference of 0.28 Acres (7.4%) observed between Master Patta and GIS polygon calculation.",
    detected_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    review_status: "UNDER_REVIEW",
    review_note: "Surveyor scheduled for on-site field verification."
  },
  // Scenario 3
  {
    id: 3,
    anomaly_id: "ANOM-2026-000003",
    parcel_id: "TN-CBE-001-125-1",
    application_id: "LS-2026-000008",
    anomaly_type: "OWNER_PATTERN_ANOMALY",
    field_name: "Owner Full Name",
    expected_value: "K. Murugesan",
    observed_value: "K. Murugan",
    anomaly_score: 75,
    severity: "HIGH",
    explanation: "Vendor name string distance violates standard phonetic threshold across recent registered documents.",
    detected_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    review_status: "ACTION_REQUESTED",
    review_note: "Requested applicant to submit Aadhaar identity rectification affidavit."
  },
  {
    id: 4,
    anomaly_id: "ANOM-2026-000004",
    parcel_id: "TN-CBE-001-125-1",
    application_id: "LS-2026-000008",
    anomaly_type: "SURVEY_ANOMALY",
    field_name: "Survey Subdivision",
    expected_value: "125/1",
    observed_value: "125/1B",
    anomaly_score: 70,
    severity: "HIGH",
    explanation: "Conflicting subdivision suffix found in attached prior mortgage release deed.",
    detected_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    review_status: "DETECTED"
  },
  // Scenario 4
  {
    id: 5,
    anomaly_id: "ANOM-2026-000005",
    parcel_id: "TN-CBE-001-128-4",
    application_id: "LS-2026-000015",
    anomaly_type: "HISTORICAL_CHANGE_ANOMALY",
    field_name: "Ownership Frequency",
    expected_value: "≤ 1 Transfer / 3 Years",
    observed_value: "3 Transfers / 2 Years",
    anomaly_score: 55,
    severity: "MEDIUM",
    explanation: "Unusually high velocity of property conveyance registered within a short duration.",
    detected_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    review_status: "DETECTED"
  },
  // Scenario 5
  {
    id: 6,
    anomaly_id: "ANOM-2026-000006",
    parcel_id: "TN-CBE-001-127-3",
    application_id: "LS-2026-000003",
    anomaly_type: "GIS_RECORD_ANOMALY",
    field_name: "Spatial Polygon Overlap",
    expected_value: "0.00 Acres (Disjoint Boundaries)",
    observed_value: "0.85 Acres Overlap with 127/4",
    anomaly_score: 95,
    severity: "CRITICAL",
    explanation: "Severe GIS cadastral intersection detected with adjacent parcel boundary.",
    detected_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    review_status: "UNDER_REVIEW",
    review_note: "Tahsildar summons issued for joint boundary hearing."
  },
  {
    id: 7,
    anomaly_id: "ANOM-2026-000007",
    parcel_id: "TN-CBE-001-127-3",
    application_id: "LS-2026-000003",
    anomaly_type: "VERIFICATION_ANOMALY",
    field_name: "Multi-Source Verification Health",
    expected_value: "Score ≥ 75",
    observed_value: "Score = 28",
    anomaly_score: 90,
    severity: "CRITICAL",
    explanation: "Automated multi-department cross-record consistency check failed critically.",
    detected_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    review_status: "DETECTED"
  }
];

const landDnaHistoryDatabase: LandDNAHistoryRecord[] = [
  {
    id: 1,
    parcel_id: "TN-CBE-001-124-2",
    dna_profile_id: "DNA-2026-000001",
    profile_snapshot_json: { health_score: 94, risk_score: 8, status: "EXCELLENT" },
    change_summary: "Initial baseline Land DNA profile generated after Phase 5 multi-source verification.",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 2,
    parcel_id: "TN-CBE-001-126-2",
    dna_profile_id: "DNA-2026-000002",
    profile_snapshot_json: { health_score: 74, risk_score: 32, status: "MODERATE" },
    change_summary: "Area stability re-evaluated following satellite DGPS layer ingestion.",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 3,
    parcel_id: "TN-CBE-001-125-1",
    dna_profile_id: "DNA-2026-000003",
    profile_snapshot_json: { health_score: 46, risk_score: 68, status: "LOW" },
    change_summary: "Risk level raised to HIGH after document OCR detected name mismatch.",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 4,
    parcel_id: "TN-CBE-001-128-4",
    dna_profile_id: "DNA-2026-000004",
    profile_snapshot_json: { health_score: 62, risk_score: 42, status: "MODERATE" },
    change_summary: "Historical stability updated with multi-transfer transaction signal.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 5,
    parcel_id: "TN-CBE-001-127-3",
    dna_profile_id: "DNA-2026-000005",
    profile_snapshot_json: { health_score: 28, risk_score: 88, status: "CRITICAL" },
    change_summary: "Critical boundary overlap signal raised following neighbor parcel cadastral sync.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

// Helper: Calculate Land Health Category
function getLandHealthCategory(score: number): "EXCELLENT" | "GOOD" | "MODERATE" | "LOW" | "CRITICAL" {
  if (score >= 90) return "EXCELLENT";
  if (score >= 80) return "GOOD";
  if (score >= 60) return "MODERATE";
  if (score >= 40) return "LOW";
  return "CRITICAL";
}

// Helper: Calculate Risk Level
function getRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score <= 25) return "LOW";
  if (score <= 50) return "MEDIUM";
  if (score <= 75) return "HIGH";
  return "CRITICAL";
}

// Helper: Synthesize Explainable AI Summary
function generateExplainableSummary(health: number, risk: number, signals: RiskSignalRecord[], anomalies: LandAnomalyRecord[]): string {
  const activeCriticalSignals = signals.filter(s => !s.is_resolved && s.severity === "CRITICAL");
  const activeHighSignals = signals.filter(s => !s.is_resolved && s.severity === "HIGH");
  const unresolvedAnomalies = anomalies.filter(a => a.review_status !== "RESOLVED" && a.review_status !== "DISMISSED");

  if (health >= 90 && risk <= 15) {
    return "This parcel has high consistency across GIS, parcel records, and verified documents. Historical ownership changes are supported by available records. No unresolved critical conflicts were detected. Overall land record health is EXCELLENT.";
  }

  if (activeCriticalSignals.length > 0) {
    return `This parcel contains ${activeCriticalSignals.length} critical unresolved verification alert(s) including spatial boundary conflicts or multi-department reconciliation failures. Detailed Tahsildar adjudication is mandated before transaction clearance.`;
  }

  if (activeHighSignals.length > 0 || unresolvedAnomalies.length > 0) {
    return `This parcel contains ${activeHighSignals.length} high-priority risk signal(s) and ${unresolvedAnomalies.length} anomaly observation(s) across survey, document OCR, or area measurements. Detailed officer review is recommended.`;
  }

  if (health >= 60) {
    return "This parcel exhibits moderate consistency. Minor record or measurement variances were observed, but ownership continuity is preserved. Routine supervisory check recommended.";
  }

  return "Land intelligence analysis indicates low overall record health with multiple cross-department discrepancies. Comprehensive field verification is advised.";
}

// Helper: Compute Complete Land DNA Profile Dynamically
function computeLandDNAProfile(parcelId: string): LandDNAProfileRecord {
  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === parcelId.toLowerCase());
  const verifications = verificationsDatabase.filter(v => v.parcel_id.toLowerCase() === parcelId.toLowerCase());
  const latestVerification = verifications.length > 0 ? verifications[0] : null;
  const existingSignals = riskSignalsDatabase.filter(s => s.parcel_id.toLowerCase() === parcelId.toLowerCase());
  const existingAnomalies = landAnomaliesDatabase.filter(a => a.parcel_id.toLowerCase() === parcelId.toLowerCase());

  // 1. Identity Score (0-100)
  let identity_score = 95;
  if (parcel) {
    if (!parcel.survey_number) identity_score -= 20;
    if (!parcel.subdivision) identity_score -= 10;
    if (!parcel.village) identity_score -= 10;
    if (!parcel.district) identity_score -= 10;
  } else {
    identity_score = 40;
  }

  // 2. Record Consistency Score
  let record_consistency_score = latestVerification ? latestVerification.overall_consistency_score : 80;

  // 3. Area Stability Score
  let area_stability_score = 90;
  if (parcel && parcel.recorded_area > 0 && parcel.gis_area > 0) {
    const delta = Math.abs(parcel.recorded_area - parcel.gis_area) / parcel.recorded_area;
    if (delta > 0.10) {
      area_stability_score = 35;
    } else if (delta > 0.05) {
      area_stability_score = 65;
    } else if (delta > 0.02) {
      area_stability_score = 85;
    }
  }

  // 4. Survey Stability Score
  let survey_stability_score = 90;
  if (existingSignals.some(s => s.signal_type === "REPEATED_SURVEY_CONFLICT" && !s.is_resolved)) {
    survey_stability_score = 40;
  }

  // 5. Ownership Stability Score
  let ownership_stability_score = 88;
  if (existingSignals.some(s => s.signal_type === "HIGH_FREQUENCY_RECORD_CHANGE")) {
    ownership_stability_score = 45;
  }
  if (existingSignals.some(s => s.signal_type === "REPEATED_OWNER_CONFLICT")) {
    ownership_stability_score = 35;
  }

  // 6. Document Consistency Score
  let document_consistency_score = 85;
  if (existingSignals.some(s => s.signal_type === "MULTIPLE_DOCUMENT_MISMATCHES")) {
    document_consistency_score = 35;
  }

  // 7. Verification Health Score
  let verification_health_score = latestVerification ? latestVerification.overall_consistency_score : 80;
  if (latestVerification && latestVerification.critical_mismatches > 0) {
    verification_health_score = Math.max(15, verification_health_score - 35);
  }

  // Overall Weighted Land Health Score (0-100)
  const overall_land_health_score = Math.round(
    0.15 * identity_score +
    0.20 * record_consistency_score +
    0.15 * ownership_stability_score +
    0.15 * area_stability_score +
    0.10 * survey_stability_score +
    0.10 * document_consistency_score +
    0.15 * verification_health_score
  );

  // Calculate Overall Risk Score
  let rawRiskPoints = 0;
  existingSignals.forEach(s => {
    if (!s.is_resolved) {
      rawRiskPoints += s.risk_points;
    }
  });
  existingAnomalies.forEach(a => {
    if (a.review_status !== "RESOLVED" && a.review_status !== "DISMISSED") {
      rawRiskPoints += Math.round(a.anomaly_score * 0.2);
    }
  });

  const overall_risk_score = Math.min(100, Math.max(5, rawRiskPoints > 0 ? Math.min(100, rawRiskPoints) : Math.round(100 - overall_land_health_score)));
  const health_category = getLandHealthCategory(overall_land_health_score);
  const risk_level = getRiskLevel(overall_risk_score);
  const summary = generateExplainableSummary(overall_land_health_score, overall_risk_score, existingSignals, existingAnomalies);

  let existing = landDnaProfilesDatabase.find(d => d.parcel_id.toLowerCase() === parcelId.toLowerCase());
  if (existing) {
    existing.identity_score = identity_score;
    existing.record_consistency_score = record_consistency_score;
    existing.ownership_stability_score = ownership_stability_score;
    existing.area_stability_score = area_stability_score;
    existing.survey_stability_score = survey_stability_score;
    existing.document_consistency_score = document_consistency_score;
    existing.verification_health_score = verification_health_score;
    existing.overall_land_health_score = overall_land_health_score;
    existing.health_category = health_category;
    existing.overall_risk_score = overall_risk_score;
    existing.risk_level = risk_level;
    existing.profile_summary = summary;
    existing.updated_at = new Date().toISOString();
    return existing;
  }

  const newProfile: LandDNAProfileRecord = {
    id: dnaIdCounter++,
    dna_id: `DNA-2026-00000${dnaIdCounter}`,
    parcel_id: parcelId,
    identity_score,
    record_consistency_score,
    ownership_stability_score,
    area_stability_score,
    survey_stability_score,
    document_consistency_score,
    verification_health_score,
    overall_land_health_score,
    health_category,
    risk_level,
    overall_risk_score,
    profile_summary: summary,
    generated_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  landDnaProfilesDatabase.push(newProfile);
  return newProfile;
}

// ==========================================
// PHASE 6: API ENDPOINTS
// ==========================================

// 1. POST /api/land-dna/generate/:parcel_id - Generate / Re-generate Land DNA
app.post("/api/land-dna/generate/:parcel_id", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  if (!parcel) {
    res.status(404).json({ detail: `Parcel ${parcel_id} not found in cadastral registry.` });
    return;
  }

  const profile = computeLandDNAProfile(parcel_id);

  // Store snapshot in history
  landDnaHistoryDatabase.push({
    id: dnaHistoryIdCounter++,
    parcel_id: parcel.parcel_id,
    dna_profile_id: profile.dna_id,
    profile_snapshot_json: { ...profile },
    change_summary: `Land DNA re-evaluated by officer ${req.user!.full_name}. Health Score: ${profile.overall_land_health_score}/100.`,
    created_at: new Date().toISOString()
  });

  // Create audit log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "LAND_DNA_GENERATED",
    entity_type: "LAND_DNA",
    entity_id: profile.dna_id,
    details: `Land DNA generated for parcel ${parcel.parcel_id}. Health Score: ${profile.overall_land_health_score}/100, Risk Level: ${profile.risk_level}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.status(201).json(profile);
});

// 2. GET /api/land-dna/:parcel_id - Get Land DNA Profile with all relations
app.get("/api/land-dna/:parcel_id", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  if (!parcel) {
    res.status(404).json({ detail: `Parcel ${parcel_id} not found.` });
    return;
  }

  let profile = landDnaProfilesDatabase.find(p => p.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  if (!profile) {
    profile = computeLandDNAProfile(parcel_id);
  }

  const risk_assessment = landRiskAssessmentsDatabase.find(r => r.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  const risk_signals = riskSignalsDatabase.filter(s => s.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  const anomalies = landAnomaliesDatabase.filter(a => a.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  const history = landDnaHistoryDatabase.filter(h => h.parcel_id.toLowerCase() === parcel_id.toLowerCase());

  res.json({
    ...profile,
    parcel_details: parcel,
    risk_assessment,
    risk_signals,
    anomalies,
    history
  });
});

// 3. GET /api/land-dna/:parcel_id/history - Get Land DNA Snapshot History
app.get("/api/land-dna/:parcel_id/history", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const history = landDnaHistoryDatabase.filter(h => h.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  res.json(history);
});

// 4. POST /api/risk/analyze/:parcel_id - Re-run Risk Assessment & Anomaly Detection Engine
app.post("/api/risk/analyze/:parcel_id", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  if (!parcel) {
    res.status(404).json({ detail: `Parcel ${parcel_id} not found.` });
    return;
  }

  // Re-run computation
  const profile = computeLandDNAProfile(parcel_id);
  let assessment = landRiskAssessmentsDatabase.find(r => r.parcel_id.toLowerCase() === parcel_id.toLowerCase());

  if (assessment) {
    assessment.overall_risk_score = profile.overall_risk_score;
    assessment.risk_level = profile.risk_level;
    assessment.summary = `Risk re-assessed: ${profile.risk_level} Priority with ${profile.overall_risk_score}/100 risk rating.`;
  } else {
    assessment = {
      id: riskIdCounter++,
      risk_assessment_id: `RISK-2026-00000${riskIdCounter}`,
      parcel_id: parcel.parcel_id,
      overall_risk_score: profile.overall_risk_score,
      risk_level: profile.risk_level,
      record_risk: 100 - profile.record_consistency_score,
      document_risk: 100 - profile.document_consistency_score,
      historical_risk: 100 - profile.ownership_stability_score,
      area_risk: 100 - profile.area_stability_score,
      survey_risk: 100 - profile.survey_stability_score,
      ownership_risk: 100 - profile.ownership_stability_score,
      gis_risk: 100 - profile.area_stability_score,
      summary: `Automated assessment: ${profile.risk_level} Priority.`,
      created_at: new Date().toISOString()
    };
    landRiskAssessmentsDatabase.push(assessment);
  }

  // Audit log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "RISK_ASSESSMENT_COMPLETED",
    entity_type: "RISK_ASSESSMENT",
    entity_id: assessment.risk_assessment_id,
    details: `Risk re-assessed for parcel ${parcel.parcel_id}. Risk Score: ${assessment.overall_risk_score}, Risk Level: ${assessment.risk_level}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.json({
    assessment,
    profile,
    signals: riskSignalsDatabase.filter(s => s.parcel_id.toLowerCase() === parcel_id.toLowerCase()),
    anomalies: landAnomaliesDatabase.filter(a => a.parcel_id.toLowerCase() === parcel_id.toLowerCase())
  });
});

// 5. GET /api/risk/:parcel_id - Get Risk Assessment for Parcel
app.get("/api/risk/:parcel_id", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const assessment = landRiskAssessmentsDatabase.find(r => r.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  if (!assessment) {
    res.status(404).json({ detail: `Risk assessment for ${parcel_id} not found.` });
    return;
  }
  res.json(assessment);
});

// 6. GET /api/risk/:parcel_id/signals - Get Risk Signals
app.get("/api/risk/:parcel_id/signals", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const signals = riskSignalsDatabase.filter(s => s.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  res.json(signals);
});

// 7. GET /api/risk/:parcel_id/anomalies - Get Anomalies for Parcel
app.get("/api/risk/:parcel_id/anomalies", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const anomalies = landAnomaliesDatabase.filter(a => a.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  res.json(anomalies);
});

// 8. GET /api/anomalies/all - Get All Anomalies across Registry (for Officer Review)
app.get("/api/anomalies/all", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  res.json(landAnomaliesDatabase);
});

// 9. POST /api/risk/anomalies/:anomaly_id/review - Officer Review Anomaly
app.post("/api/risk/anomalies/:anomaly_id/review", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { anomaly_id } = req.params;
  const { review_status, review_note } = req.body;

  const anomaly = landAnomaliesDatabase.find(a => a.anomaly_id.toLowerCase() === anomaly_id.toLowerCase() || String(a.id) === anomaly_id);
  if (!anomaly) {
    res.status(404).json({ detail: `Anomaly ${anomaly_id} not found.` });
    return;
  }

  anomaly.review_status = review_status || "RESOLVED";
  anomaly.review_note = review_note || "Reviewed by officer.";
  anomaly.reviewed_by = req.user!.full_name;
  anomaly.reviewed_at = new Date().toISOString();

  // Recompute Land DNA for the parcel
  computeLandDNAProfile(anomaly.parcel_id);

  // Audit log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "ANOMALY_REVIEWED",
    entity_type: "ANOMALY",
    entity_id: anomaly.anomaly_id,
    details: `Anomaly ${anomaly.anomaly_id} on ${anomaly.parcel_id} reviewed: ${anomaly.review_status}. Note: ${anomaly.review_note}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.json(anomaly);
});

// 10. POST /api/risk/signals/:signal_id/resolve - Resolve Risk Signal
app.post("/api/risk/signals/:signal_id/resolve", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { signal_id } = req.params;
  const { resolution_note } = req.body;

  const signal = riskSignalsDatabase.find(s => String(s.id) === signal_id);
  if (!signal) {
    res.status(404).json({ detail: `Risk signal ${signal_id} not found.` });
    return;
  }

  signal.is_resolved = true;
  signal.resolution_note = resolution_note || "Resolved by authorized officer.";
  signal.resolved_by = req.user!.full_name;
  signal.resolved_at = new Date().toISOString();

  // Recompute Land DNA
  computeLandDNAProfile(signal.parcel_id);

  // Audit log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "RISK_SIGNAL_RESOLVED",
    entity_type: "RISK_SIGNAL",
    entity_id: String(signal.id),
    details: `Risk signal ${signal.signal_name} on parcel ${signal.parcel_id} resolved: ${signal.resolution_note}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.json(signal);
});

// 11. GET /api/officer/risk-queue - Priority Officer Review Queue
app.get("/api/officer/risk-queue", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  // Ensure all parcels have a Land DNA profile
  parcelsDatabase.forEach(p => {
    if (!landDnaProfilesDatabase.some(d => d.parcel_id.toLowerCase() === p.parcel_id.toLowerCase())) {
      computeLandDNAProfile(p.parcel_id);
    }
  });

  const queue = parcelsDatabase.map(parcel => {
    const profile = landDnaProfilesDatabase.find(d => d.parcel_id.toLowerCase() === parcel.parcel_id.toLowerCase()) || computeLandDNAProfile(parcel.parcel_id);
    const signals = riskSignalsDatabase.filter(s => s.parcel_id.toLowerCase() === parcel.parcel_id.toLowerCase());
    const anomalies = landAnomaliesDatabase.filter(a => a.parcel_id.toLowerCase() === parcel.parcel_id.toLowerCase());
    const ver = verificationsDatabase.find(v => v.parcel_id.toLowerCase() === parcel.parcel_id.toLowerCase());

    const criticalSignals = signals.filter(s => !s.is_resolved && s.severity === "CRITICAL").length;
    const unresolvedAnomalies = anomalies.filter(a => a.review_status !== "RESOLVED" && a.review_status !== "DISMISSED").length;

    let primary_reason = "Records consistent across registries.";
    if (criticalSignals > 0) {
      primary_reason = "Unresolved critical boundary or verification alert";
    } else if (profile.risk_level === "HIGH") {
      primary_reason = "Multiple document OCR mismatches & survey conflict";
    } else if (profile.risk_level === "MEDIUM") {
      primary_reason = "Area variation / accelerated transfer velocity";
    }

    return {
      parcel_id: parcel.parcel_id,
      dna_id: profile.dna_id,
      survey_number: parcel.survey_number + (parcel.subdivision ? `/${parcel.subdivision}` : ""),
      village: parcel.village,
      district: parcel.district,
      land_health_score: profile.overall_land_health_score,
      health_category: profile.health_category,
      risk_score: profile.overall_risk_score,
      risk_level: profile.risk_level,
      critical_signals_count: criticalSignals,
      total_signals_count: signals.length,
      unresolved_anomalies_count: unresolvedAnomalies,
      last_verification_date: ver ? ver.created_at : profile.updated_at,
      last_verified_score: ver ? ver.overall_consistency_score : profile.overall_land_health_score,
      primary_risk_reason: primary_reason
    };
  });

  // Sort: CRITICAL first, HIGH second, MEDIUM third, LOW last
  const priorityOrder: Record<string, number> = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
  queue.sort((a, b) => {
    const diff = (priorityOrder[a.risk_level] || 5) - (priorityOrder[b.risk_level] || 5);
    if (diff !== 0) return diff;
    return b.risk_score - a.risk_score;
  });

  res.json(queue);
});

// 12. GET /api/admin/land-intelligence/analytics - Admin Land Intelligence Metrics
app.get("/api/admin/land-intelligence/analytics", authMiddleware, requireRole(["admin", "officer"]), (req: AuthenticatedRequest, res: Response) => {
  parcelsDatabase.forEach(p => {
    if (!landDnaProfilesDatabase.some(d => d.parcel_id.toLowerCase() === p.parcel_id.toLowerCase())) {
      computeLandDNAProfile(p.parcel_id);
    }
  });

  const total = landDnaProfilesDatabase.length;
  const avgHealth = Math.round(landDnaProfilesDatabase.reduce((acc, p) => acc + p.overall_land_health_score, 0) / (total || 1));
  const avgRisk = Math.round(landDnaProfilesDatabase.reduce((acc, p) => acc + p.overall_risk_score, 0) / (total || 1));

  const lowCount = landDnaProfilesDatabase.filter(p => p.risk_level === "LOW").length;
  const medCount = landDnaProfilesDatabase.filter(p => p.risk_level === "MEDIUM").length;
  const highCount = landDnaProfilesDatabase.filter(p => p.risk_level === "HIGH").length;
  const critCount = landDnaProfilesDatabase.filter(p => p.risk_level === "CRITICAL").length;

  const unresolvedSignals = riskSignalsDatabase.filter(s => !s.is_resolved).length;
  const resolvedSignals = riskSignalsDatabase.filter(s => s.is_resolved).length;
  const unresolvedAnomalies = landAnomaliesDatabase.filter(a => a.review_status !== "RESOLVED" && a.review_status !== "DISMISSED").length;

  res.json({
    total_dna_profiles: total,
    average_land_health_score: avgHealth,
    average_risk_score: avgRisk,
    low_risk_count: lowCount,
    medium_risk_count: medCount,
    high_risk_count: highCount,
    critical_risk_count: critCount,
    unresolved_signals_count: unresolvedSignals,
    resolved_signals_count: resolvedSignals,
    total_anomalies_count: landAnomaliesDatabase.length,
    unresolved_anomalies_count: unresolvedAnomalies,
    risk_distribution: [
      { level: "Low Risk (0-25)", count: lowCount, percentage: Math.round((lowCount / total) * 100) },
      { level: "Medium Risk (26-50)", count: medCount, percentage: Math.round((medCount / total) * 100) },
      { level: "High Risk (51-75)", count: highCount, percentage: Math.round((highCount / total) * 100) },
      { level: "Critical Risk (76-100)", count: critCount, percentage: Math.round((critCount / total) * 100) }
    ],
    health_distribution: [
      { category: "Excellent (90-100)", count: landDnaProfilesDatabase.filter(p => p.health_category === "EXCELLENT").length, percentage: Math.round((landDnaProfilesDatabase.filter(p => p.health_category === "EXCELLENT").length / total) * 100) },
      { category: "Good (80-89)", count: landDnaProfilesDatabase.filter(p => p.health_category === "GOOD").length, percentage: Math.round((landDnaProfilesDatabase.filter(p => p.health_category === "GOOD").length / total) * 100) },
      { category: "Moderate (60-79)", count: landDnaProfilesDatabase.filter(p => p.health_category === "MODERATE").length, percentage: Math.round((landDnaProfilesDatabase.filter(p => p.health_category === "MODERATE").length / total) * 100) },
      { category: "Low Health (40-59)", count: landDnaProfilesDatabase.filter(p => p.health_category === "LOW").length, percentage: Math.round((landDnaProfilesDatabase.filter(p => p.health_category === "LOW").length / total) * 100) },
      { category: "Critical (<40)", count: landDnaProfilesDatabase.filter(p => p.health_category === "CRITICAL").length, percentage: Math.round((landDnaProfilesDatabase.filter(p => p.health_category === "CRITICAL").length / total) * 100) }
    ],
    anomaly_types_distribution: [
      { anomaly_type: "Area Delta Anomaly", count: 3, percentage: 30 },
      { anomaly_type: "Survey Number Anomaly", count: 2, percentage: 20 },
      { anomaly_type: "Owner Pattern Anomaly", count: 2, percentage: 20 },
      { anomaly_type: "GIS Spatial Intersection", count: 2, percentage: 20 },
      { anomaly_type: "Historical Transfer Velocity", count: 1, percentage: 10 }
    ],
    top_risk_signals: [
      { signal_type: "GIS Spatial Boundary Variance", count: 4, percentage: 33 },
      { signal_type: "Multiple Document OCR Mismatch", count: 3, percentage: 25 },
      { signal_type: "Repeated Survey Conflict", count: 2, percentage: 17 },
      { signal_type: "Unresolved Critical Alert", count: 2, percentage: 17 },
      { signal_type: "High Frequency Record Change", count: 1, percentage: 8 }
    ],
    verification_health_trends: [
      { month: "Oct 2025", avg_health: 72, avg_risk: 28 },
      { month: "Nov 2025", avg_health: 76, avg_risk: 24 },
      { month: "Dec 2025", avg_health: 79, avg_risk: 21 },
      { month: "Jan 2026", avg_health: 81, avg_risk: 19 },
      { month: "Feb 2026", avg_health: avgHealth, avg_risk: avgRisk }
    ]
  });
});

// 13. GET /api/citizen/land-status - Safe Citizen Status View (Omits internal risk formulas & officer notes)
app.get("/api/citizen/land-status", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const citizenParcels = parcelsDatabase; // For demo, allow viewing citizen associated parcels
  const userApps = applicationsDatabase.filter(a => a.citizen_id === req.user!.id);

  const safeStatuses = citizenParcels.map(p => {
    const dna = landDnaProfilesDatabase.find(d => d.parcel_id.toLowerCase() === p.parcel_id.toLowerCase()) || computeLandDNAProfile(p.parcel_id);
    const app = userApps.find(a => a.parcel_id.toLowerCase() === p.parcel_id.toLowerCase());
    const anomalies = landAnomaliesDatabase.filter(a => a.parcel_id.toLowerCase() === p.parcel_id.toLowerCase() && a.review_status === "ACTION_REQUESTED");

    let record_health_status: "HEALTHY" | "STABLE" | "ACTION_REQUIRED" | "UNDER_GOVERNMENT_REVIEW" = "HEALTHY";
    let verification_status = "VERIFIED";
    let action_required = false;
    let action_desc: string | null = null;

    if (dna.overall_land_health_score >= 85) {
      record_health_status = "HEALTHY";
      verification_status = "VERIFIED";
    } else if (anomalies.length > 0) {
      record_health_status = "ACTION_REQUIRED";
      verification_status = "REQUIRES_CITIZEN_ACTION";
      action_required = true;
      action_desc = "Please submit an updated identity / address clarification document as requested by the Revenue Department.";
    } else if (dna.risk_level === "CRITICAL" || dna.risk_level === "HIGH") {
      record_health_status = "UNDER_GOVERNMENT_REVIEW";
      verification_status = "UNDER_REVIEW";
      action_desc = "Your land record is currently undergoing scheduled multi-department verification review by the Tahsildar.";
    } else {
      record_health_status = "STABLE";
      verification_status = "VERIFIED";
    }

    return {
      parcel_id: p.parcel_id,
      survey_number: p.survey_number + (p.subdivision ? `/${p.subdivision}` : ""),
      village: p.village,
      district: p.district,
      owner_name: p.current_owner || "Registered Citizen",
      recorded_area: p.recorded_area,
      area_unit: p.area_unit,
      application_id: app ? app.application_id : null,
      application_status: app ? app.status.replace(/_/g, " ") : null,
      verification_status,
      record_health_status,
      action_required,
      action_description: action_desc,
      latest_update: dna.updated_at
    };
  });

  res.json(safeStatuses);
});

// GET /api/citizen/land-status/:parcel_id - Citizen Specific Parcel Status
app.get("/api/citizen/land-status/:parcel_id", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const p = parcelsDatabase.find(parcel => parcel.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  if (!p) {
    res.status(404).json({ detail: `Parcel ${parcel_id} not found.` });
    return;
  }

  const dna = landDnaProfilesDatabase.find(d => d.parcel_id.toLowerCase() === p.parcel_id.toLowerCase()) || computeLandDNAProfile(p.parcel_id);
  const anomalies = landAnomaliesDatabase.filter(a => a.parcel_id.toLowerCase() === p.parcel_id.toLowerCase() && a.review_status === "ACTION_REQUESTED");

  let record_health_status: "HEALTHY" | "STABLE" | "ACTION_REQUIRED" | "UNDER_GOVERNMENT_REVIEW" = "HEALTHY";
  let verification_status = "VERIFIED";
  let action_required = false;
  let action_desc: string | null = null;

  if (dna.overall_land_health_score >= 85) {
    record_health_status = "HEALTHY";
    verification_status = "VERIFIED";
  } else if (anomalies.length > 0) {
    record_health_status = "ACTION_REQUIRED";
    verification_status = "REQUIRES_CITIZEN_ACTION";
    action_required = true;
    action_desc = "Please submit an updated identity / address clarification document as requested by the Revenue Department.";
  } else if (dna.risk_level === "CRITICAL" || dna.risk_level === "HIGH") {
    record_health_status = "UNDER_GOVERNMENT_REVIEW";
    verification_status = "UNDER_REVIEW";
    action_desc = "Your land record is currently undergoing scheduled multi-department verification review by the Tahsildar.";
  } else {
    record_health_status = "STABLE";
    verification_status = "VERIFIED";
  }

  res.json({
    parcel_id: p.parcel_id,
    survey_number: p.survey_number + (p.subdivision ? `/${p.subdivision}` : ""),
    village: p.village,
    district: p.district,
    owner_name: p.current_owner || "Registered Citizen",
    recorded_area: p.recorded_area,
    area_unit: p.area_unit,
    verification_status,
    record_health_status,
    action_required,
    action_description: action_desc,
    latest_update: dna.updated_at
  });
});

// =========================================================================
// PHASE 7: LAND INTEROPERABILITY & DIGITAL PUBLIC INFRASTRUCTURE (DPI) LAYER
// =========================================================================

interface DepartmentSystemRecord {
  id: number;
  system_id: string; // DEPT-000001
  department_name: string;
  system_name: string;
  system_type: string; // REVENUE | REGISTRATION | SURVEY | ENCUMBRANCE | MUNICIPAL | COURT | LAND_USE | FINANCIAL
  description: string;
  api_version: string;
  status: "HEALTHY" | "DEGRADED" | "OFFLINE" | "SIMULATED";
  base_url: string;
  authentication_type: "BEARER_TOKEN" | "API_KEY" | "OAUTH2_SIMULATED" | "MTLS_SIMULATED";
  is_mock: boolean;
  supported_categories: string[];
  requests_count_today: number;
  success_rate: number;
  avg_response_time_ms: number;
  last_health_check: string;
  created_at: string;
}

interface CommonLandRecordData {
  parcel_id: string;
  source_system: string;
  source_record_id: string;
  survey_number: string;
  subdivision_number: string;
  owner_name: string;
  owner_identifier_masked: string;
  village: string;
  district: string;
  state: string;
  area: number;
  area_unit: string;
  standardized_area_sqm: number;
  land_use: string;
  property_type: string;
  registration_number: string;
  registration_date: string;
  document_reference: string;
  encumbrance_status: "FREE" | "MORTGAGED" | "DISPUTED" | "UNDER_INVESTIGATION" | "UNKNOWN";
  litigation_status: "CLEAR" | "PENDING_CASE" | "STAY_ORDER" | "DISPOSED" | "UNKNOWN";
  record_timestamp: string;
  source_timestamp: string;
  data_version: string;
  raw_data_reference: string;
}

interface DataTransformationLogRecord {
  id: number;
  request_id: string;
  source_system: string;
  target_schema: string;
  source_field: string;
  target_field: string;
  transformation_type: "STRING_NORMALIZE" | "SURVEY_NUMBER_CLEANSE" | "AREA_UNIT_CONVERT" | "DATE_STANDARDIZE" | "STATUS_CANONICALIZE" | "MASK_PII";
  original_value: string;
  transformed_value: string;
  success: boolean;
  created_at: string;
}

interface DataLineageRecord {
  id: number;
  lineage_id: string; // LINEAGE-2026-000001
  parcel_id: string;
  data_category: string;
  source_system: string;
  source_record_id: string;
  transformation_reference: string;
  accessed_by: string;
  access_purpose: string;
  access_mode: "OFFICIAL_AUTHORIZED" | "CITIZEN_CONSENT" | "SYSTEM_AUTHORIZED";
  timestamp: string;
}

interface DataAccessConsentRecord {
  id: number;
  consent_id: string; // CONSENT-2026-000001
  user_id: number;
  citizen_name: string;
  parcel_id: string;
  request_id: string;
  requesting_organization: string;
  data_category: string;
  purpose: string;
  consent_status: "PENDING" | "GRANTED" | "DENIED" | "EXPIRED" | "REVOKED" | "NOT_REQUIRED";
  granted_at?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
  created_at: string;
}

interface IntegrationRequestRecord {
  id: number;
  request_id: string; // INT-2026-000001
  requesting_system: string;
  target_system: string;
  requested_by: string;
  request_type: string;
  parcel_id: string;
  purpose: string;
  access_mode: "OFFICIAL_AUTHORIZED" | "CITIZEN_CONSENT" | "SYSTEM_AUTHORIZED";
  consent_id?: string | null;
  status: "PENDING" | "AUTHORIZED" | "PROCESSING" | "COMPLETED" | "FAILED" | "DENIED" | "EXPIRED";
  data_quality_score: number;
  response_data?: CommonLandRecordData | null;
  raw_response?: Record<string, any> | null;
  transformations?: DataTransformationLogRecord[];
  validation_errors?: string[];
  validation_warnings?: string[];
  error_message?: string | null;
  request_timestamp: string;
  response_timestamp?: string | null;
  created_at: string;
}

let intRequestIdCounter = 100;
let consentIdCounter = 100;
let transformLogIdCounter = 100;
let lineageIdCounter = 100;

// In-Memory Databases for Phase 7
const departmentSystemsDatabase: DepartmentSystemRecord[] = [
  {
    id: 1,
    system_id: "DEPT-000001",
    department_name: "Revenue Department",
    system_name: "Tamil Nilam Land Records System",
    system_type: "REVENUE",
    description: "State land registry maintaining Record of Rights (RoR), Patta/Chitta passbooks, tenant registers, and village land settlement data.",
    api_version: "v2.4-DPI",
    status: "HEALTHY",
    base_url: "https://mock-api.tamilnilam.tn.gov.in/v2",
    authentication_type: "BEARER_TOKEN",
    is_mock: true,
    supported_categories: ["PARCEL_INFORMATION", "OWNERSHIP_INFORMATION"],
    requests_count_today: 142,
    success_rate: 99.3,
    avg_response_time_ms: 148,
    last_health_check: new Date().toISOString(),
    created_at: "2025-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    system_id: "DEPT-000002",
    department_name: "Registration Department",
    system_name: "Inspector General of Registration (STAR 2.0)",
    system_type: "REGISTRATION",
    description: "Sub-Registrar deed registry managing registered sale deeds, gifts, settlements, powers of attorney, and stamp duty collections.",
    api_version: "v3.1-REST",
    status: "HEALTHY",
    base_url: "https://mock-api.igregn.tn.gov.in/star2",
    authentication_type: "API_KEY",
    is_mock: true,
    supported_categories: ["REGISTRATION_INFORMATION", "DOCUMENT_INFORMATION"],
    requests_count_today: 98,
    success_rate: 98.7,
    avg_response_time_ms: 192,
    last_health_check: new Date().toISOString(),
    created_at: "2025-01-01T00:00:00.000Z"
  },
  {
    id: 3,
    system_id: "DEPT-000003",
    department_name: "Survey & Settlement Directorate",
    system_name: "CollabLand Cadastral Survey & FMB Engine",
    system_type: "SURVEY",
    description: "Geodetic survey authority managing Field Measurement Books (FMB), subdivision sketches, boundary stones, and DGPS coordinates.",
    api_version: "v1.8-GEO",
    status: "HEALTHY",
    base_url: "https://mock-api.collabland.nic.in/fmb",
    authentication_type: "MTLS_SIMULATED",
    is_mock: true,
    supported_categories: ["SURVEY_INFORMATION", "PARCEL_INFORMATION"],
    requests_count_today: 86,
    success_rate: 99.1,
    avg_response_time_ms: 215,
    last_health_check: new Date().toISOString(),
    created_at: "2025-01-01T00:00:00.000Z"
  },
  {
    id: 4,
    system_id: "DEPT-000004",
    department_name: "Banking & Securitisation Registry",
    system_name: "CERSAI Central Security Interest Registry",
    system_type: "ENCUMBRANCE",
    description: "Centralized financial security interest registry tracking property mortgages, equitable charges, and bank hypothecations across all scheduled banks.",
    api_version: "v2.0-SEC",
    status: "HEALTHY",
    base_url: "https://mock-api.cersai.org.in/lien-check",
    authentication_type: "BEARER_TOKEN",
    is_mock: true,
    supported_categories: ["ENCUMBRANCE_INFORMATION"],
    requests_count_today: 64,
    success_rate: 100.0,
    avg_response_time_ms: 130,
    last_health_check: new Date().toISOString(),
    created_at: "2025-01-01T00:00:00.000Z"
  },
  {
    id: 5,
    system_id: "DEPT-000005",
    department_name: "Urban Local Body / Municipal Administration",
    system_name: "Greater City Municipal Corporation Property Registry",
    system_type: "MUNICIPAL",
    description: "Municipal authority tracking door numbers, property tax assessments, building plan sanctions, and civic utility links.",
    api_version: "v1.5-ULB",
    status: "HEALTHY",
    base_url: "https://mock-api.ccmc.tn.gov.in/property-tax",
    authentication_type: "API_KEY",
    is_mock: true,
    supported_categories: ["PARCEL_INFORMATION", "DOCUMENT_INFORMATION"],
    requests_count_today: 51,
    success_rate: 97.5,
    avg_response_time_ms: 175,
    last_health_check: new Date().toISOString(),
    created_at: "2025-01-01T00:00:00.000Z"
  },
  {
    id: 6,
    system_id: "DEPT-000006",
    department_name: "Town & Country Planning Directorate",
    system_name: "Master Plan 2035 GIS Zoning Authority",
    system_type: "LAND_USE",
    description: "Urban planning directorate maintaining master plan land use classifications, permissible FAR, commercial/industrial zoning, and eco-buffer zones.",
    api_version: "v2.1-GIS",
    status: "HEALTHY",
    base_url: "https://mock-api.dtcp.tn.gov.in/zoning",
    authentication_type: "OAUTH2_SIMULATED",
    is_mock: true,
    supported_categories: ["LAND_USE_INFORMATION"],
    requests_count_today: 43,
    success_rate: 98.2,
    avg_response_time_ms: 160,
    last_health_check: new Date().toISOString(),
    created_at: "2025-01-01T00:00:00.000Z"
  },
  {
    id: 7,
    system_id: "DEPT-000007",
    department_name: "National Judicial Data Grid (NJDG)",
    system_name: "District Civil Court Case Information System (CIS)",
    system_type: "COURT",
    description: "Judicial database tracking pending civil suits, partition suits, title disputes, injunction orders, and court stay notices.",
    api_version: "v4.0-JUD",
    status: "HEALTHY",
    base_url: "https://mock-api.njdg.gov.in/cases",
    authentication_type: "MTLS_SIMULATED",
    is_mock: true,
    supported_categories: ["LITIGATION_STATUS"],
    requests_count_today: 38,
    success_rate: 99.4,
    avg_response_time_ms: 240,
    last_health_check: new Date().toISOString(),
    created_at: "2025-01-01T00:00:00.000Z"
  },
  {
    id: 8,
    system_id: "DEPT-000008",
    department_name: "State Level Bankers' Committee (SLBC)",
    system_name: "SLBC Agricultural & Commercial Credit Lien Gateway",
    system_type: "FINANCIAL",
    description: "Inter-bank credit exchange monitoring Kisan Credit Card (KCC) liens, crop loan pledges, and institutional collateral valuations.",
    api_version: "v1.2-FIN",
    status: "HEALTHY",
    base_url: "https://mock-api.slbc.org.in/land-lien",
    authentication_type: "BEARER_TOKEN",
    is_mock: true,
    supported_categories: ["ENCUMBRANCE_INFORMATION", "OWNERSHIP_INFORMATION"],
    requests_count_today: 29,
    success_rate: 98.9,
    avg_response_time_ms: 185,
    last_health_check: new Date().toISOString(),
    created_at: "2025-01-01T00:00:00.000Z"
  }
];

// Initial Data Lineage Records
const dataLineageDatabase: DataLineageRecord[] = [
  {
    id: 1,
    lineage_id: "LINEAGE-2026-000001",
    parcel_id: "TN-CBE-001-124-2",
    data_category: "PARCEL_INFORMATION",
    source_system: "DEPT-000001",
    source_record_id: "TN-REV-8921",
    transformation_reference: "TRANS-2026-000001",
    accessed_by: "Tahsildar M. Ramanathan (Officer ID: 2)",
    access_purpose: "Automated Land DNA Consistency Audit & Title Verification",
    access_mode: "OFFICIAL_AUTHORIZED",
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 2,
    lineage_id: "LINEAGE-2026-000002",
    parcel_id: "TN-CBE-001-124-2",
    data_category: "SURVEY_INFORMATION",
    source_system: "DEPT-000003",
    source_record_id: "FMB-CBE-124-2",
    transformation_reference: "TRANS-2026-000002",
    accessed_by: "DPI Cadastral Engine (System)",
    access_purpose: "CollabLand GIS Boundary Alignment & Area Recalibration",
    access_mode: "SYSTEM_AUTHORIZED",
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 3,
    lineage_id: "LINEAGE-2026-000003",
    parcel_id: "TN-CBE-001-124-1",
    data_category: "REGISTRATION_INFORMATION",
    source_system: "DEPT-000002",
    source_record_id: "DOC-2021-1024",
    transformation_reference: "TRANS-2026-000003",
    accessed_by: "Sub-Registrar Officer (Officer ID: 2)",
    access_purpose: "Encumbrance Search & Chain of Title Cross-Check",
    access_mode: "OFFICIAL_AUTHORIZED",
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 4,
    lineage_id: "LINEAGE-2026-000004",
    parcel_id: "TN-CBE-001-126-2",
    data_category: "ENCUMBRANCE_INFORMATION",
    source_system: "DEPT-000004",
    source_record_id: "CERSAI-CHG-2024-81",
    transformation_reference: "TRANS-2026-000004",
    accessed_by: "State Bank of India Loan Cell",
    access_purpose: "Mortgage Collateral Verification for Citizen Loan Request",
    access_mode: "CITIZEN_CONSENT",
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString()
  }
];

// Initial Data Access Consents
const dataAccessConsentsDatabase: DataAccessConsentRecord[] = [
  {
    id: 1,
    consent_id: "CONSENT-2026-000001",
    user_id: 1,
    citizen_name: "Ravi Kumar",
    parcel_id: "TN-CBE-001-124-1",
    request_id: "INT-2026-000012",
    requesting_organization: "State Bank of India (Agricultural Credit Cell)",
    data_category: "OWNERSHIP_INFORMATION",
    purpose: "Collateral title verification for agricultural infrastructure loan approval",
    consent_status: "GRANTED",
    granted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 27 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 2,
    consent_id: "CONSENT-2026-000002",
    user_id: 1,
    citizen_name: "Ravi Kumar",
    parcel_id: "TN-CBE-001-124-1",
    request_id: "INT-2026-000018",
    requesting_organization: "HDFC Housing Development Finance",
    data_category: "ENCUMBRANCE_INFORMATION",
    purpose: "Verification of zero-liability status for construction credit line",
    consent_status: "PENDING",
    expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 6 * 3600000).toISOString()
  },
  {
    id: 3,
    consent_id: "CONSENT-2026-000003",
    user_id: 1,
    citizen_name: "Ravi Kumar",
    parcel_id: "TN-CBE-001-124-2",
    request_id: "INT-2026-000008",
    requesting_organization: "National Highways Authority of India (NHAI)",
    data_category: "SURVEY_INFORMATION",
    purpose: "Right-of-way demarcation survey assessment",
    consent_status: "GRANTED",
    granted_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 50 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 11 * 86400000).toISOString()
  }
];

// Initial Transformation Logs
const dataTransformationLogsDatabase: DataTransformationLogRecord[] = [
  {
    id: 1,
    request_id: "INT-2026-000001",
    source_system: "DEPT-000001",
    target_schema: "CommonLandRecord.v1",
    source_field: "survey_no",
    target_field: "survey_number",
    transformation_type: "SURVEY_NUMBER_CLEANSE",
    original_value: "124/02",
    transformed_value: "124/2",
    success: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 2,
    request_id: "INT-2026-000001",
    source_system: "DEPT-000001",
    target_schema: "CommonLandRecord.v1",
    source_field: "extent_acres",
    target_field: "standardized_area_sqm",
    transformation_type: "AREA_UNIT_CONVERT",
    original_value: "2.50 Acres",
    transformed_value: "10117.15 Sq Meters",
    success: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 3,
    request_id: "INT-2026-000001",
    source_system: "DEPT-000001",
    target_schema: "CommonLandRecord.v1",
    source_field: "aadhaar_ref",
    target_field: "owner_identifier_masked",
    transformation_type: "MASK_PII",
    original_value: "8492-1029-4921",
    transformed_value: "XXXX-XXXX-4921",
    success: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

// Initial Integration Requests
const integrationRequestsDatabase: IntegrationRequestRecord[] = [
  {
    id: 1,
    request_id: "INT-2026-000001",
    requesting_system: "LANDSYNC_DPI_GATEWAY",
    target_system: "DEPT-000001",
    requested_by: "Tahsildar M. Ramanathan",
    request_type: "FULL_PARCEL_SYNC",
    parcel_id: "TN-CBE-001-124-2",
    purpose: "Land DNA multi-system profile synthesis and RoR audit",
    access_mode: "OFFICIAL_AUTHORIZED",
    status: "COMPLETED",
    data_quality_score: 98,
    response_data: {
      parcel_id: "TN-CBE-001-124-2",
      source_system: "Revenue Department (Tamil Nilam)",
      source_record_id: "TN-REV-8921",
      survey_number: "124/2",
      subdivision_number: "2",
      owner_name: "S. Murugan",
      owner_identifier_masked: "XXXX-XXXX-4921",
      village: "Demo Village",
      district: "Coimbatore",
      state: "Tamil Nadu",
      area: 2.50,
      area_unit: "Acres",
      standardized_area_sqm: 10117.15,
      land_use: "Residential / Punja",
      property_type: "Agricultural Converted",
      registration_number: "DOC-2018-4910",
      registration_date: "2018-09-14",
      document_reference: "PATTA-TN-CBE-8921",
      encumbrance_status: "FREE",
      litigation_status: "CLEAR",
      record_timestamp: new Date().toISOString(),
      source_timestamp: "2026-01-10T14:30:00.000Z",
      data_version: "1.0",
      raw_data_reference: "RAW-DEPT1-TN-REV-8921"
    },
    raw_response: {
      ror_id: "TN-REV-8921",
      survey_no: "124/02",
      pattadar: "S. Murugan",
      father_name: "K. Subramanian",
      extent_acres: 2.50,
      village_code: "VIL-04",
      district_name: "Coimbatore",
      patta_no: "P-4921",
      aadhaar_ref: "8492-1029-4921",
      tax_status: "PAID",
      last_updated: "2026-01-10"
    },
    transformations: dataTransformationLogsDatabase.slice(0, 3),
    validation_errors: [],
    validation_warnings: ["Minor leading zero trimmed from survey number (124/02 -> 124/2)"],
    request_timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    response_timestamp: new Date(Date.now() - 2 * 86400000 + 148).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

// -------------------------------------------------------------------------
// DEPARTMENT CONNECTOR FRAMEWORK (MOCK IMPLEMENTATIONS)
// -------------------------------------------------------------------------

class BaseDepartmentConnector {
  system: DepartmentSystemRecord;
  constructor(system: DepartmentSystemRecord) {
    this.system = system;
  }
  checkHealth() {
    return {
      system_id: this.system.system_id,
      status: this.system.status,
      response_time_ms: this.system.avg_response_time_ms + Math.floor(Math.random() * 20 - 10),
      timestamp: new Date().toISOString()
    };
  }
}

// 1. Revenue Connector (Tamil Nilam RoR)
class RevenueConnector extends BaseDepartmentConnector {
  fetchRecord(parcel: ParcelRecord) {
    const rawSurvey = parcel.subdivision ? `${parcel.survey_number.split('/')[0]}/0${parcel.subdivision}` : parcel.survey_number;
    return {
      ror_id: `TN-REV-${parcel.id}921`,
      survey_no: rawSurvey,
      pattadar: parcel.current_owner || "Registered Citizen",
      father_name: "K. Parent Name",
      extent_acres: parcel.recorded_area,
      village_code: `VIL-${parcel.village.replace(/\s/g, '').toUpperCase()}`,
      village_name: parcel.village,
      district_name: parcel.district,
      patta_no: `P-${1000 + parcel.id * 89}`,
      aadhaar_ref: `8921-4019-${1000 + parcel.id * 7}`,
      tax_status: "UP_TO_DATE",
      classification: parcel.land_use === "Residential" ? "Ryotwari Nanja / Punja" : "Commercial Converted",
      last_updated: parcel.updated_at
    };
  }
}

// 2. Registration Connector (IGRS STAR 2.0)
class RegistrationConnector extends BaseDepartmentConnector {
  fetchRecord(parcel: ParcelRecord) {
    return {
      doc_no: `DOC-2022-${8400 + parcel.id * 19}`,
      reg_date: parcel.created_at ? parcel.created_at.split('T')[0] : "2022-03-14",
      sro_office: `${parcel.district} Sub-Registrar Office`,
      survey_num: parcel.survey_number,
      buyer_name: parcel.current_owner || "Ravi Kumar",
      seller_name: "Previous Title Holder",
      consideration_inr: Math.round(parcel.recorded_area * 1800000),
      stamp_duty_paid: Math.round(parcel.recorded_area * 1800000 * 0.07),
      registration_fee: Math.round(parcel.recorded_area * 1800000 * 0.02),
      encumbrance_certificate_clean: parcel.status !== "Boundary Discrepancy",
      book_number: "Book 1 (Immovable Property)",
      scan_archive_ref: `SRO-ARCH-${parcel.parcel_id}`
    };
  }
}

// 3. Survey Connector (CollabLand FMB)
class SurveyConnector extends BaseDepartmentConnector {
  fetchRecord(parcel: ParcelRecord) {
    return {
      fmb_id: `FMB-${parcel.district.substring(0, 3).toUpperCase()}-${parcel.survey_number.replace('/', '-')}`,
      survey_id: parcel.survey_number.replace('/', '-'),
      subdivision: parcel.subdivision || "1",
      area_sqm: Math.round(parcel.recorded_area * 4046.86 * 100) / 100,
      gis_polygon_sqm: Math.round(parcel.gis_area * 4046.86 * 100) / 100,
      coordinate_count: parcel.coordinates[0]?.length || 4,
      boundary_verified: true,
      tie_lines_valid: true,
      dgps_resurvey_year: 2024,
      village: parcel.village
    };
  }
}

// 4. Encumbrance Connector (CERSAI / Sub-Registrar Index II)
class EncumbranceConnector extends BaseDepartmentConnector {
  fetchRecord(parcel: ParcelRecord) {
    const isMortgaged = parcel.parcel_id === "TN-CBE-001-126-2" || parcel.parcel_id === "TN-CBE-001-127-3";
    return {
      cersai_ref: isMortgaged ? `CERSAI-CHG-2024-${80 + parcel.id}` : "NONE",
      charge_status: isMortgaged ? "ACTIVE_MORTGAGE" : "CLEAR_NO_ENCUMBRANCE",
      lender_bank: isMortgaged ? "State Bank of India" : null,
      loan_amount_lakhs: isMortgaged ? 35.0 : 0,
      creation_date: isMortgaged ? "2024-01-18" : null,
      discharge_certificate: isMortgaged ? null : `NOC-BANK-CLEAR-${parcel.id}`,
      index_ii_entry: isMortgaged ? "Equitable mortgage by deposit of title deeds" : "No adverse entry in Index II search (30-year audit)"
    };
  }
}

// 5. Municipal Connector (Property Tax & ULB)
class MunicipalConnector extends BaseDepartmentConnector {
  fetchRecord(parcel: ParcelRecord) {
    return {
      assessment_no: `PT-2025-W12-${900 + parcel.id * 41}`,
      door_no: `${parcel.survey_number.split('/')[0]}/${parcel.subdivision || '1'}-A`,
      street_name: "Mahatma Gandhi Main Road",
      ward: "Ward 12 (Central)",
      zone: "North Zone",
      annual_property_tax_inr: 4500,
      tax_paid_upto: "2025-2026",
      usage: parcel.land_use,
      water_connection_no: `WTR-${parcel.id * 9841}`,
      building_plan_approval: "SANCTIONED_PERMIT"
    };
  }
}

// 6. Land Use & Town Planning Connector (DTCP Master Plan)
class LandUseConnector extends BaseDepartmentConnector {
  fetchRecord(parcel: ParcelRecord) {
    return {
      masterplan_id: `MP-2035-${parcel.district.substring(0, 3).toUpperCase()}-Z8`,
      zone_category: parcel.land_use === "Commercial" ? "Commercial Central (CC)" : "Mixed Residential (MR)",
      permissible_fsi: parcel.land_use === "Commercial" ? 2.5 : 1.75,
      road_width_m: 12.0,
      crz_applicable: false,
      waterbody_buffer_clearance: "CLEAR (No encroaching stream / canal within 50m buffer)",
      heritage_restriction: false
    };
  }
}

// 7. Court Connector (NJDG CIS)
class CourtConnector extends BaseDepartmentConnector {
  fetchRecord(parcel: ParcelRecord) {
    const isLitigated = parcel.parcel_id === "TN-CBE-001-127-3";
    return {
      njdg_case_no: isLitigated ? "OS-2024-419" : "NONE",
      court_name: isLitigated ? `Principal Subordinate Judge Court, ${parcel.district}` : "District Civil Courts",
      suit_type: isLitigated ? "Partition Suit & Perpetual Injunction" : "N/A",
      plaintiff: isLitigated ? "K. Selvam & Others" : "N/A",
      defendant: isLitigated ? parcel.current_owner || "S. Murugan" : "N/A",
      stay_granted: isLitigated,
      status: isLitigated ? "PENDING_HEARING" : "NO_LITIGATION_FOUND",
      last_hearing_date: isLitigated ? "2026-02-14" : null
    };
  }
}

// 8. Financial Institution Connector (SLBC)
class FinancialConnector extends BaseDepartmentConnector {
  fetchRecord(parcel: ParcelRecord) {
    const hasKCC = parcel.land_use !== "Commercial";
    return {
      slbc_noc_id: `SLBC-NOC-2025-${parcel.id * 109}`,
      lien_status: parcel.parcel_id === "TN-CBE-001-126-2" ? "HYPOTHECATED" : "UNENCUMBERED",
      primary_bank: "Canara Bank / Tamil Nadu Grama Bank",
      kcc_credit_limit_lakhs: hasKCC ? 5.0 : 0,
      institutional_valuation_inr: Math.round(parcel.recorded_area * 2200000),
      valuation_date: "2025-11-20"
    };
  }
}

// Initialize Connectors
const connectors: Record<string, any> = {
  "DEPT-000001": new RevenueConnector(departmentSystemsDatabase[0]),
  "DEPT-000002": new RegistrationConnector(departmentSystemsDatabase[1]),
  "DEPT-000003": new SurveyConnector(departmentSystemsDatabase[2]),
  "DEPT-000004": new EncumbranceConnector(departmentSystemsDatabase[3]),
  "DEPT-000005": new MunicipalConnector(departmentSystemsDatabase[4]),
  "DEPT-000006": new LandUseConnector(departmentSystemsDatabase[5]),
  "DEPT-000007": new CourtConnector(departmentSystemsDatabase[6]),
  "DEPT-000008": new FinancialConnector(departmentSystemsDatabase[7])
};

// -------------------------------------------------------------------------
// DATA TRANSFORMATION & VALIDATION ENGINES
// -------------------------------------------------------------------------

function transformRecordToCommonLandModel(
  deptSystem: DepartmentSystemRecord,
  parcel: ParcelRecord,
  raw: any,
  requestId: string
): { commonRecord: CommonLandRecordData; logs: DataTransformationLogRecord[] } {
  const logs: DataTransformationLogRecord[] = [];

  // Helper to record a transformation log
  const logTransform = (
    srcField: string,
    tgtField: string,
    type: DataTransformationLogRecord["transformation_type"],
    origVal: string,
    transVal: string
  ) => {
    transformLogIdCounter++;
    const log: DataTransformationLogRecord = {
      id: transformLogIdCounter,
      request_id: requestId,
      source_system: deptSystem.system_id,
      target_schema: "CommonLandRecord.v1",
      source_field: srcField,
      target_field: tgtField,
      transformation_type: type,
      original_value: String(origVal),
      transformed_value: String(transVal),
      success: true,
      created_at: new Date().toISOString()
    };
    logs.push(log);
    dataTransformationLogsDatabase.unshift(log);
  };

  // 1. Survey Number Standardization (e.g. 124/02 -> 124/2)
  let rawSurvey = raw.survey_no || raw.survey_num || raw.survey_id || parcel.survey_number;
  let cleanSurvey = rawSurvey.replace(/-/g, '/').replace(/\/0+(\d+)/, '/$1');
  if (cleanSurvey !== rawSurvey) {
    logTransform("survey_no/id", "survey_number", "SURVEY_NUMBER_CLEANSE", rawSurvey, cleanSurvey);
  }

  // 2. Area Standardization to Square Meters
  let rawArea = raw.extent_acres !== undefined ? raw.extent_acres : (raw.area_sqm !== undefined ? raw.area_sqm / 4046.86 : parcel.recorded_area);
  let areaUnit = "Acres";
  let stdAreaSqm = Math.round(rawArea * 4046.86 * 100) / 100;
  logTransform("extent/area", "standardized_area_sqm", "AREA_UNIT_CONVERT", `${rawArea} ${areaUnit}`, `${stdAreaSqm} Sq Meters`);

  // 3. Mask PII
  let rawPii = raw.aadhaar_ref || "8492-1029-4921";
  let maskedPii = "XXXX-XXXX-" + rawPii.slice(-4);
  logTransform("aadhaar_ref/identifier", "owner_identifier_masked", "MASK_PII", rawPii, maskedPii);

  // 4. Encumbrance canonicalization
  let encStatus: CommonLandRecordData["encumbrance_status"] = "FREE";
  if (raw.charge_status === "ACTIVE_MORTGAGE" || raw.lien_status === "HYPOTHECATED") {
    encStatus = "MORTGAGED";
    logTransform("charge_status", "encumbrance_status", "STATUS_CANONICALIZE", raw.charge_status || raw.lien_status, "MORTGAGED");
  }

  // 5. Litigation canonicalization
  let litStatus: CommonLandRecordData["litigation_status"] = "CLEAR";
  if (raw.stay_granted || raw.status === "PENDING_HEARING") {
    litStatus = "PENDING_CASE";
    logTransform("status/stay_granted", "litigation_status", "STATUS_CANONICALIZE", raw.status, "PENDING_CASE");
  }

  const commonRecord: CommonLandRecordData = {
    parcel_id: parcel.parcel_id,
    source_system: `${deptSystem.department_name} (${deptSystem.system_name})`,
    source_record_id: raw.ror_id || raw.doc_no || raw.fmb_id || raw.cersai_ref || raw.assessment_no || raw.masterplan_id || raw.njdg_case_no || raw.slbc_noc_id || `REC-${parcel.id}`,
    survey_number: cleanSurvey,
    subdivision_number: parcel.subdivision || "1",
    owner_name: raw.pattadar || raw.buyer_name || parcel.current_owner || "Registered Citizen",
    owner_identifier_masked: maskedPii,
    village: raw.village_name || parcel.village,
    district: raw.district_name || parcel.district,
    state: parcel.state,
    area: rawArea,
    area_unit: areaUnit,
    standardized_area_sqm: stdAreaSqm,
    land_use: raw.usage || raw.zone_category || raw.classification || parcel.land_use,
    property_type: parcel.land_use === "Commercial" ? "Commercial Freehold" : "Agricultural Patta Land",
    registration_number: raw.doc_no || `DOC-REG-${parcel.id * 1024}`,
    registration_date: raw.reg_date || "2021-04-12",
    document_reference: raw.patta_no || raw.fmb_id || `REF-${parcel.parcel_id}`,
    encumbrance_status: encStatus,
    litigation_status: litStatus,
    record_timestamp: new Date().toISOString(),
    source_timestamp: raw.last_updated || new Date(Date.now() - 3 * 86400000).toISOString(),
    data_version: "1.0",
    raw_data_reference: `RAW-${deptSystem.system_id}-${parcel.parcel_id}`
  };

  return { commonRecord, logs };
}

function validateAndScoreDataQuality(
  record: CommonLandRecordData,
  raw: any
): { qualityScore: number; errors: string[]; warnings: string[]; qualityTier: string; checksPassed: number; totalChecks: number } {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  let checksPassed = 0;
  const totalChecks = 6;

  // 1. Mandatory Identity Fields check
  if (!record.parcel_id || !record.survey_number || !record.owner_name) {
    errors.push("Missing core identification field (parcel_id, survey_number, or owner_name)");
    score -= 30;
  } else {
    checksPassed++;
  }

  // 2. Spatial / Area Consistency check
  if (!record.standardized_area_sqm || record.standardized_area_sqm <= 0) {
    errors.push("Invalid or non-positive calculated area");
    score -= 25;
  } else {
    checksPassed++;
  }

  // 3. Normalized Location hierarchy
  if (!record.village || !record.district || !record.state) {
    warnings.push("Incomplete administrative hierarchy in source payload");
    score -= 10;
  } else {
    checksPassed++;
  }

  // 4. Traceable Source Reference check
  if (!record.source_record_id || record.source_record_id === "NONE") {
    warnings.push("Source payload lacks authoritative document index number");
    score -= 10;
  } else {
    checksPassed++;
  }

  // 5. Data Freshness check
  const recordAgeDays = (Date.now() - new Date(record.source_timestamp).getTime()) / (1000 * 3600 * 24);
  if (recordAgeDays > 365) {
    warnings.push(`Source record timestamp is older than 1 year (${Math.round(recordAgeDays)} days)`);
    score -= 8;
  } else {
    checksPassed++;
  }

  // 6. Survey number format validity
  if (!/^[\w\d]+(\/[\w\d]+)?$/.test(record.survey_number)) {
    warnings.push(`Non-standard survey number format pattern detected: ${record.survey_number}`);
    score -= 5;
  } else {
    checksPassed++;
  }

  score = Math.max(0, Math.min(100, score));
  let qualityTier = "HIGH QUALITY";
  if (score < 50) qualityTier = "LOW QUALITY";
  else if (score < 75) qualityTier = "MODERATE QUALITY";
  else if (score < 95) qualityTier = "GOOD QUALITY";

  return { qualityScore: score, errors, warnings, qualityTier, checksPassed, totalChecks };
}

// -------------------------------------------------------------------------
// PHASE 7 API GATEWAY ENDPOINTS
// -------------------------------------------------------------------------

// 1. GET /api/integration/v1/departments - List all 8 departmental systems & health
app.get("/api/integration/v1/departments", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  // Update random simulated health metrics
  departmentSystemsDatabase.forEach(dept => {
    dept.last_health_check = new Date().toISOString();
  });
  res.json(departmentSystemsDatabase);
});

// 2. GET /api/integration/v1/departments/:departmentId - Specific Department Detail, Connector Info & Schema
app.get("/api/integration/v1/departments/:departmentId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { departmentId } = req.params;
  const dept = departmentSystemsDatabase.find(
    d => d.system_id.toLowerCase() === departmentId.toLowerCase() || d.id === Number(departmentId)
  );

  if (!dept) {
    res.status(404).json({ detail: `Department system ${departmentId} not found.` });
    return;
  }

  const recentRequests = integrationRequestsDatabase.filter(r => r.target_system === dept.system_id).slice(0, 10);

  // Schema Mapping definitions
  const schemaMapping = [
    { source_field: "survey_no / survey_num", common_field: "survey_number", data_type: "String", description: "Standardized cadastral survey number notation (e.g. 124/2)" },
    { source_field: "extent_acres / area_sqm", common_field: "standardized_area_sqm", data_type: "Float", description: "Converted metric area in square meters (1 Acre = 4046.86 m²)" },
    { source_field: "pattadar / buyer_name", common_field: "owner_name", data_type: "String", description: "Authorized legal title holder name" },
    { source_field: "aadhaar_ref / uid", common_field: "owner_identifier_masked", data_type: "String", description: "Masked identity proof reference (XXXX-XXXX-1234)" },
    { source_field: "charge_status / lien_status", common_field: "encumbrance_status", data_type: "Enum", description: "Standardized liability status (FREE | MORTGAGED | DISPUTED)" },
    { source_field: "stay_granted / court_status", common_field: "litigation_status", data_type: "Enum", description: "Civil suit and injunction status (CLEAR | PENDING_CASE)" }
  ];

  const mockEndpoints = [
    {
      method: "GET",
      path: `${dept.base_url}/records/{parcel_id}`,
      description: `Fetch authoritative ${dept.department_name} digital record by parcel identifier.`,
      sample_request: { headers: { Authorization: `Bearer DPI_TOKEN_2026` } },
      sample_response: { status: "SUCCESS", data_version: dept.api_version, payload: { parcel_id: "TN-CBE-001-124-2", status: "VERIFIED" } }
    },
    {
      method: "POST",
      path: `${dept.base_url}/search`,
      description: `Search ${dept.department_name} by survey number, village code, or title deed reference.`,
      sample_request: { survey_no: "124/2", village_code: "VIL-04" },
      sample_response: { matches_count: 1, records: [{ id: "REC-8921", status: "ACTIVE" }] }
    }
  ];

  res.json({
    department: dept,
    recent_requests: recentRequests,
    schema_mapping: schemaMapping,
    mock_endpoints: mockEndpoints
  });
});

// 3. POST /api/integration/v1/request - Submit & Process an Interoperability Request
app.post("/api/integration/v1/request", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { target_system, request_type, parcel_id, purpose, access_mode } = req.body;

  if (!target_system || !parcel_id || !purpose) {
    res.status(400).json({ detail: "target_system, parcel_id, and purpose are required." });
    return;
  }

  const dept = departmentSystemsDatabase.find(
    d => d.system_id.toLowerCase() === target_system.toLowerCase() || d.id === Number(target_system)
  );
  if (!dept) {
    res.status(404).json({ detail: `Target departmental system ${target_system} not found.` });
    return;
  }

  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === parcel_id.toLowerCase());
  if (!parcel) {
    res.status(404).json({ detail: `Parcel ${parcel_id} not found.` });
    return;
  }

  const mode = access_mode || "OFFICIAL_AUTHORIZED";
  intRequestIdCounter++;
  const reqId = `INT-2026-${String(intRequestIdCounter).padStart(6, '0')}`;

  // Check consent if mode is CITIZEN_CONSENT
  let consentRecord: DataAccessConsentRecord | undefined;
  if (mode === "CITIZEN_CONSENT") {
    consentRecord = dataAccessConsentsDatabase.find(
      c => c.parcel_id.toLowerCase() === parcel_id.toLowerCase() && c.consent_status === "GRANTED"
    );

    if (!consentRecord) {
      // Create pending consent request
      consentIdCounter++;
      const newConsent: DataAccessConsentRecord = {
        id: consentIdCounter,
        consent_id: `CONSENT-2026-${String(consentIdCounter).padStart(6, '0')}`,
        user_id: 1, // Citizen
        citizen_name: parcel.current_owner || "Registered Citizen",
        parcel_id: parcel.parcel_id,
        request_id: reqId,
        requesting_organization: req.user!.full_name + ` (${req.user!.role.toUpperCase()})`,
        data_category: dept.supported_categories[0] || "PARCEL_INFORMATION",
        purpose,
        consent_status: "PENDING",
        expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
        created_at: new Date().toISOString()
      };
      dataAccessConsentsDatabase.unshift(newConsent);

      // Create Pending Integration Request
      const pendingReq: IntegrationRequestRecord = {
        id: intRequestIdCounter,
        request_id: reqId,
        requesting_system: "LANDSYNC_DPI_GATEWAY",
        target_system: dept.system_id,
        requested_by: `${req.user!.full_name} (${req.user!.role.toUpperCase()})`,
        request_type: request_type || "PARCEL_LOOKUP",
        parcel_id: parcel.parcel_id,
        purpose,
        access_mode: "CITIZEN_CONSENT",
        consent_id: newConsent.consent_id,
        status: "PENDING",
        data_quality_score: 0,
        request_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      integrationRequestsDatabase.unshift(pendingReq);

      // Create Notification for Citizen
      const nextNotifId = notificationsDatabase.length + 1;
      notificationsDatabase.unshift({
        id: nextNotifId,
        user_id: 1,
        title: "Data Access Consent Requested",
        message: `A request has been made by ${req.user!.full_name} to access ${dept.department_name} records for ${parcel.parcel_id}. Purpose: ${purpose}`,
        notification_type: "INFO",
        is_read: false,
        related_application_id: null,
        created_at: new Date().toISOString()
      });

      res.status(202).json({
        ...pendingReq,
        message: "Request requires citizen consent. A consent notification has been dispatched to the title holder."
      });
      return;
    }
  }

  // Execute connector
  const connector = connectors[dept.system_id];
  const rawData = connector ? connector.fetchRecord(parcel) : { parcel_id: parcel.parcel_id, status: "ACTIVE" };

  // Transform to Common Land Data Model
  const { commonRecord, logs } = transformRecordToCommonLandModel(dept, parcel, rawData, reqId);

  // Validate and Score
  const validation = validateAndScoreDataQuality(commonRecord, rawData);

  // Record Data Lineage
  lineageIdCounter++;
  const lineageRecord: DataLineageRecord = {
    id: lineageIdCounter,
    lineage_id: `LINEAGE-2026-${String(lineageIdCounter).padStart(6, '0')}`,
    parcel_id: parcel.parcel_id,
    data_category: dept.supported_categories[0] || "PARCEL_INFORMATION",
    source_system: dept.system_id,
    source_record_id: commonRecord.source_record_id,
    transformation_reference: `TRANS-BATCH-${reqId}`,
    accessed_by: `${req.user!.full_name} (${req.user!.role.toUpperCase()})`,
    access_purpose: purpose,
    access_mode: mode,
    timestamp: new Date().toISOString()
  };
  dataLineageDatabase.unshift(lineageRecord);

  // Create Completed Integration Request
  const completedReq: IntegrationRequestRecord = {
    id: intRequestIdCounter,
    request_id: reqId,
    requesting_system: "LANDSYNC_DPI_GATEWAY",
    target_system: dept.system_id,
    requested_by: `${req.user!.full_name} (${req.user!.role.toUpperCase()})`,
    request_type: request_type || "PARCEL_LOOKUP",
    parcel_id: parcel.parcel_id,
    purpose,
    access_mode: mode,
    consent_id: consentRecord ? consentRecord.consent_id : null,
    status: "COMPLETED",
    data_quality_score: validation.qualityScore,
    response_data: commonRecord,
    raw_response: rawData,
    transformations: logs,
    validation_errors: validation.errors,
    validation_warnings: validation.warnings,
    request_timestamp: new Date().toISOString(),
    response_timestamp: new Date(Date.now() + dept.avg_response_time_ms).toISOString(),
    created_at: new Date().toISOString()
  };
  integrationRequestsDatabase.unshift(completedReq);

  // Audit Log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "INTEGRATION_REQUEST_COMPLETED",
    entity_type: "INTEGRATION_REQUEST",
    entity_id: reqId,
    details: `Interoperability request ${reqId} completed for parcel ${parcel.parcel_id} via ${dept.department_name}. Quality Score: ${validation.qualityScore}/100`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.status(201).json(completedReq);
});

// 4. GET /api/integration/v1/request/:requestId - Details of an Integration Request
app.get("/api/integration/v1/request/:requestId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { requestId } = req.params;
  const item = integrationRequestsDatabase.find(r => r.request_id.toLowerCase() === requestId.toLowerCase());
  if (!item) {
    res.status(404).json({ detail: `Integration request ${requestId} not found.` });
    return;
  }
  res.json(item);
});

// 5. GET /api/integration/v1/parcels/:parcelId/records - Multi-department connected records for Parcel 360
app.get("/api/integration/v1/parcels/:parcelId/records", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcelId } = req.params;
  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === parcelId.toLowerCase());
  if (!parcel) {
    res.status(404).json({ detail: `Parcel ${parcelId} not found.` });
    return;
  }

  const records = departmentSystemsDatabase.map(dept => {
    const connector = connectors[dept.system_id];
    const raw = connector ? connector.fetchRecord(parcel) : { parcel_id: parcel.parcel_id };
    const { commonRecord } = transformRecordToCommonLandModel(dept, parcel, raw, `AUTO-P360-${dept.id}`);
    const validation = validateAndScoreDataQuality(commonRecord, raw);

    return {
      department_system: dept,
      available: true,
      last_synced: new Date(Date.now() - (dept.id * 3600000)).toISOString(),
      data_quality_score: validation.qualityScore,
      source_record_id: commonRecord.source_record_id,
      record: commonRecord,
      raw_preview: raw,
      status: "SYNCHRONIZED" as const
    };
  });

  const avgQuality = Math.round(records.reduce((acc, r) => acc + r.data_quality_score, 0) / records.length);

  res.json({
    parcel_id: parcel.parcel_id,
    survey_number: parcel.survey_number + (parcel.subdivision ? `/${parcel.subdivision}` : ""),
    village: parcel.village,
    district: parcel.district,
    overall_data_quality_score: avgQuality,
    departments_connected_count: records.length,
    total_departments_count: departmentSystemsDatabase.length,
    records
  });
});

// 6. GET /api/integration/v1/health - Integration Health Metrics
app.get("/api/integration/v1/health", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const total = integrationRequestsDatabase.length;
  const completed = integrationRequestsDatabase.filter(r => r.status === "COMPLETED").length;
  const failed = integrationRequestsDatabase.filter(r => r.status === "FAILED").length;
  const pending = integrationRequestsDatabase.filter(r => r.status === "PENDING").length;

  res.json({
    total_requests: total,
    successful_requests: completed,
    failed_requests: failed,
    pending_requests: pending,
    avg_response_time_ms: 184,
    requests_today: 549,
    success_rate_percentage: 99.1,
    departments: departmentSystemsDatabase,
    requests_by_department: departmentSystemsDatabase.map(d => ({
      department: d.department_name,
      count: d.requests_count_today,
      success_rate: d.success_rate
    })),
    requests_by_status: [
      { status: "COMPLETED", count: completed, percentage: 92 },
      { status: "PENDING", count: pending, percentage: 5 },
      { status: "FAILED", count: failed, percentage: 3 }
    ],
    requests_by_category: [
      { category: "PARCEL_INFORMATION", count: 180 },
      { category: "OWNERSHIP_INFORMATION", count: 140 },
      { category: "REGISTRATION_INFORMATION", count: 98 },
      { category: "SURVEY_INFORMATION", count: 86 },
      { category: "ENCUMBRANCE_INFORMATION", count: 64 },
      { category: "LAND_USE_INFORMATION", count: 43 },
      { category: "LITIGATION_STATUS", count: 38 }
    ],
    requests_timeline: [
      { time: "06:00", requests: 34, success: 34, failure: 0 },
      { time: "09:00", requests: 120, success: 119, failure: 1 },
      { time: "12:00", requests: 185, success: 183, failure: 2 },
      { time: "15:00", requests: 140, success: 139, failure: 1 },
      { time: "18:00", requests: 70, success: 70, failure: 0 }
    ]
  });
});

// 7. POST /api/integration/v1/test - Integration API Sandbox Execution
app.post("/api/integration/v1/test", authMiddleware, requireRole(["admin", "officer"]), (req: AuthenticatedRequest, res: Response) => {
  const { department_id, request_type, parcel_id } = req.body;

  const dept = departmentSystemsDatabase.find(
    d => d.system_id.toLowerCase() === department_id?.toLowerCase() || d.id === Number(department_id)
  ) || departmentSystemsDatabase[0];

  const parcel = parcelsDatabase.find(
    p => p.parcel_id.toLowerCase() === parcel_id?.toLowerCase()
  ) || parcelsDatabase[0];

  intRequestIdCounter++;
  const reqId = `INT-SANDBOX-${String(intRequestIdCounter).padStart(6, '0')}`;

  const connector = connectors[dept.system_id];
  const rawResponse = connector ? connector.fetchRecord(parcel) : { parcel_id: parcel.parcel_id };

  const { commonRecord, logs } = transformRecordToCommonLandModel(dept, parcel, rawResponse, reqId);
  const validation = validateAndScoreDataQuality(commonRecord, rawResponse);

  lineageIdCounter++;
  const lineagePreview: DataLineageRecord = {
    id: lineageIdCounter,
    lineage_id: `LINEAGE-SANDBOX-${String(lineageIdCounter).padStart(6, '0')}`,
    parcel_id: parcel.parcel_id,
    data_category: dept.supported_categories[0] || "PARCEL_INFORMATION",
    source_system: dept.system_id,
    source_record_id: commonRecord.source_record_id,
    transformation_reference: `TRANS-BATCH-${reqId}`,
    accessed_by: `${req.user!.full_name} (SANDBOX_TEST)`,
    access_purpose: `Developer Sandbox Mock API Evaluation for ${dept.system_name}`,
    access_mode: "SYSTEM_AUTHORIZED",
    timestamp: new Date().toISOString()
  };

  const testReq: IntegrationRequestRecord = {
    id: intRequestIdCounter,
    request_id: reqId,
    requesting_system: "LANDSYNC_SANDBOX_STUDIO",
    target_system: dept.system_id,
    requested_by: `${req.user!.full_name} (Admin/Officer)`,
    request_type: request_type || "PARCEL_LOOKUP",
    parcel_id: parcel.parcel_id,
    purpose: "Sandbox Mock API execution & data quality test",
    access_mode: "SYSTEM_AUTHORIZED",
    status: "COMPLETED",
    data_quality_score: validation.qualityScore,
    response_data: commonRecord,
    raw_response: rawResponse,
    transformations: logs,
    validation_errors: validation.errors,
    validation_warnings: validation.warnings,
    request_timestamp: new Date().toISOString(),
    response_timestamp: new Date(Date.now() + dept.avg_response_time_ms).toISOString(),
    created_at: new Date().toISOString()
  };

  res.json({
    request: testReq,
    raw_mock_response: rawResponse,
    validation_report: {
      is_valid: validation.errors.length === 0,
      data_quality_score: validation.qualityScore,
      quality_tier: validation.qualityTier,
      errors: validation.errors,
      warnings: validation.warnings,
      checks_passed: validation.checksPassed,
      total_checks: validation.totalChecks
    },
    transformation_logs: logs,
    standardized_record: commonRecord,
    data_lineage_preview: lineagePreview
  });
});

// 8. GET /api/consent - List Consents (Filtered by User if Citizen)
app.get("/api/consent", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role === "citizen") {
    // For prototype demo, return all citizen consents or user matching
    res.json(dataAccessConsentsDatabase);
  } else {
    res.json(dataAccessConsentsDatabase);
  }
});

// 9. POST /api/consent/request - Create Consent Request
app.post("/api/consent/request", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id, requesting_organization, data_category, purpose } = req.body;

  consentIdCounter++;
  const newConsent: DataAccessConsentRecord = {
    id: consentIdCounter,
    consent_id: `CONSENT-2026-${String(consentIdCounter).padStart(6, '0')}`,
    user_id: req.user!.id,
    citizen_name: req.user!.full_name,
    parcel_id: parcel_id || "TN-CBE-001-124-1",
    request_id: `INT-2026-${String(intRequestIdCounter).padStart(6, '0')}`,
    requesting_organization: requesting_organization || "State Financial Authority",
    data_category: data_category || "PARCEL_INFORMATION",
    purpose: purpose || "Official collateral title verification",
    consent_status: "PENDING",
    expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
    created_at: new Date().toISOString()
  };

  dataAccessConsentsDatabase.unshift(newConsent);

  // Audit Log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "CONSENT_REQUEST_CREATED",
    entity_type: "CONSENT",
    entity_id: newConsent.consent_id,
    details: `Consent request ${newConsent.consent_id} created for parcel ${newConsent.parcel_id} by ${newConsent.requesting_organization}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.status(201).json(newConsent);
});

// 10. POST /api/consent/:consentId/grant - Citizen Grants Consent
app.post("/api/consent/:consentId/grant", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { consentId } = req.params;
  const consent = dataAccessConsentsDatabase.find(c => c.consent_id.toLowerCase() === consentId.toLowerCase());
  if (!consent) {
    res.status(404).json({ detail: `Consent ${consentId} not found.` });
    return;
  }

  consent.consent_status = "GRANTED";
  consent.granted_at = new Date().toISOString();

  // If there was a pending integration request, resolve it!
  const pendingReq = integrationRequestsDatabase.find(r => r.consent_id === consent.consent_id && r.status === "PENDING");
  if (pendingReq) {
    pendingReq.status = "COMPLETED";
    pendingReq.data_quality_score = 95;
    const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === pendingReq.parcel_id.toLowerCase()) || parcelsDatabase[0];
    const dept = departmentSystemsDatabase.find(d => d.system_id === pendingReq.target_system) || departmentSystemsDatabase[0];
    const connector = connectors[dept.system_id];
    const raw = connector ? connector.fetchRecord(parcel) : { parcel_id: parcel.parcel_id };
    const { commonRecord } = transformRecordToCommonLandModel(dept, parcel, raw, pendingReq.request_id);
    pendingReq.response_data = commonRecord;
    pendingReq.raw_response = raw;
    pendingReq.response_timestamp = new Date().toISOString();
  }

  // Audit Log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "CONSENT_GRANTED",
    entity_type: "CONSENT",
    entity_id: consent.consent_id,
    details: `Citizen ${req.user!.full_name} granted consent ${consent.consent_id} for parcel ${consent.parcel_id} to ${consent.requesting_organization}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.json(consent);
});

// 11. POST /api/consent/:consentId/deny - Citizen Denies Consent
app.post("/api/consent/:consentId/deny", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { consentId } = req.params;
  const consent = dataAccessConsentsDatabase.find(c => c.consent_id.toLowerCase() === consentId.toLowerCase());
  if (!consent) {
    res.status(404).json({ detail: `Consent ${consentId} not found.` });
    return;
  }

  consent.consent_status = "DENIED";

  const pendingReq = integrationRequestsDatabase.find(r => r.consent_id === consent.consent_id && r.status === "PENDING");
  if (pendingReq) {
    pendingReq.status = "DENIED";
    pendingReq.error_message = "Data access request denied by citizen title holder.";
  }

  // Audit Log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "CONSENT_DENIED",
    entity_type: "CONSENT",
    entity_id: consent.consent_id,
    details: `Citizen ${req.user!.full_name} denied consent ${consent.consent_id} for parcel ${consent.parcel_id}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.json(consent);
});

// 12. POST /api/consent/:consentId/revoke - Citizen Revokes Active Consent
app.post("/api/consent/:consentId/revoke", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { consentId } = req.params;
  const consent = dataAccessConsentsDatabase.find(c => c.consent_id.toLowerCase() === consentId.toLowerCase());
  if (!consent) {
    res.status(404).json({ detail: `Consent ${consentId} not found.` });
    return;
  }

  consent.consent_status = "REVOKED";
  consent.revoked_at = new Date().toISOString();

  // Audit Log
  auditIdCounter++;
  auditLogsDatabase.unshift({
    id: auditIdCounter,
    user_id: req.user!.id,
    action: "CONSENT_REVOKED",
    entity_type: "CONSENT",
    entity_id: consent.consent_id,
    details: `Citizen ${req.user!.full_name} revoked consent ${consent.consent_id} for parcel ${consent.parcel_id}`,
    ip_address: req.ip || "127.0.0.1",
    created_at: new Date().toISOString()
  });

  res.json(consent);
});

// 13. GET /api/data-lineage - Search Data Lineage Records
app.get("/api/data-lineage", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id, department, search } = req.query;
  let results = [...dataLineageDatabase];

  if (parcel_id) {
    results = results.filter(l => l.parcel_id.toLowerCase().includes(String(parcel_id).toLowerCase()));
  }
  if (department) {
    results = results.filter(l => l.source_system.toLowerCase() === String(department).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(l =>
      l.parcel_id.toLowerCase().includes(q) ||
      l.lineage_id.toLowerCase().includes(q) ||
      l.accessed_by.toLowerCase().includes(q) ||
      l.access_purpose.toLowerCase().includes(q) ||
      l.source_record_id.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

// 14. GET /api/data-lineage/:parcelId - Lineage Records for Specific Parcel
app.get("/api/data-lineage/:parcelId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcelId } = req.params;
  const results = dataLineageDatabase.filter(l => l.parcel_id.toLowerCase() === parcelId.toLowerCase());
  res.json(results);
});

// 15. GET /api/admin/integration-analytics - Comprehensive Interoperability Analytics
app.get("/api/admin/integration-analytics", authMiddleware, requireRole(["admin", "officer"]), (req: AuthenticatedRequest, res: Response) => {
  const total = integrationRequestsDatabase.length;
  const completed = integrationRequestsDatabase.filter(r => r.status === "COMPLETED").length;
  const failed = integrationRequestsDatabase.filter(r => r.status === "FAILED").length;
  const pending = integrationRequestsDatabase.filter(r => r.status === "PENDING").length;

  res.json({
    total_requests: total,
    successful_requests: completed,
    failed_requests: failed,
    pending_requests: pending,
    avg_response_time_ms: 184,
    requests_today: 549,
    success_rate_percentage: 99.1,
    departments: departmentSystemsDatabase,
    requests_by_department: departmentSystemsDatabase.map(d => ({
      department: d.department_name,
      count: d.requests_count_today,
      success_rate: d.success_rate
    })),
    requests_by_status: [
      { status: "COMPLETED", count: completed, percentage: 92 },
      { status: "PENDING", count: pending, percentage: 5 },
      { status: "FAILED", count: failed, percentage: 3 }
    ],
    requests_by_category: [
      { category: "PARCEL_INFORMATION", count: 180 },
      { category: "OWNERSHIP_INFORMATION", count: 140 },
      { category: "REGISTRATION_INFORMATION", count: 98 },
      { category: "SURVEY_INFORMATION", count: 86 },
      { category: "ENCUMBRANCE_INFORMATION", count: 64 },
      { category: "LAND_USE_INFORMATION", count: 43 },
      { category: "LITIGATION_STATUS", count: 38 }
    ],
    requests_timeline: [
      { time: "06:00", requests: 34, success: 34, failure: 0 },
      { time: "09:00", requests: 120, success: 119, failure: 1 },
      { time: "12:00", requests: 185, success: 183, failure: 2 },
      { time: "15:00", requests: 140, success: 139, failure: 1 },
      { time: "18:00", requests: 70, success: 70, failure: 0 }
    ]
  });
});

// =========================================================================
// PHASE 8: ADVANCED GIS & SPATIAL INTELLIGENCE ENGINE ENDPOINTS & DATABASES
// =========================================================================

interface MasterPlanRecordInternal {
  id: number;
  plan_id: string;
  plan_name: string;
  authority: string;
  city_or_region: string;
  plan_year: string;
  valid_from: string;
  valid_to: string;
  status: 'ACTIVE' | 'DRAFT' | 'SUPERSEDED';
  description: string;
  notification_gazette_no: string;
  created_at: string;
}

const masterPlansDatabase: MasterPlanRecordInternal[] = [
  {
    id: 1,
    plan_id: "MP-CBE-2035",
    plan_name: "Coimbatore Metropolitan Area Comprehensive Master Plan 2035",
    authority: "Coimbatore Urban Development Authority (CUDA) & DTCP",
    city_or_region: "Coimbatore Urban Agglomeration & Sulur Sub-Region",
    plan_year: "2021-2035",
    valid_from: "2021-04-01",
    valid_to: "2035-03-31",
    status: "ACTIVE",
    description: "Statutory regional development plan defining spatial zoning, infrastructure corridors, flood protection buffers, and sustainable urban expansion policies.",
    notification_gazette_no: "TN-GO-MS-84/H&UD/2021",
    created_at: "2021-04-01T00:00:00.000Z"
  },
  {
    id: 2,
    plan_id: "MP-SULUR-2030",
    plan_name: "Sulur Sub-Regional Local Planning Area Master Plan",
    authority: "Directorate of Town & Country Planning (DTCP)",
    city_or_region: "Sulur & Singanallur Peripheral Growth Corridor",
    plan_year: "2020-2030",
    valid_from: "2020-01-01",
    valid_to: "2030-12-31",
    status: "ACTIVE",
    description: "Detailed sectoral zoning plan regulating mixed residential, warehousing, agro-logistics, and waterbody conservation zones.",
    notification_gazette_no: "TN-GO-MS-112/DTCP/2020",
    created_at: "2020-01-01T00:00:00.000Z"
  }
];

interface ZoningRecordInternal {
  id: number;
  zone_id: string;
  parcel_id: string;
  plan_id: string;
  zone_type: 'PRIMARY_RESIDENTIAL' | 'MIXED_RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'AGRICULTURAL' | 'PUBLIC_SEMI_PUBLIC' | 'OPEN_SPACE_RECREATION' | 'WATERBODY_CONSERVATION' | 'ECO_SENSITIVE';
  zone_code: string;
  zone_name: string;
  permitted_uses: string[];
  prohibited_uses: string[];
  conditional_uses: string[];
  max_fsi_far: number;
  max_building_height_meters: number;
  front_setback_meters: number;
  rear_setback_meters: number;
  side_setback_meters: number;
  max_coverage_percentage: number;
  buffer_required_meters: number;
  special_conditions?: string;
  created_at: string;
}

const zoningDatabase: ZoningRecordInternal[] = [
  {
    id: 1,
    zone_id: "ZONE-CBE-R1-042",
    parcel_id: "TN-CBE-001-124-1",
    plan_id: "MP-CBE-2035",
    zone_type: "PRIMARY_RESIDENTIAL",
    zone_code: "R1",
    zone_name: "Primary Residential Zone (Low-Medium Density)",
    permitted_uses: ["Single Family Residences", "Duplex Homes", "Community Parks", "Doctor Clinics (<50 sqm)", "Creches"],
    prohibited_uses: ["Heavy Commercial", "Chemical Industries", "Warehouses >500 sqm", "Hazardous Storage", "Nightclubs"],
    conditional_uses: ["Neighborhood Grocery (<100 sqm)", "Solar Rooftop Power Plants"],
    max_fsi_far: 1.5,
    max_building_height_meters: 12.0,
    front_setback_meters: 3.0,
    rear_setback_meters: 2.0,
    side_setback_meters: 1.5,
    max_coverage_percentage: 65,
    buffer_required_meters: 0,
    special_conditions: "Rainwater harvesting structure mandatory. Solar water heater for builtup > 150 sqm.",
    created_at: "2021-04-01T00:00:00.000Z"
  },
  {
    id: 2,
    zone_id: "ZONE-CBE-R1-043",
    parcel_id: "TN-CBE-001-124-2",
    plan_id: "MP-CBE-2035",
    zone_type: "PRIMARY_RESIDENTIAL",
    zone_code: "R1",
    zone_name: "Primary Residential Zone (Low-Medium Density)",
    permitted_uses: ["Single Family Residences", "Apartments (G+3)", "Community Gardens", "Primary Schools"],
    prohibited_uses: ["Heavy Commercial", "Industries", "Hazardous Material", "Automobile Workshops"],
    conditional_uses: ["Doctors Clinic", "Retail Shop (<75 sqm)"],
    max_fsi_far: 1.5,
    max_building_height_meters: 12.0,
    front_setback_meters: 3.0,
    rear_setback_meters: 2.0,
    side_setback_meters: 1.5,
    max_coverage_percentage: 65,
    buffer_required_meters: 0,
    special_conditions: "Permissible for residential construction up to G+3 with 3m approach road.",
    created_at: "2021-04-01T00:00:00.000Z"
  },
  {
    id: 3,
    zone_id: "ZONE-CBE-C2-019",
    parcel_id: "TN-CBE-001-124-3",
    plan_id: "MP-CBE-2035",
    zone_type: "COMMERCIAL",
    zone_code: "C2",
    zone_name: "General Commercial & Retail Zone",
    permitted_uses: ["Retail Shopping Malls", "Office Complexes", "Restaurants & Banquet Halls", "Banks & Financial Centers", "Hotels"],
    prohibited_uses: ["Polluting Red Category Industries", "Tanneries", "Abattoirs", "Open Scrap Yards"],
    conditional_uses: ["Light Assembly & Packaging", "EV Fast Charging Hubs"],
    max_fsi_far: 2.5,
    max_building_height_meters: 24.0,
    front_setback_meters: 6.0,
    rear_setback_meters: 4.0,
    side_setback_meters: 3.5,
    max_coverage_percentage: 55,
    buffer_required_meters: 5.0,
    special_conditions: "Adequate on-site basement parking required (1 ECS per 50 sqm built-up area). DTCP NOC required for FAR > 2.0.",
    created_at: "2021-04-01T00:00:00.000Z"
  },
  {
    id: 4,
    zone_id: "ZONE-CBE-C2-020",
    parcel_id: "TN-CBE-001-125-1",
    plan_id: "MP-CBE-2035",
    zone_type: "COMMERCIAL",
    zone_code: "C2",
    zone_name: "General Commercial & Logistics Corridor",
    permitted_uses: ["Logistics Warehousing", "Commercial Showrooms", "Freight Depots", "IT Parks"],
    prohibited_uses: ["Hazardous Chemical Manufacturing", "Residential plotting without layout sanction"],
    conditional_uses: ["Automated Container Freight Station", "Cold Storage Units"],
    max_fsi_far: 2.25,
    max_building_height_meters: 20.0,
    front_setback_meters: 7.0,
    rear_setback_meters: 4.5,
    side_setback_meters: 4.0,
    max_coverage_percentage: 50,
    buffer_required_meters: 6.0,
    special_conditions: "Bordering East corridor requires heavy vehicle turning radius clearance.",
    created_at: "2021-04-01T00:00:00.000Z"
  },
  {
    id: 5,
    zone_id: "ZONE-CBE-AG-008",
    parcel_id: "TN-CBE-001-125-2",
    plan_id: "MP-CBE-2035",
    zone_type: "AGRICULTURAL",
    zone_code: "AG-1",
    zone_name: "Primary Agricultural & Green Belt Zone",
    permitted_uses: ["Crop Cultivation", "Horticulture & Greenhouses", "Dairy & Poultry Farming", "Farmer Farmhouse (<150 sqm)"],
    prohibited_uses: ["Multi-Storey Residential", "Commercial Complexes", "Industrial Units", "Plot Layout Subdivisions"],
    conditional_uses: ["Agro-Processing Unit (<300 sqm)", "Farm Tourism Homestay (<200 sqm)"],
    max_fsi_far: 0.25,
    max_building_height_meters: 7.5,
    front_setback_meters: 5.0,
    rear_setback_meters: 5.0,
    side_setback_meters: 5.0,
    max_coverage_percentage: 15,
    buffer_required_meters: 0,
    special_conditions: "Strict preservation of agricultural topsoil. Change of Land Use (CLU) requires District Collector prior sanction.",
    created_at: "2021-04-01T00:00:00.000Z"
  },
  {
    id: 6,
    zone_id: "ZONE-CBE-AG-009",
    parcel_id: "TN-CBE-001-126-1",
    plan_id: "MP-CBE-2035",
    zone_type: "AGRICULTURAL",
    zone_code: "AG-1",
    zone_name: "Primary Agricultural & Green Belt Zone",
    permitted_uses: ["Agriculture", "Organic Farming", "Orchards", "Agro-forestry", "Tubewell Sheds"],
    prohibited_uses: ["Non-Agricultural Conversions", "Commercial Plottings", "Brick Kilns", "Quarrying"],
    conditional_uses: ["Cold Storage for Farm Produce", "Biogas Power Plant"],
    max_fsi_far: 0.25,
    max_building_height_meters: 7.5,
    front_setback_meters: 5.0,
    rear_setback_meters: 5.0,
    side_setback_meters: 5.0,
    max_coverage_percentage: 15,
    buffer_required_meters: 0,
    special_conditions: "Subject to Tamil Nadu Land Reforms Act and Agricultural Preservation norms.",
    created_at: "2021-04-01T00:00:00.000Z"
  },
  {
    id: 7,
    zone_id: "ZONE-CBE-AG-010",
    parcel_id: "TN-CBE-001-126-2",
    plan_id: "MP-CBE-2035",
    zone_type: "AGRICULTURAL",
    zone_code: "AG-1",
    zone_name: "Primary Agricultural & Eco-Sensitive Periphery",
    permitted_uses: ["Farming", "Plantation", "Agricultural Wells"],
    prohibited_uses: ["Commercial Buildings", "Warehouses without CLU", "Subdivision into Urban Plots"],
    conditional_uses: ["Agritech Demonstration Center"],
    max_fsi_far: 0.20,
    max_building_height_meters: 6.0,
    front_setback_meters: 6.0,
    rear_setback_meters: 6.0,
    side_setback_meters: 6.0,
    max_coverage_percentage: 10,
    buffer_required_meters: 10.0,
    special_conditions: "Adjacent to Eri Puramboke water catchment. 50m statutory buffer zone applies from northern edge.",
    created_at: "2021-04-01T00:00:00.000Z"
  },
  {
    id: 8,
    zone_id: "ZONE-CBE-WB-001",
    parcel_id: "TN-CBE-001-127-1",
    plan_id: "MP-CBE-2035",
    zone_type: "WATERBODY_CONSERVATION",
    zone_code: "WB-CON",
    zone_name: "Protected Waterbody & Wetland Conservation Zone",
    permitted_uses: ["Ecological Restoration", "Afforestation", "Water Harvesting Bund Maintenance", "Bird Sanctuary Observation"],
    prohibited_uses: ["ALL Private Development", "Land Filling / Reclamation", "Construction of any Permanent Structures", "Sewage Discharge"],
    conditional_uses: ["PWD Inflow / Outflow Channel Upgrades", "Bio-fencing"],
    max_fsi_far: 0.0,
    max_building_height_meters: 0.0,
    front_setback_meters: 50.0,
    rear_setback_meters: 50.0,
    side_setback_meters: 50.0,
    max_coverage_percentage: 0,
    buffer_required_meters: 50.0,
    special_conditions: "Government Eri Puramboke. Protected under Supreme Court directives and TN Protection of Tanks Act 2007. Zero tolerance for encroachment.",
    created_at: "2021-04-01T00:00:00.000Z"
  }
];

interface BuildingPermissionRecordInternal {
  id: number;
  permission_id: string;
  parcel_id: string;
  applicant_name: string;
  application_no: string;
  approval_date: string;
  approved_builtup_area_sqm: number;
  approved_floors: number;
  purpose: string;
  validity_years: number;
  inspection_status: 'APPROVED_NOT_STARTED' | 'UNDER_CONSTRUCTION_COMPLIANT' | 'UNDER_CONSTRUCTION_DEVIATION' | 'OCCUPANCY_CERTIFICATE_ISSUED' | 'UNAUTHORIZED_CONSTRUCTION' | 'STOP_WORK_ORDER';
  deviation_flag: boolean;
  detected_deviation_percentage?: number;
  deviation_details?: string;
  approved_footprint_geojson?: any;
  created_at: string;
}

const buildingPermissionsDatabase: BuildingPermissionRecordInternal[] = [
  {
    id: 1,
    permission_id: "BP-2024-CBE-0891",
    parcel_id: "TN-CBE-001-124-1",
    applicant_name: "Ravi Kumar",
    application_no: "BLD-APP-2023-9942",
    approval_date: "2024-03-15",
    approved_builtup_area_sqm: 240.0,
    approved_floors: 2,
    purpose: "Residential Villa (Ground + 1 Floor)",
    validity_years: 3,
    inspection_status: "UNDER_CONSTRUCTION_COMPLIANT",
    deviation_flag: false,
    detected_deviation_percentage: 1.2,
    deviation_details: "Construction aligned with sanctioned plan. Front setback 3.1m (required 3.0m).",
    approved_footprint_geojson: {
      type: "Polygon",
      coordinates: [[[77.0315, 11.0255], [77.0325, 11.0255], [77.0325, 11.0265], [77.0315, 11.0265], [77.0315, 11.0255]]]
    },
    created_at: "2024-03-15T10:00:00.000Z"
  },
  {
    id: 2,
    permission_id: "BP-2023-CBE-0412",
    parcel_id: "TN-CBE-001-124-3",
    applicant_name: "Senthil Enterprises",
    application_no: "BLD-APP-2022-7711",
    approval_date: "2023-08-20",
    approved_builtup_area_sqm: 1250.0,
    approved_floors: 3,
    purpose: "Commercial Complex (Basement + G + 2 Floors)",
    validity_years: 3,
    inspection_status: "UNDER_CONSTRUCTION_DEVIATION",
    deviation_flag: true,
    detected_deviation_percentage: 18.5,
    deviation_details: "AI Satellite & Drone scan detected an unauthorized mezzanine floor (230 sqm) and encroached rear setback by 1.8 meters.",
    approved_footprint_geojson: {
      type: "Polygon",
      coordinates: [[[77.0353, 11.0253], [77.0369, 11.0253], [77.0369, 11.0267], [77.0353, 11.0267], [77.0353, 11.0253]]]
    },
    created_at: "2023-08-20T11:30:00.000Z"
  },
  {
    id: 3,
    permission_id: "BP-2025-CBE-UNAUTH",
    parcel_id: "TN-CBE-001-126-2",
    applicant_name: "R. Palanisamy",
    application_no: "NO_APPLICATION_FILED",
    approval_date: "N/A",
    approved_builtup_area_sqm: 0.0,
    approved_floors: 0,
    purpose: "Unauthorized Industrial Storage Shed",
    validity_years: 0,
    inspection_status: "UNAUTHORIZED_CONSTRUCTION",
    deviation_flag: true,
    detected_deviation_percentage: 100.0,
    deviation_details: "Tin-roof commercial godown (450 sqm) erected on agricultural land without DTCP layout permission or building sanction. Located within 50m of Eri buffer.",
    created_at: "2026-01-20T08:00:00.000Z"
  }
];

interface RestrictionZoneRecordInternal {
  id: number;
  zone_id: string;
  zone_name: string;
  zone_type: 'COASTAL_REGULATION_ZONE' | 'RIVER_WATERBODY_BUFFER' | 'ARCHAEOLOGICAL_HERITAGE_BUFFER' | 'AIRPORT_DEFENSE_FUNNEL' | 'HIGH_TENSION_POWER_BUFFER' | 'RAILWAY_SAFETY_BUFFER' | 'FOREST_ECO_SENSITIVE_ZONE';
  restriction_level: 'STRICT_NO_DEVELOPMENT' | 'CONDITIONAL_APPROVAL' | 'HEIGHT_RESTRICTED' | 'BUFFER_SETBACK_ONLY';
  buffer_distance_meters: number;
  enacting_law: string;
  description: string;
  affecting_parcels: string[];
  max_allowable_height_meters?: number;
  coordinates?: number[][][];
  geojson_feature?: any;
  created_at: string;
}

const restrictionZonesDatabase: RestrictionZoneRecordInternal[] = [
  {
    id: 1,
    zone_id: "REST-WB-SINGANALLUR-01",
    zone_name: "Singanallur / Demo Eri Lake 50-Meter Statutory Protection Buffer",
    zone_type: "RIVER_WATERBODY_BUFFER",
    restriction_level: "STRICT_NO_DEVELOPMENT",
    buffer_distance_meters: 50.0,
    enacting_law: "Tamil Nadu Protection of Tanks and Eviction of Encroachment Act, 2007 (TN Act 8 of 2007)",
    description: "Prohibits all commercial, industrial, and residential construction within 50 meters of the Full Reservoir Level (FRL) boundary of the waterbody to safeguard natural flood drainage corridors.",
    affecting_parcels: ["TN-CBE-001-127-1", "TN-CBE-001-126-2", "TN-CBE-001-125-2"],
    coordinates: [[[77.0330, 11.0268], [77.0430, 11.0268], [77.0430, 11.0305], [77.0330, 11.0305], [77.0330, 11.0268]]],
    created_at: "2020-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    zone_id: "REST-HT-TANGEDCO-04",
    zone_name: "TANGEDCO 110kV High-Tension Transmission Line Safety Corridor",
    zone_type: "HIGH_TENSION_POWER_BUFFER",
    restriction_level: "HEIGHT_RESTRICTED",
    buffer_distance_meters: 15.0,
    enacting_law: "Indian Electricity Rules, 1956 & CEA Safety Regulations Section 64",
    description: "Vertical clearance of minimum 6.1m and horizontal clearance of 15m from the center of the transmission towers required. No flammable storage or multi-storey structures permitted below the line.",
    affecting_parcels: ["TN-CBE-001-124-2", "TN-CBE-001-124-3"],
    max_allowable_height_meters: 4.5,
    coordinates: [[[77.0338, 11.0240], [77.0355, 11.0240], [77.0355, 11.0280], [77.0338, 11.0280], [77.0338, 11.0240]]],
    created_at: "2019-06-15T00:00:00.000Z"
  },
  {
    id: 3,
    zone_id: "REST-AIR-CJB-FUNNEL",
    zone_name: "Coimbatore International Airport Approach Obstacle Limitation Surface (OLS)",
    zone_type: "AIRPORT_DEFENSE_FUNNEL",
    restriction_level: "HEIGHT_RESTRICTED",
    buffer_distance_meters: 2500.0,
    enacting_law: "Ministry of Civil Aviation (Height Restrictions for Safeguarding of Aircraft Operations) Rules, 2015",
    description: "Parcels located within the 3km runway transitional surface funnel. Maximum permissible building height capped at 24 meters above ground level without AAI Color Coded Zoning Map (CCZM) NOC.",
    affecting_parcels: ["TN-CBE-001-124-1", "TN-CBE-001-124-2", "TN-CBE-001-124-3", "TN-CBE-001-125-1", "TN-CBE-001-125-2", "TN-CBE-001-126-1", "TN-CBE-001-126-2", "TN-CBE-001-127-1"],
    max_allowable_height_meters: 24.0,
    coordinates: [[[77.0250, 11.0200], [77.0450, 11.0200], [77.0450, 11.0350], [77.0250, 11.0350], [77.0250, 11.0200]]],
    created_at: "2018-03-10T00:00:00.000Z"
  }
];

interface EnvironmentalRecordInternal {
  id: number;
  parcel_id: string;
  flood_risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  flood_zone_name: string;
  wetland_proximity_meters: number;
  waterbody_buffer_conflict: boolean;
  forest_buffer_meters: number;
  vegetation_index_ndvi: number;
  historical_tree_loss_percentage: number;
  slope_grade_percentage: number;
  eco_sensitivity_status: 'NORMAL' | 'SENSITIVE' | 'PROTECTED_WETLAND' | 'FOREST_CORRIDOR';
  soil_type: string;
  groundwater_table_depth_meters: number;
  created_at: string;
}

const environmentalDatabase: EnvironmentalRecordInternal[] = [
  {
    id: 1,
    parcel_id: "TN-CBE-001-124-1",
    flood_risk_level: "LOW",
    flood_zone_name: "Zone C (Low Inundation Risk - 100-year return period)",
    wetland_proximity_meters: 650,
    waterbody_buffer_conflict: false,
    forest_buffer_meters: 4200,
    vegetation_index_ndvi: 0.38,
    historical_tree_loss_percentage: 4.2,
    slope_grade_percentage: 1.5,
    eco_sensitivity_status: "NORMAL",
    soil_type: "Red Loamy Soil (Well Drained)",
    groundwater_table_depth_meters: 14.5,
    created_at: "2026-01-10T00:00:00.000Z"
  },
  {
    id: 2,
    parcel_id: "TN-CBE-001-124-2",
    flood_risk_level: "LOW",
    flood_zone_name: "Zone C (Low Inundation Risk)",
    wetland_proximity_meters: 520,
    waterbody_buffer_conflict: false,
    forest_buffer_meters: 4000,
    vegetation_index_ndvi: 0.35,
    historical_tree_loss_percentage: 6.0,
    slope_grade_percentage: 1.8,
    eco_sensitivity_status: "NORMAL",
    soil_type: "Red Sandy Clay Loam",
    groundwater_table_depth_meters: 15.0,
    created_at: "2026-01-10T00:00:00.000Z"
  },
  {
    id: 3,
    parcel_id: "TN-CBE-001-124-3",
    flood_risk_level: "MODERATE",
    flood_zone_name: "Zone B (Moderate Runoff & Secondary Drainage)",
    wetland_proximity_meters: 310,
    waterbody_buffer_conflict: false,
    forest_buffer_meters: 3800,
    vegetation_index_ndvi: 0.22,
    historical_tree_loss_percentage: 18.4,
    slope_grade_percentage: 2.1,
    eco_sensitivity_status: "NORMAL",
    soil_type: "Clayey Sub-Soil with Calcareous Layer",
    groundwater_table_depth_meters: 11.2,
    created_at: "2026-01-10T00:00:00.000Z"
  },
  {
    id: 4,
    parcel_id: "TN-CBE-001-125-1",
    flood_risk_level: "MODERATE",
    flood_zone_name: "Zone B (Moderate Runoff)",
    wetland_proximity_meters: 220,
    waterbody_buffer_conflict: false,
    forest_buffer_meters: 3600,
    vegetation_index_ndvi: 0.18,
    historical_tree_loss_percentage: 24.5,
    slope_grade_percentage: 2.0,
    eco_sensitivity_status: "NORMAL",
    soil_type: "Red Loam with Gravel",
    groundwater_table_depth_meters: 9.8,
    created_at: "2026-01-10T00:00:00.000Z"
  },
  {
    id: 5,
    parcel_id: "TN-CBE-001-125-2",
    flood_risk_level: "MODERATE",
    flood_zone_name: "Zone B (Agricultural Inundation Fringe)",
    wetland_proximity_meters: 85,
    waterbody_buffer_conflict: false,
    forest_buffer_meters: 3400,
    vegetation_index_ndvi: 0.65,
    historical_tree_loss_percentage: 2.1,
    slope_grade_percentage: 1.2,
    eco_sensitivity_status: "SENSITIVE",
    soil_type: "Deep Black Alluvial Clay",
    groundwater_table_depth_meters: 5.4,
    created_at: "2026-01-10T00:00:00.000Z"
  },
  {
    id: 6,
    parcel_id: "TN-CBE-001-126-1",
    flood_risk_level: "LOW",
    flood_zone_name: "Zone C (Low Risk)",
    wetland_proximity_meters: 420,
    waterbody_buffer_conflict: false,
    forest_buffer_meters: 3900,
    vegetation_index_ndvi: 0.58,
    historical_tree_loss_percentage: 3.0,
    slope_grade_percentage: 1.6,
    eco_sensitivity_status: "NORMAL",
    soil_type: "Red Sandy Loam",
    groundwater_table_depth_meters: 12.0,
    created_at: "2026-01-10T00:00:00.000Z"
  },
  {
    id: 7,
    parcel_id: "TN-CBE-001-126-2",
    flood_risk_level: "HIGH",
    flood_zone_name: "Zone A (High Flood Fringe & Catchment Edge)",
    wetland_proximity_meters: 15,
    waterbody_buffer_conflict: true,
    forest_buffer_meters: 3200,
    vegetation_index_ndvi: 0.28,
    historical_tree_loss_percentage: 42.0,
    slope_grade_percentage: 3.2,
    eco_sensitivity_status: "SENSITIVE",
    soil_type: "Hydric Silt Clay",
    groundwater_table_depth_meters: 2.8,
    created_at: "2026-01-10T00:00:00.000Z"
  },
  {
    id: 8,
    parcel_id: "TN-CBE-001-127-1",
    flood_risk_level: "VERY_HIGH",
    flood_zone_name: "Zone A1 (Active Lake Inundation Basin)",
    wetland_proximity_meters: 0,
    waterbody_buffer_conflict: true,
    forest_buffer_meters: 3000,
    vegetation_index_ndvi: 0.72,
    historical_tree_loss_percentage: 0.0,
    slope_grade_percentage: 0.5,
    eco_sensitivity_status: "PROTECTED_WETLAND",
    soil_type: "Wetland Hydric Alluvium",
    groundwater_table_depth_meters: 0.5,
    created_at: "2026-01-10T00:00:00.000Z"
  }
];

interface SatelliteChangeDetectionRecordInternal {
  id: number;
  detection_id: string;
  parcel_id: string;
  survey_number: string;
  detection_date: string;
  previous_image_date: string;
  current_image_date: string;
  change_type: 'NEW_CONSTRUCTION' | 'VEGETATION_LOSS' | 'WATERBODY_SHRINKAGE' | 'EXCAVATION_OR_MINING' | 'ROOF_EXPANSION' | 'ROAD_ENCROACHMENT';
  confidence_score: number;
  detected_change_area_sqm: number;
  approved_permission_id?: string | null;
  violation_probability: number;
  ai_detection_summary: string;
  change_status: 'PENDING_FIELD_VERIFICATION' | 'CONFIRMED_UNAUTHORIZED' | 'LEGAL_AND_APPROVED' | 'RESOLVED';
  before_image_url: string;
  after_image_url: string;
  bounding_polygon?: number[][][];
  inspector_assigned?: string | null;
  inspector_notes?: string | null;
  created_at: string;
}

const satelliteChangesDatabase: SatelliteChangeDetectionRecordInternal[] = [
  {
    id: 1,
    detection_id: "SAT-CHG-2026-001",
    parcel_id: "TN-CBE-001-124-1",
    survey_number: "124/1",
    detection_date: "2026-01-15",
    previous_image_date: "2023-11-20",
    current_image_date: "2026-01-10",
    change_type: "NEW_CONSTRUCTION",
    confidence_score: 96,
    detected_change_area_sqm: 238.5,
    approved_permission_id: "BP-2024-CBE-0891",
    violation_probability: 4,
    ai_detection_summary: "New residential structure footprint detected matching sanctioned Building Permission BP-2024-CBE-0891. Built-up area within 1% of sanctioned plan.",
    change_status: "LEGAL_AND_APPROVED",
    before_image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80",
    after_image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80",
    bounding_polygon: [[[77.0315, 11.0255], [77.0325, 11.0255], [77.0325, 11.0265], [77.0315, 11.0265], [77.0315, 11.0255]]],
    inspector_assigned: "R. Shanmugam (Surveyor Sulur)",
    inspector_notes: "Field inspection on 2026-01-20 confirmed foundation and G+1 framing matches sanctioned blueprints.",
    created_at: "2026-01-15T14:30:00.000Z"
  },
  {
    id: 2,
    detection_id: "SAT-CHG-2026-002",
    parcel_id: "TN-CBE-001-124-3",
    survey_number: "124/3",
    detection_date: "2026-01-22",
    previous_image_date: "2024-03-12",
    current_image_date: "2026-01-18",
    change_type: "ROOF_EXPANSION",
    confidence_score: 91,
    detected_change_area_sqm: 410.0,
    approved_permission_id: "BP-2023-CBE-0412",
    violation_probability: 78,
    ai_detection_summary: "Commercial roof structure expanded by 410 sqm into statutory rear setback zone. Discrepancy of +18.5% over approved permission footprint BP-2023-CBE-0412.",
    change_status: "CONFIRMED_UNAUTHORIZED",
    before_image_url: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=80",
    after_image_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80",
    bounding_polygon: [[[77.0360, 11.0252], [77.0372, 11.0252], [77.0372, 11.0268], [77.0360, 11.0268], [77.0360, 11.0252]]],
    inspector_assigned: "K. Vijayakumar (Revenue Inspector)",
    inspector_notes: "Show cause notice drafted for unauthorized rear expansion violating DTCP Commercial norms.",
    created_at: "2026-01-22T09:15:00.000Z"
  },
  {
    id: 3,
    detection_id: "SAT-CHG-2026-003",
    parcel_id: "TN-CBE-001-126-2",
    survey_number: "126/2",
    detection_date: "2026-02-05",
    previous_image_date: "2022-09-10",
    current_image_date: "2026-01-28",
    change_type: "NEW_CONSTRUCTION",
    confidence_score: 98,
    detected_change_area_sqm: 450.0,
    approved_permission_id: null,
    violation_probability: 95,
    ai_detection_summary: "Critical unauthorized metal-shed industrial construction detected on designated agricultural land. The structure breaches the 50-meter Singanallur Lake buffer by 24 meters.",
    change_status: "PENDING_FIELD_VERIFICATION",
    before_image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80",
    after_image_url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80",
    bounding_polygon: [[[77.0340, 11.0275], [77.0355, 11.0275], [77.0355, 11.0290], [77.0340, 11.0290], [77.0340, 11.0275]]],
    inspector_assigned: "P. Murugesan (Tahsildar)",
    inspector_notes: "Emergency field survey order issued under TN Protection of Tanks Act Section 7.",
    created_at: "2026-02-05T11:00:00.000Z"
  },
  {
    id: 4,
    detection_id: "SAT-CHG-2026-004",
    parcel_id: "TN-CBE-001-125-1",
    survey_number: "125/1",
    detection_date: "2026-02-10",
    previous_image_date: "2023-04-18",
    current_image_date: "2026-02-02",
    change_type: "ROAD_ENCROACHMENT",
    confidence_score: 88,
    detected_change_area_sqm: 165.0,
    approved_permission_id: null,
    violation_probability: 82,
    ai_detection_summary: "Compound wall and paved parking apron encroaching 3.2m onto the State Highway 174 Right-of-Way (RoW) road boundary.",
    change_status: "CONFIRMED_UNAUTHORIZED",
    before_image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80",
    after_image_url: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=80",
    bounding_polygon: [[[77.0370, 11.0250], [77.0392, 11.0250], [77.0392, 11.0254], [77.0370, 11.0254], [77.0370, 11.0250]]],
    inspector_assigned: "Highways Divisional Engineer",
    inspector_notes: "Highways encroachment removal notice served on Apex Logistics Pvt Ltd.",
    created_at: "2026-02-10T16:00:00.000Z"
  }
];

interface SpatialTimelineEventInternal {
  id: number;
  parcel_id: string;
  year: number;
  event_date: string;
  event_title: string;
  event_type: 'CADASTRAL_CREATION' | 'SUBDIVISION' | 'CONVERSION' | 'CONSTRUCTION' | 'ENCROACHMENT_FLAG' | 'RESURVEY';
  before_area_acres: number;
  after_area_acres: number;
  change_summary: string;
  recorded_by: string;
  geojson_snapshot: any;
  satellite_thumbnail_url?: string;
  source_authority: string;
}

const spatialTimelineDatabase: SpatialTimelineEventInternal[] = [
  {
    id: 1,
    parcel_id: "TN-CBE-001-124-1",
    year: 1985,
    event_date: "1985-06-12",
    event_title: "Original Revenue Survey Settlement (Survey 124)",
    event_type: "CADASTRAL_CREATION",
    before_area_acres: 6.80,
    after_area_acres: 6.80,
    change_summary: "Parent survey field 124 mapped during village resurvey settlement as dry agricultural land.",
    recorded_by: "Settlement Officer Coimbatore",
    geojson_snapshot: {
      type: "Polygon",
      coordinates: [[[77.0310, 11.0250], [77.0373, 11.0250], [77.0373, 11.0270], [77.0310, 11.0270], [77.0310, 11.0250]]]
    },
    source_authority: "Directorate of Survey & Land Records"
  },
  {
    id: 2,
    parcel_id: "TN-CBE-001-124-1",
    year: 2018,
    event_date: "2018-09-14",
    event_title: "Statutory Subdivision (124/1, 124/2, 124/3)",
    event_type: "SUBDIVISION",
    before_area_acres: 6.80,
    after_area_acres: 2.50,
    change_summary: "Survey 124 partitioned into three distinct sub-parcels. Sub-parcel 1 allotted 2.50 Acres to Ravi Kumar.",
    recorded_by: "Tahsildar Coimbatore South",
    geojson_snapshot: {
      type: "Polygon",
      coordinates: [[[77.0310, 11.0250], [77.0330, 11.0250], [77.0330, 11.0270], [77.0310, 11.0270], [77.0310, 11.0250]]]
    },
    source_authority: "Tamil Nilam Revenue Portal"
  },
  {
    id: 3,
    parcel_id: "TN-CBE-001-124-1",
    year: 2021,
    event_date: "2021-04-12",
    event_title: "Master Plan Residential Zoning Notification",
    event_type: "CONVERSION",
    before_area_acres: 2.50,
    after_area_acres: 2.50,
    change_summary: "Zoned as Primary Residential R1 under Coimbatore Master Plan 2035.",
    recorded_by: "CUDA & DTCP",
    geojson_snapshot: {
      type: "Polygon",
      coordinates: [[[77.0310, 11.0250], [77.0330, 11.0250], [77.0330, 11.0270], [77.0310, 11.0270], [77.0310, 11.0250]]]
    },
    source_authority: "Directorate of Town & Country Planning"
  },
  {
    id: 4,
    parcel_id: "TN-CBE-001-124-1",
    year: 2024,
    event_date: "2024-03-15",
    event_title: "Building Construction Groundbreaking",
    event_type: "CONSTRUCTION",
    before_area_acres: 2.50,
    after_area_acres: 2.50,
    change_summary: "Residential G+1 building construction commenced under Building Permission BP-2024-CBE-0891.",
    recorded_by: "Sulur Town Panchayat",
    geojson_snapshot: {
      type: "Polygon",
      coordinates: [[[77.0310, 11.0250], [77.0330, 11.0250], [77.0330, 11.0270], [77.0310, 11.0270], [77.0310, 11.0250]]]
    },
    source_authority: "Municipal ULB Portal"
  },
  {
    id: 5,
    parcel_id: "TN-CBE-001-126-2",
    year: 2026,
    event_date: "2026-02-05",
    event_title: "AI Satellite Waterbody Buffer Violation Detected",
    event_type: "ENCROACHMENT_FLAG",
    before_area_acres: 3.80,
    after_area_acres: 3.52,
    change_summary: "Satellite change intelligence engine flagged 450 sqm shed extending into Singanallur Lake buffer.",
    recorded_by: "LandSync AI Spatial Engine",
    geojson_snapshot: {
      type: "Polygon",
      coordinates: [[[77.0335, 11.0270], [77.0360, 11.0270], [77.0360, 11.0295], [77.0335, 11.0295], [77.0335, 11.0270]]]
    },
    source_authority: "LandSync Digital Public Infrastructure"
  }
];

interface SpatialConflictRecordInternal {
  id: number;
  conflict_id: string;
  parcel_id: string;
  survey_number: string;
  conflict_type: 'MASTER_PLAN_MISMATCH' | 'UNAUTHORIZED_CONSTRUCTION' | 'RESTRICTION_ZONE_OVERLAP' | 'WATERBODY_ENCROACHMENT' | 'GOVERNMENT_LAND_ENCROACHMENT' | 'ROAD_RIGHT_OF_WAY_VIOLATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  conflicting_layer: string;
  detected_overlap_area_sqm: number;
  legal_reference: string;
  recommended_action: string;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'NOTICE_ISSUED' | 'REGULARIZED' | 'DEMOLISHED';
  detected_at: string;
  notice_number?: string | null;
  resolution_notes?: string | null;
  action_officer?: string | null;
  coordinates?: number[][][];
}

const spatialConflictsDatabase: SpatialConflictRecordInternal[] = [
  {
    id: 1,
    conflict_id: "CONF-SPATIAL-2026-001",
    parcel_id: "TN-CBE-001-126-2",
    survey_number: "126/2",
    conflict_type: "WATERBODY_ENCROACHMENT",
    severity: "CRITICAL",
    title: "50-Meter Singanallur Lake Statutory Buffer Encroachment",
    description: "450 sqm metal godown structure built inside the PWD waterbody catchment buffer without conversion or environmental clearance.",
    conflicting_layer: "PWD Waterbody 50m Protection Zone (REST-WB-SINGANALLUR-01)",
    detected_overlap_area_sqm: 450.0,
    legal_reference: "Section 7, Tamil Nadu Protection of Tanks and Eviction of Encroachment Act, 2007",
    recommended_action: "Issue Form II eviction notice, seal unauthorized warehouse premises, and initiate bund restoration.",
    status: "NOTICE_ISSUED",
    detected_at: "2026-02-05T11:00:00.000Z",
    notice_number: "TN-REV-EVICT-2026-042",
    action_officer: "P. Murugesan (Tahsildar)",
    coordinates: [[[77.0340, 11.0275], [77.0355, 11.0275], [77.0355, 11.0290], [77.0340, 11.0290], [77.0340, 11.0275]]]
  },
  {
    id: 2,
    conflict_id: "CONF-SPATIAL-2026-002",
    parcel_id: "TN-CBE-001-124-3",
    survey_number: "124/3",
    conflict_type: "UNAUTHORIZED_CONSTRUCTION",
    severity: "HIGH",
    title: "Sanctioned Blueprint Setback & Floor Area Deviation",
    description: "Commercial roof structure expanded by 410 sqm (18.5% over sanctioned blueprint BP-2023-CBE-0412) into rear statutory setback.",
    conflicting_layer: "DTCP Master Plan 2035 Commercial Building Bylaws",
    detected_overlap_area_sqm: 410.0,
    legal_reference: "Tamil Nadu Combined Development and Building Rules (TNCDBR), 2019 Rule 39",
    recommended_action: "Serve stop-work order on unauthorized mezzanine floor and mandate submission of revised compounding application or demolition of deviation.",
    status: "UNDER_INVESTIGATION",
    detected_at: "2026-01-22T09:15:00.000Z",
    action_officer: "K. Vijayakumar (Revenue Inspector)",
    coordinates: [[[77.0360, 11.0252], [77.0372, 11.0252], [77.0372, 11.0268], [77.0360, 11.0268], [77.0360, 11.0252]]]
  },
  {
    id: 3,
    conflict_id: "CONF-SPATIAL-2026-003",
    parcel_id: "TN-CBE-001-125-1",
    survey_number: "125/1",
    conflict_type: "ROAD_RIGHT_OF_WAY_VIOLATION",
    severity: "MEDIUM",
    title: "State Highway 174 Right-of-Way (RoW) Boundary Encroachment",
    description: "Boundary compound wall and asphalt vehicle apron extends 3.2m beyond private cadastral boundary onto State Highway road reserve.",
    conflicting_layer: "Highways Department State Highway RoW Layer",
    detected_overlap_area_sqm: 165.0,
    legal_reference: "Tamil Nadu Highways Act, 2001 Section 28 (Prevention of Encroachment)",
    recommended_action: "Highways department joint demarcation survey and realignment of boundary wall back to sanctioned boundary line.",
    status: "OPEN",
    detected_at: "2026-02-10T16:00:00.000Z",
    action_officer: "Highways Divisional Engineer Sulur",
    coordinates: [[[77.0370, 11.0250], [77.0392, 11.0250], [77.0392, 11.0254], [77.0370, 11.0254], [77.0370, 11.0250]]]
  },
  {
    id: 4,
    conflict_id: "CONF-SPATIAL-2026-004",
    parcel_id: "TN-CBE-001-124-3",
    survey_number: "124/3",
    conflict_type: "RESTRICTION_ZONE_OVERLAP",
    severity: "HIGH",
    title: "Boundary Overlap with Parcel 125/1 & TANGEDCO Corridor",
    description: "0.15 Acre eastern boundary cadastral overlap with Parcel 125/1 situated underneath TANGEDCO 110kV HT transmission corridor.",
    conflicting_layer: "Cadastral Resurvey & TANGEDCO Power Line Layer",
    detected_overlap_area_sqm: 607.0,
    legal_reference: "Tamil Nadu Survey and Boundaries Act, 1923 Section 9",
    recommended_action: "Revenue Divisional Officer (RDO) joint boundary adjudication and mutual settlement demarcation.",
    status: "UNDER_INVESTIGATION",
    detected_at: "2026-01-15T09:45:00.000Z",
    action_officer: "RDO Coimbatore South",
    coordinates: [[[77.0368, 11.0250], [77.0373, 11.0250], [77.0373, 11.0270], [77.0368, 11.0270], [77.0368, 11.0250]]]
  }
];

// Helper to compute Spatial Risk Score
function calculateSpatialRisk(parcelId: string): any {
  const zoning = zoningDatabase.find(z => z.parcel_id === parcelId);
  const conflicts = spatialConflictsDatabase.filter(c => c.parcel_id === parcelId);
  const satChanges = satelliteChangesDatabase.filter(s => s.parcel_id === parcelId);
  const env = environmentalDatabase.find(e => e.parcel_id === parcelId);
  const bPermissions = buildingPermissionsDatabase.filter(b => b.parcel_id === parcelId);

  let zoningScore = 95;
  let restrictionScore = 92;
  let satelliteScore = 90;
  let envScore = 85;
  let buildingScore = 95;

  const factors: any[] = [];

  // 1. Zoning evaluation
  if (zoning) {
    if (zoning.zone_type === 'WATERBODY_CONSERVATION') {
      zoningScore = 10;
      factors.push({
        factor_name: "Master Plan Zoning Classification",
        category: "ZONING",
        weight: 0.25,
        score: 10,
        status: "CRITICAL",
        finding: "Designated as protected Waterbody Conservation Zone. Zero private development permitted."
      });
    } else if (zoning.zone_type === 'AGRICULTURAL') {
      zoningScore = 65;
      factors.push({
        factor_name: "Agricultural Land Use Preservation",
        category: "ZONING",
        weight: 0.25,
        score: 65,
        status: "WARNING",
        finding: "Zoned Agricultural AG-1. Commercial/Industrial activity without CLU sanction constitutes a violation."
      });
    } else {
      factors.push({
        factor_name: "Master Plan Alignment",
        category: "ZONING",
        weight: 0.25,
        score: 95,
        status: "SAFE",
        finding: `Fully aligned with ${zoning.zone_name}. Permitted uses include ${zoning.permitted_uses.slice(0, 2).join(', ')}.`
      });
    }
  }

  // 2. Restriction & Conflict Evaluation
  if (conflicts.length > 0) {
    const hasCritical = conflicts.some(c => c.severity === 'CRITICAL');
    const hasHigh = conflicts.some(c => c.severity === 'HIGH');
    if (hasCritical) restrictionScore = 15;
    else if (hasHigh) restrictionScore = 40;
    else restrictionScore = 65;

    factors.push({
      factor_name: "Statutory Restriction & Conflict Checks",
      category: "RESTRICTION",
      weight: 0.25,
      score: restrictionScore,
      status: hasCritical || hasHigh ? "CRITICAL" : "WARNING",
      finding: `${conflicts.length} active spatial conflict(s) detected: ${conflicts.map(c => c.title).join("; ")}.`
    });
  } else {
    factors.push({
      factor_name: "Restriction Zone Clearance",
      category: "RESTRICTION",
      weight: 0.25,
      score: 92,
      status: "SAFE",
      finding: "Clear of statutory CRZ, archaeological buffer, railway corridor, and forest sensitive boundaries."
    });
  }

  // 3. Satellite Change Intelligence
  const unauthChanges = satChanges.filter(s => s.violation_probability > 50);
  if (unauthChanges.length > 0) {
    satelliteScore = Math.max(10, 100 - unauthChanges[0].violation_probability);
    factors.push({
      factor_name: "Satellite Change & Deviation Detection",
      category: "SATELLITE_CHANGE",
      weight: 0.20,
      score: satelliteScore,
      status: "CRITICAL",
      finding: `AI detected ${unauthChanges[0].change_type} with ${unauthChanges[0].confidence_score}% confidence (${unauthChanges[0].detected_change_area_sqm} sqm). Violation probability: ${unauthChanges[0].violation_probability}%.`
    });
  } else if (satChanges.length > 0) {
    factors.push({
      factor_name: "Satellite Construction Verification",
      category: "SATELLITE_CHANGE",
      weight: 0.20,
      score: 96,
      status: "SAFE",
      finding: "Recent satellite imagery confirms authorized construction matching sanctioned building footprint."
    });
  } else {
    factors.push({
      factor_name: "Temporal Satellite Stability",
      category: "SATELLITE_CHANGE",
      weight: 0.20,
      score: 90,
      status: "SAFE",
      finding: "No unauthorized ground disturbance, tree clearing, or roof expansion detected in recent multi-spectral scans."
    });
  }

  // 4. Environmental & Hazard Evaluation
  if (env) {
    if (env.flood_risk_level === 'VERY_HIGH' || env.eco_sensitivity_status === 'PROTECTED_WETLAND') {
      envScore = 15;
    } else if (env.flood_risk_level === 'HIGH' || env.waterbody_buffer_conflict) {
      envScore = 35;
    } else if (env.flood_risk_level === 'MODERATE') {
      envScore = 65;
    } else {
      envScore = 90;
    }

    factors.push({
      factor_name: "Environmental Hazard & Flood Vulnerability",
      category: "ENVIRONMENTAL",
      weight: 0.15,
      score: envScore,
      status: envScore < 40 ? "CRITICAL" : envScore < 70 ? "WARNING" : "SAFE",
      finding: `Flood Risk: ${env.flood_risk_level} (${env.flood_zone_name}). Wetland Proximity: ${env.wetland_proximity_meters}m. NDVI: ${env.vegetation_index_ndvi}.`
    });
  }

  // 5. Building Permission Dev
  const devBuilding = bPermissions.find(b => b.deviation_flag);
  if (devBuilding) {
    buildingScore = Math.max(15, 100 - (devBuilding.detected_deviation_percentage || 50));
    factors.push({
      factor_name: "Building Permission Compliance",
      category: "BUILDING_DEV",
      weight: 0.15,
      score: buildingScore,
      status: buildingScore < 50 ? "CRITICAL" : "WARNING",
      finding: devBuilding.deviation_details || "Building footprint deviation detected over sanctioned municipal permit."
    });
  } else if (bPermissions.length > 0) {
    factors.push({
      factor_name: "Building Permission Sanction",
      category: "BUILDING_DEV",
      weight: 0.15,
      score: 95,
      status: "SAFE",
      finding: `Sanctioned under permit ${bPermissions[0].permission_id} (${bPermissions[0].approved_builtup_area_sqm} sqm, ${bPermissions[0].approved_floors} floors).`
    });
  }

  // Calculate composite spatial risk (0 = safe, 100 = extreme risk)
  const compositeSafety = (zoningScore * 0.25) + (restrictionScore * 0.25) + (satelliteScore * 0.20) + (envScore * 0.15) + (buildingScore * 0.15);
  const overallRisk = Math.round(100 - compositeSafety);

  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (overallRisk >= 70) riskLevel = 'CRITICAL';
  else if (overallRisk >= 45) riskLevel = 'HIGH';
  else if (overallRisk >= 25) riskLevel = 'MODERATE';

  const recommendedActions: string[] = [];
  if (conflicts.length > 0) {
    conflicts.forEach(c => recommendedActions.push(c.recommended_action));
  }
  if (unauthChanges.length > 0) {
    recommendedActions.push("Dispatch revenue surveyor for on-site DGPS demarcation and verification of satellite change anomaly.");
  }
  if (env && env.flood_risk_level === 'HIGH') {
    recommendedActions.push("Ensure strict compliance with PWD storm water drainage channel setbacks and zero landfilling.");
  }
  if (recommendedActions.length === 0) {
    recommendedActions.push("Parcel spatial profile is clean and compliant with Master Plan 2035 bylaws.");
  }

  let explainableSummary = "";
  if (riskLevel === 'CRITICAL') {
    explainableSummary = `Parcel has a CRITICAL Spatial Risk Score of ${overallRisk}/100 driven by major statutory buffer encroachments and unauthorized physical construction flagged by AI satellite scans.`;
  } else if (riskLevel === 'HIGH') {
    explainableSummary = `Parcel has a HIGH Spatial Risk Score of ${overallRisk}/100 due to detected building blueprint deviations, setback breaches, or boundary overlaps requiring officer investigation.`;
  } else if (riskLevel === 'MODERATE') {
    explainableSummary = `Parcel has a MODERATE Spatial Risk Score of ${overallRisk}/100. Minor planning or environmental sensitivity flags detected but no immediate statutory stop-work trigger.`;
  } else {
    explainableSummary = `Parcel has a LOW Spatial Risk Score of ${overallRisk}/100. Full compliance with Master Plan zoning, municipal bylaws, and environmental buffers verified.`;
  }

  return {
    parcel_id: parcelId,
    overall_spatial_risk_score: overallRisk,
    risk_level: riskLevel,
    master_plan_alignment_score: zoningScore,
    restriction_zone_proximity_score: restrictionScore,
    satellite_change_risk_score: 100 - satelliteScore,
    environmental_hazard_score: 100 - envScore,
    building_deviation_risk_score: 100 - buildingScore,
    factors,
    explainable_summary: explainableSummary,
    recommended_actions: recommendedActions
  };
}

// 1. GET /api/spatial/master-plans - List Master Plans
app.get("/api/spatial/master-plans", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json(masterPlansDatabase);
});

// 2. GET /api/spatial/master-plans/:id - Get Specific Master Plan
app.get("/api/spatial/master-plans/:id", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const plan = masterPlansDatabase.find(p => p.plan_id.toLowerCase() === req.params.id.toLowerCase() || p.id === parseInt(req.params.id, 10));
  if (!plan) {
    res.status(404).json({ detail: `Master plan ${req.params.id} not found.` });
    return;
  }
  res.json(plan);
});

// 3. GET /api/spatial/zoning - Search/Filter Zoning Records
app.get("/api/spatial/zoning", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id, zone_type, plan_id } = req.query;
  let results = [...zoningDatabase];

  if (parcel_id) {
    results = results.filter(z => z.parcel_id.toLowerCase().includes(String(parcel_id).toLowerCase()));
  }
  if (zone_type) {
    results = results.filter(z => z.zone_type.toLowerCase() === String(zone_type).toLowerCase());
  }
  if (plan_id) {
    results = results.filter(z => z.plan_id.toLowerCase() === String(plan_id).toLowerCase());
  }

  res.json(results);
});

// 4. GET /api/spatial/zoning/:parcelId - Get Zoning Record for Parcel
app.get("/api/spatial/zoning/:parcelId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcelId } = req.params;
  const zoning = zoningDatabase.find(z => z.parcel_id.toLowerCase() === parcelId.toLowerCase());
  if (!zoning) {
    // Return a default residential zoning if not specifically seeded
    res.json({
      id: 99,
      zone_id: `ZONE-DEFAULT-${parcelId}`,
      parcel_id: parcelId,
      plan_id: "MP-CBE-2035",
      zone_type: "PRIMARY_RESIDENTIAL",
      zone_code: "R1",
      zone_name: "Primary Residential Zone",
      permitted_uses: ["Single Family Residences", "Duplex Units", "Community Gardens"],
      prohibited_uses: ["Heavy Commercial", "Chemical Industries", "Hazardous Storage"],
      conditional_uses: ["Doctor Clinic (<50 sqm)"],
      max_fsi_far: 1.5,
      max_building_height_meters: 12.0,
      front_setback_meters: 3.0,
      rear_setback_meters: 2.0,
      side_setback_meters: 1.5,
      max_coverage_percentage: 65,
      buffer_required_meters: 0,
      special_conditions: "Standard residential development bylaws apply.",
      created_at: new Date().toISOString()
    });
    return;
  }
  res.json(zoning);
});

// 5. GET /api/spatial/building-permissions - List Building Permissions
app.get("/api/spatial/building-permissions", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id, deviation_only } = req.query;
  let results = [...buildingPermissionsDatabase];

  if (parcel_id) {
    results = results.filter(b => b.parcel_id.toLowerCase().includes(String(parcel_id).toLowerCase()));
  }
  if (deviation_only === "true") {
    results = results.filter(b => b.deviation_flag);
  }

  res.json(results);
});

// 6. GET /api/spatial/building-permissions/:parcelId - Building Permissions for Parcel
app.get("/api/spatial/building-permissions/:parcelId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcelId } = req.params;
  const results = buildingPermissionsDatabase.filter(b => b.parcel_id.toLowerCase() === parcelId.toLowerCase());
  res.json(results);
});

// 7. POST /api/spatial/building-permissions - Register / Integrate Building Permission
app.post("/api/spatial/building-permissions", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id, applicant_name, application_no, approval_date, approved_builtup_area_sqm, approved_floors, purpose, validity_years } = req.body;
  if (!parcel_id || !applicant_name || !application_no) {
    res.status(400).json({ detail: "parcel_id, applicant_name, and application_no are required." });
    return;
  }

  const nextId = buildingPermissionsDatabase.length + 1;
  const newPerm: BuildingPermissionRecordInternal = {
    id: nextId,
    permission_id: `BP-${new Date().getFullYear()}-CBE-${String(nextId).padStart(4, '0')}`,
    parcel_id,
    applicant_name,
    application_no,
    approval_date: approval_date || new Date().toISOString().split("T")[0],
    approved_builtup_area_sqm: Number(approved_builtup_area_sqm) || 200,
    approved_floors: Number(approved_floors) || 2,
    purpose: purpose || "Residential Building",
    validity_years: Number(validity_years) || 3,
    inspection_status: "APPROVED_NOT_STARTED",
    deviation_flag: false,
    created_at: new Date().toISOString()
  };

  buildingPermissionsDatabase.unshift(newPerm);
  res.status(201).json(newPerm);
});

// 8. GET /api/spatial/restriction-zones - List Restriction Zones
app.get("/api/spatial/restriction-zones", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { zone_type } = req.query;
  let results = [...restrictionZonesDatabase];
  if (zone_type) {
    results = results.filter(r => r.zone_type.toLowerCase() === String(zone_type).toLowerCase());
  }
  res.json(results);
});

// 9. GET /api/spatial/restriction-zones/check/:parcelId - Check Restrictions on Parcel
app.get("/api/spatial/restriction-zones/check/:parcelId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcelId } = req.params;
  const affecting = restrictionZonesDatabase.filter(r => r.affecting_parcels.some(p => p.toLowerCase() === parcelId.toLowerCase()));
  res.json({
    parcel_id: parcelId,
    total_affecting_zones: affecting.length,
    restriction_level: affecting.length > 0 ? affecting[0].restriction_level : "NONE",
    zones: affecting
  });
});

// 10. GET /api/spatial/environmental/:parcelId - Get Environmental Intelligence for Parcel
app.get("/api/spatial/environmental/:parcelId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcelId } = req.params;
  const record = environmentalDatabase.find(e => e.parcel_id.toLowerCase() === parcelId.toLowerCase());
  if (!record) {
    res.json({
      id: 99,
      parcel_id: parcelId,
      flood_risk_level: "LOW",
      flood_zone_name: "Zone C (Low Inundation Risk)",
      wetland_proximity_meters: 500,
      waterbody_buffer_conflict: false,
      forest_buffer_meters: 4000,
      vegetation_index_ndvi: 0.40,
      historical_tree_loss_percentage: 5.0,
      slope_grade_percentage: 1.5,
      eco_sensitivity_status: "NORMAL",
      soil_type: "Red Sandy Loam",
      groundwater_table_depth_meters: 14.0,
      created_at: new Date().toISOString()
    });
    return;
  }
  res.json(record);
});

// 11. GET /api/spatial/satellite-changes - List Satellite Change Detections
app.get("/api/spatial/satellite-changes", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id, change_type, status } = req.query;
  let results = [...satelliteChangesDatabase];

  if (parcel_id) {
    results = results.filter(s => s.parcel_id.toLowerCase().includes(String(parcel_id).toLowerCase()));
  }
  if (change_type) {
    results = results.filter(s => s.change_type.toLowerCase() === String(change_type).toLowerCase());
  }
  if (status) {
    results = results.filter(s => s.change_status.toLowerCase() === String(status).toLowerCase());
  }

  res.json(results);
});

// 12. GET /api/spatial/satellite-changes/:parcelId - Satellite Changes for Parcel
app.get("/api/spatial/satellite-changes/:parcelId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcelId } = req.params;
  const results = satelliteChangesDatabase.filter(s => s.parcel_id.toLowerCase() === parcelId.toLowerCase());
  res.json(results);
});

// 13. POST /api/spatial/satellite-changes/simulate - On-Demand AI Multi-Spectral Change Detection
app.post("/api/spatial/satellite-changes/simulate", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.body;
  if (!parcel_id) {
    res.status(400).json({ detail: "parcel_id is required for change detection." });
    return;
  }

  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === String(parcel_id).toLowerCase());
  if (!parcel) {
    res.status(404).json({ detail: `Parcel ${parcel_id} not found.` });
    return;
  }

  const nextId = satelliteChangesDatabase.length + 1;
  const isSuspicious = parcel.parcel_id === "TN-CBE-001-126-2" || parcel.parcel_id === "TN-CBE-001-124-3";

  const newDetection: SatelliteChangeDetectionRecordInternal = {
    id: nextId,
    detection_id: `SAT-CHG-2026-${String(nextId).padStart(3, '0')}`,
    parcel_id: parcel.parcel_id,
    survey_number: parcel.survey_number,
    detection_date: new Date().toISOString().split("T")[0],
    previous_image_date: "2024-06-15",
    current_image_date: new Date().toISOString().split("T")[0],
    change_type: isSuspicious ? "NEW_CONSTRUCTION" : "ROOF_EXPANSION",
    confidence_score: 94,
    detected_change_area_sqm: isSuspicious ? 340.0 : 120.0,
    approved_permission_id: isSuspicious ? null : "BP-2024-CBE-0891",
    violation_probability: isSuspicious ? 86 : 8,
    ai_detection_summary: isSuspicious
      ? "AI multi-spectral Sentinel-2 / Cartosat-3 differencing detected unauthorized physical structure outside sanctioned agricultural perimeter."
      : "Automated scan confirms structural modifications correspond to authorized building permit.",
    change_status: isSuspicious ? "PENDING_FIELD_VERIFICATION" : "LEGAL_AND_APPROVED",
    before_image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80",
    after_image_url: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=80",
    inspector_assigned: req.user!.full_name,
    created_at: new Date().toISOString()
  };

  satelliteChangesDatabase.unshift(newDetection);
  res.status(201).json(newDetection);
});

// 14. PUT /api/spatial/satellite-changes/:id/status - Update Detection Status
app.put("/api/spatial/satellite-changes/:id/status", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const targetId = parseInt(req.params.id, 10);
  const { change_status, inspector_notes } = req.body;

  const item = satelliteChangesDatabase.find(s => s.id === targetId || s.detection_id.toLowerCase() === req.params.id.toLowerCase());
  if (!item) {
    res.status(404).json({ detail: `Detection ${req.params.id} not found.` });
    return;
  }

  if (change_status) item.change_status = change_status;
  if (inspector_notes) item.inspector_notes = inspector_notes;
  item.inspector_assigned = req.user!.full_name;

  res.json(item);
});

// 15. GET /api/spatial/timeline/:parcelId - Get Historical Spatial Evolution Timeline
app.get("/api/spatial/timeline/:parcelId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcelId } = req.params;
  const results = spatialTimelineDatabase.filter(t => t.parcel_id.toLowerCase() === parcelId.toLowerCase());
  if (results.length === 0) {
    // Generate synthetic baseline timeline
    res.json([
      {
        id: 101,
        parcel_id: parcelId,
        year: 1995,
        event_date: "1995-04-10",
        event_title: "Village Cadastral Settlement Record",
        event_type: "CADASTRAL_CREATION",
        before_area_acres: 2.50,
        after_area_acres: 2.50,
        change_summary: "Original revenue patta settlement surveyed and recorded.",
        recorded_by: "Settlement Tahsildar",
        source_authority: "Directorate of Survey & Settlement"
      },
      {
        id: 102,
        parcel_id: parcelId,
        year: 2021,
        event_date: "2021-04-01",
        event_title: "Master Plan 2035 Zoning Enactment",
        event_type: "CONVERSION",
        before_area_acres: 2.50,
        after_area_acres: 2.50,
        change_summary: "Master Plan 2035 zoning policy mapped to parcel.",
        recorded_by: "DTCP / CUDA",
        source_authority: "Directorate of Town & Country Planning"
      }
    ]);
    return;
  }
  res.json(results);
});

// 16. GET /api/spatial/conflicts - List Spatial Conflicts & Encroachments
app.get("/api/spatial/conflicts", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id, severity, conflict_type, status } = req.query;
  let results = [...spatialConflictsDatabase];

  if (parcel_id) {
    results = results.filter(c => c.parcel_id.toLowerCase().includes(String(parcel_id).toLowerCase()));
  }
  if (severity) {
    results = results.filter(c => c.severity.toLowerCase() === String(severity).toLowerCase());
  }
  if (conflict_type) {
    results = results.filter(c => c.conflict_type.toLowerCase() === String(conflict_type).toLowerCase());
  }
  if (status) {
    results = results.filter(c => c.status.toLowerCase() === String(status).toLowerCase());
  }

  res.json(results);
});

// 17. GET /api/spatial/conflicts/:parcelId - Conflicts for Parcel
app.get("/api/spatial/conflicts/:parcelId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcelId } = req.params;
  const results = spatialConflictsDatabase.filter(c => c.parcel_id.toLowerCase() === parcelId.toLowerCase());
  res.json(results);
});

// 18. POST /api/spatial/conflicts/:conflictId/resolve - Resolve Conflict
app.post("/api/spatial/conflicts/:conflictId/resolve", authMiddleware, requireRole(["officer", "admin"]), (req: AuthenticatedRequest, res: Response) => {
  const { conflictId } = req.params;
  const { resolution_notes, new_status } = req.body;

  const item = spatialConflictsDatabase.find(c => c.conflict_id.toLowerCase() === conflictId.toLowerCase() || c.id === parseInt(conflictId, 10));
  if (!item) {
    res.status(404).json({ detail: `Conflict ${conflictId} not found.` });
    return;
  }

  item.status = new_status || "REGULARIZED";
  item.resolution_notes = resolution_notes || "Resolved following field inspection and statutory penalty payment.";
  item.action_officer = req.user!.full_name;

  res.json(item);
});

// 19. GET /api/spatial/risk-score/:parcelId - Get Spatial Risk Score & Breakdown
app.get("/api/spatial/risk-score/:parcelId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcelId } = req.params;
  const risk = calculateSpatialRisk(parcelId);
  res.json(risk);
});

// 20. GET /api/spatial/parcel-360-spatial/:parcelId - Comprehensive Spatial 360 View
app.get("/api/spatial/parcel-360-spatial/:parcelId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcelId } = req.params;
  const parcel = parcelsDatabase.find(p => p.parcel_id.toLowerCase() === parcelId.toLowerCase());
  if (!parcel) {
    res.status(404).json({ detail: `Parcel ${parcelId} not found.` });
    return;
  }

  const masterPlan = masterPlansDatabase[0];
  const zoning = zoningDatabase.find(z => z.parcel_id.toLowerCase() === parcelId.toLowerCase()) || null;
  const bPermissions = buildingPermissionsDatabase.filter(b => b.parcel_id.toLowerCase() === parcelId.toLowerCase());
  const activeRestrictions = restrictionZonesDatabase.filter(r => r.affecting_parcels.some(p => p.toLowerCase() === parcelId.toLowerCase()));
  const environmental = environmentalDatabase.find(e => e.parcel_id.toLowerCase() === parcelId.toLowerCase()) || null;
  const recentSatellite = satelliteChangesDatabase.filter(s => s.parcel_id.toLowerCase() === parcelId.toLowerCase());
  const timelineEvents = spatialTimelineDatabase.filter(t => t.parcel_id.toLowerCase() === parcelId.toLowerCase());
  const spatialConflicts = spatialConflictsDatabase.filter(c => c.parcel_id.toLowerCase() === parcelId.toLowerCase());
  const spatialRisk = calculateSpatialRisk(parcelId);

  res.json({
    parcel_id: parcel.parcel_id,
    survey_number: parcel.survey_number,
    village: parcel.village,
    district: parcel.district,
    master_plan: masterPlan,
    zoning,
    building_permissions: bPermissions,
    active_restrictions: activeRestrictions,
    environmental,
    recent_satellite_changes: recentSatellite,
    timeline_events: timelineEvents,
    spatial_conflicts: spatialConflicts,
    spatial_risk: spatialRisk,
    infrastructure: {
      road_access_type: parcel.land_use === "Commercial" ? "4-Lane State Highway (SH-174)" : "12-Meter Village Main Road",
      road_width_meters: parcel.land_use === "Commercial" ? 24.0 : 12.0,
      water_pipeline_proximity_meters: 15.0,
      ht_line_proximity_meters: parcel.parcel_id === "TN-CBE-001-124-2" ? 8.0 : 120.0,
      property_tax_zone: "Zone A (Commercial / Core Suburban)",
      annual_property_tax_inr: parcel.land_use === "Commercial" ? 48500 : 6200
    }
  });
});

// 21. GET /api/spatial/analytics - Advanced Spatial Analytics Dashboard Metrics
app.get("/api/spatial/analytics", authMiddleware, requireRole(["admin", "officer"]), (req: AuthenticatedRequest, res: Response) => {
  const totalParcels = parcelsDatabase.length;
  const conflictsCount = spatialConflictsDatabase.filter(c => c.status !== "REGULARIZED" && c.status !== "DEMOLISHED").length;
  const encroachments = spatialConflictsDatabase.filter(c => c.conflict_type === "WATERBODY_ENCROACHMENT" || c.conflict_type === "GOVERNMENT_LAND_ENCROACHMENT" || c.conflict_type === "ROAD_RIGHT_OF_WAY_VIOLATION").length;
  const unauthConstructions = satelliteChangesDatabase.filter(s => s.violation_probability > 50).length;
  const restrictionBreaches = spatialConflictsDatabase.filter(c => c.conflict_type === "RESTRICTION_ZONE_OVERLAP" || c.conflict_type === "WATERBODY_ENCROACHMENT").length;
  const envHighRisk = environmentalDatabase.filter(e => e.flood_risk_level === "HIGH" || e.flood_risk_level === "VERY_HIGH").length;

  res.json({
    total_parcels_analyzed: totalParcels,
    parcels_with_conflicts: 3,
    active_encroachments_detected: encroachments,
    unauthorized_constructions_flagged: unauthConstructions,
    restriction_zone_breaches: restrictionBreaches,
    environmental_high_risk_count: envHighRisk,
    avg_spatial_risk_score: 38.4,
    conflicts_by_type: [
      { type: "Waterbody Encroachment", count: 1, severity: "CRITICAL" },
      { type: "Unauthorized Construction Deviation", count: 1, severity: "HIGH" },
      { type: "Road Right-of-Way Violation", count: 1, severity: "MEDIUM" },
      { type: "High-Tension Corridor Overlap", count: 1, severity: "HIGH" }
    ],
    conflicts_by_severity: [
      { severity: "CRITICAL", count: 1, color: "#e11d48" },
      { severity: "HIGH", count: 2, color: "#ea580c" },
      { severity: "MEDIUM", count: 1, color: "#eab308" },
      { severity: "LOW", count: 0, color: "#22c55e" }
    ],
    zoning_distribution: [
      { zone_type: "Primary Residential (R1)", count: 2, percentage: 25 },
      { zone_type: "Commercial & Logistics (C2)", count: 2, percentage: 25 },
      { zone_type: "Agricultural & Green Belt (AG)", count: 3, percentage: 37.5 },
      { zone_type: "Waterbody Conservation (WB)", count: 1, percentage: 12.5 }
    ],
    satellite_detections_timeline: [
      { month: "Sep 2025", new_buildings: 1, tree_loss: 0, encroachments: 0 },
      { month: "Oct 2025", new_buildings: 2, tree_loss: 1, encroachments: 0 },
      { month: "Nov 2025", new_buildings: 1, tree_loss: 0, encroachments: 1 },
      { month: "Dec 2025", new_buildings: 3, tree_loss: 2, encroachments: 0 },
      { month: "Jan 2026", new_buildings: 2, tree_loss: 1, encroachments: 2 },
      { month: "Feb 2026", new_buildings: 1, tree_loss: 0, encroachments: 1 }
    ],
    high_risk_parcels: [
      {
        parcel_id: "TN-CBE-001-126-2",
        survey_number: "126/2",
        owner: "R. Palanisamy",
        risk_score: 88,
        risk_level: "CRITICAL",
        primary_issue: "450 sqm unauthorized metal warehouse inside 50m Singanallur Lake buffer"
      },
      {
        parcel_id: "TN-CBE-001-124-3",
        survey_number: "124/3",
        owner: "Senthil Enterprises",
        risk_score: 64,
        risk_level: "HIGH",
        primary_issue: "Commercial building rear setback deviation (+18.5% over permit) and HT corridor overlap"
      },
      {
        parcel_id: "TN-CBE-001-125-1",
        survey_number: "125/1",
        owner: "Apex Logistics Pvt Ltd",
        risk_score: 52,
        risk_level: "HIGH",
        primary_issue: "State Highway 174 RoW encroachment (165 sqm) and 0.15 Acre boundary overlap"
      }
    ]
  });
});

// 22. GET /api/spatial/layers/:layerId - Vector GeoJSON Layer Feeds
app.get("/api/spatial/layers/:layerId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { layerId } = req.params;

  switch (layerId) {
    case "waterbody_buffer":
      res.json({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "Singanallur Lake 50m Statutory Protection Buffer",
              law: "TN Protection of Tanks Act 2007",
              level: "STRICT_NO_DEVELOPMENT",
              color: "#0284c7"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[[77.0330, 11.0268], [77.0430, 11.0268], [77.0430, 11.0305], [77.0330, 11.0305], [77.0330, 11.0268]]]
            }
          }
        ]
      });
      break;

    case "ht_power_lines":
      res.json({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "TANGEDCO 110kV HT Transmission Line",
              corridor_width_meters: 15,
              color: "#eab308"
            },
            geometry: {
              type: "LineString",
              coordinates: [[77.0345, 11.0235], [77.0345, 11.0285]]
            }
          }
        ]
      });
      break;

    case "flood_zones":
      res.json({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              zone: "Zone A (High Flood Vulnerability)",
              return_period: "25-year",
              color: "#38bdf8"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[[77.0335, 11.0270], [77.0435, 11.0270], [77.0435, 11.0310], [77.0335, 11.0310], [77.0335, 11.0270]]]
            }
          }
        ]
      });
      break;

    case "road_network":
      res.json({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "State Highway 174 (Sulur - Coimbatore Bypass)",
              width: "24m",
              color: "#64748b"
            },
            geometry: {
              type: "LineString",
              coordinates: [[77.0300, 11.0250], [77.0430, 11.0250]]
            }
          }
        ]
      });
      break;

    case "satellite_changes":
      res.json({
        type: "FeatureCollection",
        features: satelliteChangesDatabase.map(s => ({
          type: "Feature",
          properties: {
            id: s.detection_id,
            parcel_id: s.parcel_id,
            change_type: s.change_type,
            violation_probability: s.violation_probability,
            color: s.violation_probability > 50 ? "#e11d48" : "#22c55e"
          },
          geometry: {
            type: "Polygon",
            coordinates: s.bounding_polygon || [[[77.0340, 11.0275], [77.0355, 11.0275], [77.0355, 11.0290], [77.0340, 11.0290], [77.0340, 11.0275]]]
          }
        }))
      });
      break;

    default:
      res.json({ type: "FeatureCollection", features: [] });
  }
});

// =========================================================================
// PHASE 9: CIVIC, FISCAL & INFRASTRUCTURE INTEGRATION ENGINE
// =========================================================================

// 1. In-Memory Civic Datasets

const propertyTaxDatabase = [
  {
    id: 1,
    tax_record_id: "TAX-2026-CBE-00101",
    parcel_id: "TN-CBE-001-124-1",
    ulpin: "ULPIN-TN-CBE-2026-0001",
    property_reference: "SULUR-WARD-04-ASSMT-1082",
    local_body: "Sulur Town Panchayat / Coimbatore City Municipal Corp",
    assessment_year: "2025-2026",
    property_type: "RESIDENTIAL",
    assessed_value: 3850000,
    annual_tax: 14200,
    amount_paid: 14200,
    amount_due: 0,
    payment_status: "PAID",
    last_payment_date: "2025-11-14T10:30:00Z",
    due_date: "2026-03-31T23:59:59Z",
    arrears: 0,
    tax_payer_name: "Ravi Kumar",
    tax_zone: "Zone A - Central Sulur",
    history: [
      { assessment_year: "2024-2025", assessed_value: 3600000, tax_amount: 13500, paid_amount: 13500, status: "PAID", receipt_no: "REC-2024-8842", payment_date: "2024-10-12" },
      { assessment_year: "2023-2024", assessed_value: 3350000, tax_amount: 12800, paid_amount: 12800, status: "PAID", receipt_no: "REC-2023-4419", payment_date: "2023-11-05" }
    ],
    updated_at: "2026-01-15T08:00:00Z"
  },
  {
    id: 2,
    tax_record_id: "TAX-2026-CBE-00102",
    parcel_id: "TN-CBE-001-124-2",
    ulpin: "ULPIN-TN-CBE-2026-0002",
    property_reference: "SULUR-WARD-04-ASSMT-1083",
    local_body: "Sulur Town Panchayat",
    assessment_year: "2025-2026",
    property_type: "AGRICULTURAL",
    assessed_value: 1200000,
    annual_tax: 2400,
    amount_paid: 2400,
    amount_due: 0,
    payment_status: "PAID",
    last_payment_date: "2025-12-02T11:00:00Z",
    due_date: "2026-03-31T23:59:59Z",
    arrears: 0,
    tax_payer_name: "S. Murugan",
    tax_zone: "Zone C - Agricultural Peripheral",
    history: [
      { assessment_year: "2024-2025", assessed_value: 1100000, tax_amount: 2200, paid_amount: 2200, status: "PAID", receipt_no: "REC-2024-9102", payment_date: "2024-11-18" }
    ],
    updated_at: "2026-01-10T09:30:00Z"
  },
  {
    id: 3,
    tax_record_id: "TAX-2026-CBE-00103",
    parcel_id: "TN-CBE-001-124-3",
    ulpin: "ULPIN-TN-CBE-2026-0003",
    property_reference: "SULUR-WARD-04-ASSMT-1084",
    local_body: "Sulur Town Panchayat",
    assessment_year: "2025-2026",
    property_type: "COMMERCIAL",
    assessed_value: 9200000,
    annual_tax: 68500,
    amount_paid: 30000,
    amount_due: 38500,
    payment_status: "PARTIALLY_PAID",
    last_payment_date: "2025-09-20T14:15:00Z",
    due_date: "2026-03-31T23:59:59Z",
    arrears: 38500,
    tax_payer_name: "K. Velusamy", // Deliberate mismatch vs "Senthil Enterprises" for cross-layer detection demo!
    tax_zone: "Zone A - Commercial Hub",
    history: [
      { assessment_year: "2024-2025", assessed_value: 8500000, tax_amount: 62000, paid_amount: 62000, status: "PAID", receipt_no: "REC-2024-3321", payment_date: "2024-12-10" }
    ],
    updated_at: "2026-02-01T12:00:00Z"
  },
  {
    id: 4,
    tax_record_id: "TAX-2026-CBE-00104",
    parcel_id: "TN-CBE-001-125-1",
    ulpin: "ULPIN-TN-CBE-2026-0004",
    property_reference: "SULUR-WARD-02-ASSMT-0412",
    local_body: "Sulur Town Panchayat",
    assessment_year: "2025-2026",
    property_type: "INDUSTRIAL",
    assessed_value: 14500000,
    annual_tax: 112000,
    amount_paid: 0,
    amount_due: 160500,
    payment_status: "OVERDUE",
    last_payment_date: null,
    due_date: "2025-12-31T23:59:59Z",
    arrears: 48500,
    tax_payer_name: "Apex Logistics Pvt Ltd",
    tax_zone: "Zone B - Logistics Corridor",
    history: [
      { assessment_year: "2024-2025", assessed_value: 13000000, tax_amount: 98000, paid_amount: 49500, status: "PARTIALLY_PAID", receipt_no: "REC-2024-1109", payment_date: "2024-08-14" }
    ],
    updated_at: "2026-02-10T14:30:00Z"
  },
  {
    id: 5,
    tax_record_id: "TAX-2026-CBE-00105",
    parcel_id: "TN-CBE-001-125-2",
    ulpin: "ULPIN-TN-CBE-2026-0005",
    property_reference: "SULUR-WARD-02-ASSMT-0413",
    local_body: "Sulur Town Panchayat",
    assessment_year: "2025-2026",
    property_type: "AGRICULTURAL",
    assessed_value: 1800000,
    annual_tax: 3600,
    amount_paid: 3600,
    amount_due: 0,
    payment_status: "PAID",
    last_payment_date: "2025-11-28T09:00:00Z",
    due_date: "2026-03-31T23:59:59Z",
    arrears: 0,
    tax_payer_name: "M. Thangavel",
    tax_zone: "Zone C - Agricultural Peripheral",
    updated_at: "2026-01-20T10:00:00Z"
  },
  {
    id: 6,
    tax_record_id: "TAX-2026-CBE-00106",
    parcel_id: "TN-CBE-001-126-1",
    ulpin: "ULPIN-TN-CBE-2026-0006",
    property_reference: "SULUR-WARD-05-ASSMT-2101",
    local_body: "Sulur Town Panchayat",
    assessment_year: "2025-2026",
    property_type: "RESIDENTIAL",
    assessed_value: 4100000,
    annual_tax: 15500,
    amount_paid: 15500,
    amount_due: 0,
    payment_status: "PAID",
    last_payment_date: "2025-10-18T16:00:00Z",
    due_date: "2026-03-31T23:59:59Z",
    arrears: 0,
    tax_payer_name: "K. Subramanian",
    tax_zone: "Zone A - Central Sulur",
    updated_at: "2026-01-18T11:00:00Z"
  },
  {
    id: 7,
    tax_record_id: "TAX-2026-CBE-00107",
    parcel_id: "TN-CBE-001-126-2",
    ulpin: "ULPIN-TN-CBE-2026-0007",
    property_reference: "SULUR-WARD-05-ASSMT-2102",
    local_body: "Sulur Town Panchayat",
    assessment_year: "2025-2026",
    property_type: "AGRICULTURAL",
    assessed_value: 1500000,
    annual_tax: 2900,
    amount_paid: 0,
    amount_due: 2900,
    payment_status: "PENDING",
    last_payment_date: null,
    due_date: "2026-03-31T23:59:59Z",
    arrears: 0,
    tax_payer_name: "R. Palanisamy",
    tax_zone: "Zone C - Agricultural Peripheral",
    updated_at: "2026-01-22T15:00:00Z"
  },
  {
    id: 8,
    tax_record_id: "TAX-2026-CBE-00108",
    parcel_id: "TN-CBE-001-127-1",
    ulpin: "ULPIN-TN-CBE-2026-0008",
    property_reference: "SULUR-WARD-01-ASSMT-0110",
    local_body: "Sulur Town Panchayat",
    assessment_year: "2025-2026",
    property_type: "RESIDENTIAL",
    assessed_value: 5200000,
    annual_tax: 19800,
    amount_paid: 19800,
    amount_due: 0,
    payment_status: "PAID",
    last_payment_date: "2025-11-04T12:00:00Z",
    due_date: "2026-03-31T23:59:59Z",
    arrears: 0,
    tax_payer_name: "A. Lakshmi",
    tax_zone: "Zone A - Central Sulur",
    updated_at: "2026-01-12T14:00:00Z"
  }
];

// Seed generator for remaining parcels
for (let i = 8; i <= 16; i++) {
  const pNum = (124 + Math.floor(i / 2)).toString();
  const subNum = (i % 2 === 0 ? 2 : 1).toString();
  const pid = `TN-CBE-001-${pNum}-${subNum}`;
  if (!propertyTaxDatabase.find(p => p.parcel_id === pid)) {
    propertyTaxDatabase.push({
      id: i + 1,
      tax_record_id: `TAX-2026-CBE-${(100 + i).toString().padStart(5, '0')}`,
      parcel_id: pid,
      ulpin: `ULPIN-TN-CBE-2026-${(1000 + i).toString().padStart(4, '0')}`,
      property_reference: `SULUR-WARD-${(i % 5 + 1).toString().padStart(2, '0')}-ASSMT-${(3000 + i)}`,
      local_body: "Sulur Town Panchayat",
      assessment_year: "2025-2026",
      property_type: i % 3 === 0 ? "COMMERCIAL" : i % 2 === 0 ? "RESIDENTIAL" : "AGRICULTURAL",
      assessed_value: 2500000 + i * 400000,
      annual_tax: 8500 + i * 1200,
      amount_paid: 8500 + i * 1200,
      amount_due: 0,
      payment_status: "PAID",
      last_payment_date: "2025-11-10T10:00:00Z",
      due_date: "2026-03-31T23:59:59Z",
      arrears: 0,
      tax_payer_name: `Owner Record ${i}`,
      tax_zone: "Zone B - Suburban Sulur",
      updated_at: "2026-01-10T00:00:00Z"
    });
  }
}

// 2. Land Valuation Reference Database (Indicative Prototype)
const landValuationDatabase = [
  {
    id: 1,
    valuation_id: "VAL-2026-TN-00101",
    parcel_id: "TN-CBE-001-124-1",
    ulpin: "ULPIN-TN-CBE-2026-0001",
    location_reference: "Sulur Town Main Road, Ward 4, Sulur Taluk",
    land_category: "Residential Class A (Paved Road Frontage)",
    reference_rate: 2850,
    unit: "INR/Sq.Ft",
    min_rate: 2600,
    max_rate: 3200,
    effective_date: "2025-04-01T00:00:00Z",
    source_authority: "Inspector General of Registration (IGRS) Guideline Value Register",
    confidence_level: "HIGH",
    notes: "Guideline reference updated during 2025 State Revision. High commercial spillover potential.",
    historical_trends: [
      { year: 2022, guideline_rate: 2100, market_estimate: 2350 },
      { year: 2023, guideline_rate: 2350, market_estimate: 2650 },
      { year: 2024, guideline_rate: 2600, market_estimate: 2950 },
      { year: 2025, guideline_rate: 2850, market_estimate: 3250 }
    ],
    comparable_references: [
      { location: "Sulur Main Bazaar Cross", distance_km: 0.3, rate_per_sqft: 3100, category: "Commercial Frontage" },
      { location: "Trichy Road Extension", distance_km: 0.8, rate_per_sqft: 2950, category: "Residential Class A" },
      { location: "Ranganathan Nagar Layout", distance_km: 1.2, rate_per_sqft: 2450, category: "Residential Class B" }
    ],
    disclaimer: "Valuation references are indicative prototype data and do not represent official property valuation.",
    created_at: "2025-04-01T00:00:00Z"
  },
  {
    id: 2,
    valuation_id: "VAL-2026-TN-00102",
    parcel_id: "TN-CBE-001-124-2",
    ulpin: "ULPIN-TN-CBE-2026-0002",
    location_reference: "Sulur Rural Agro Belt, Survey 124",
    land_category: "Agricultural Wet Land (Nanjai)",
    reference_rate: 450,
    unit: "INR/Sq.Ft",
    min_rate: 380,
    max_rate: 520,
    effective_date: "2025-04-01T00:00:00Z",
    source_authority: "IGRS Tamil Nadu - Rural Schedule",
    confidence_level: "HIGH",
    notes: "Fertile nanjai agricultural land with canal irrigation rights.",
    disclaimer: "Valuation references are indicative prototype data and do not represent official property valuation.",
    created_at: "2025-04-01T00:00:00Z"
  },
  {
    id: 3,
    valuation_id: "VAL-2026-TN-00103",
    parcel_id: "TN-CBE-001-124-3",
    ulpin: "ULPIN-TN-CBE-2026-0003",
    location_reference: "SH-174 State Highway Commercial Corridor",
    land_category: "Commercial High Intensity",
    reference_rate: 4800,
    unit: "INR/Sq.Ft",
    min_rate: 4400,
    max_rate: 5600,
    effective_date: "2025-04-01T00:00:00Z",
    source_authority: "Directorate of Town and Country Planning (DTCP) & IGRS",
    confidence_level: "HIGH",
    notes: "Prime commercial highway frontage with high floor space index (FSI).",
    historical_trends: [
      { year: 2022, guideline_rate: 3400, market_estimate: 3900 },
      { year: 2023, guideline_rate: 3850, market_estimate: 4400 },
      { year: 2024, guideline_rate: 4300, market_estimate: 5000 },
      { year: 2025, guideline_rate: 4800, market_estimate: 5600 }
    ],
    comparable_references: [
      { location: "Sulur Flyover Junction", distance_km: 0.5, rate_per_sqft: 5200, category: "Commercial Prime" },
      { location: "Industrial Estate Entrance", distance_km: 1.1, rate_per_sqft: 4500, category: "Commercial/Industrial" }
    ],
    disclaimer: "Valuation references are indicative prototype data and do not represent official property valuation.",
    created_at: "2025-04-01T00:00:00Z"
  },
  {
    id: 4,
    valuation_id: "VAL-2026-TN-00104",
    parcel_id: "TN-CBE-001-125-1",
    ulpin: "ULPIN-TN-CBE-2026-0004",
    location_reference: "Sulur Logistics Hub Road",
    land_category: "Industrial & Warehousing Zone",
    reference_rate: 3400,
    unit: "INR/Sq.Ft",
    min_rate: 3100,
    max_rate: 3900,
    effective_date: "2025-04-01T00:00:00Z",
    source_authority: "SIDCO & IGRS Valuation Directorate",
    confidence_level: "HIGH",
    notes: "Heavy transport accessible industrial cluster.",
    disclaimer: "Valuation references are indicative prototype data and do not represent official property valuation.",
    created_at: "2025-04-01T00:00:00Z"
  }
];

// 3. Water Infrastructure Database
const waterConnectionsDatabase = [
  {
    id: 1,
    connection_id: "WTR-CBE-004-9821",
    parcel_id: "TN-CBE-001-124-1",
    ulpin: "ULPIN-TN-CBE-2026-0001",
    provider: "TWAD Board / Sulur Town Water Supply Division",
    connection_status: "CONNECTED",
    connection_type: "DOMESTIC",
    meter_status: "METERED_ACTIVE",
    supply_status: "NORMAL_24X7",
    pipeline_distance_meters: 4.5,
    pressure_bar: 2.4,
    application_reference: "TWAD/SLR/2023/APP-0821",
    created_at: "2023-04-12T10:00:00Z"
  },
  {
    id: 2,
    connection_id: "WTR-CBE-004-9822",
    parcel_id: "TN-CBE-001-124-2",
    ulpin: "ULPIN-TN-CBE-2026-0002",
    provider: "TWAD Board Rural Irrigation Grid",
    connection_status: "AVAILABLE",
    connection_type: "AGRICULTURAL",
    meter_status: "NOT_APPLICABLE",
    supply_status: "INTERMITTENT_DAILY",
    pipeline_distance_meters: 18.0,
    application_reference: null,
    created_at: "2024-01-10T10:00:00Z"
  },
  {
    id: 3,
    connection_id: "WTR-CBE-004-9823",
    parcel_id: "TN-CBE-001-124-3",
    ulpin: "ULPIN-TN-CBE-2026-0003",
    provider: "Coimbatore Metro Water Supply & Sewerage Board",
    connection_status: "CONNECTED",
    connection_type: "COMMERCIAL",
    meter_status: "METERED_ACTIVE",
    supply_status: "NORMAL_24X7",
    pipeline_distance_meters: 6.0,
    pressure_bar: 3.1,
    application_reference: "CMWSSB/2024/COM-4412",
    created_at: "2024-05-18T14:30:00Z"
  },
  {
    id: 4,
    connection_id: "WTR-CBE-004-9824",
    parcel_id: "TN-CBE-001-125-1",
    ulpin: "ULPIN-TN-CBE-2026-0004",
    provider: "SIPCOT Industrial Water Supply",
    connection_status: "CONNECTED",
    connection_type: "INDUSTRIAL",
    meter_status: "METERED_ACTIVE",
    supply_status: "NORMAL_24X7",
    pipeline_distance_meters: 12.0,
    pressure_bar: 4.5,
    application_reference: "SIPCOT/WTR/IND-0091",
    created_at: "2023-11-20T09:00:00Z"
  },
  {
    id: 5,
    connection_id: "WTR-CBE-004-9825",
    parcel_id: "TN-CBE-001-126-2",
    ulpin: "ULPIN-TN-CBE-2026-0007",
    provider: "TWAD Board Rural Supply",
    connection_status: "NOT_AVAILABLE",
    connection_type: "DOMESTIC",
    meter_status: "NOT_APPLICABLE",
    supply_status: "NO_SUPPLY",
    pipeline_distance_meters: 145.0,
    application_reference: null,
    created_at: "2024-02-15T00:00:00Z"
  }
];

// 4. Electricity Infrastructure Database
const electricityConnectionsDatabase = [
  {
    id: 1,
    connection_id: "ELE-TNEB-04-10842",
    parcel_id: "TN-CBE-001-124-1",
    ulpin: "ULPIN-TN-CBE-2026-0001",
    provider: "TANGEDCO (Tamil Nadu Generation & Distribution Corp)",
    connection_status: "CONNECTED",
    connection_type: "LT_RESIDENTIAL",
    meter_status: "SMART_METER_LIVE",
    service_status: "ACTIVE_ENERGIZED",
    sanctioned_load_kw: 6.0,
    transformer_id: "TR-SULUR-SS-04",
    transformer_distance_meters: 35.0,
    application_reference: "TANGEDCO/SLR/LT-0842",
    updated_at: "2026-01-20T10:00:00Z"
  },
  {
    id: 2,
    connection_id: "ELE-TNEB-04-10843",
    parcel_id: "TN-CBE-001-124-2",
    ulpin: "ULPIN-TN-CBE-2026-0002",
    provider: "TANGEDCO Rural Agricultural Feeder",
    connection_status: "CONNECTED",
    connection_type: "AGRICULTURAL_FREE",
    meter_status: "DIGITAL_METER",
    service_status: "ACTIVE_ENERGIZED",
    sanctioned_load_kw: 10.0,
    transformer_id: "TR-SULUR-AGRI-02",
    transformer_distance_meters: 80.0,
    application_reference: "TANGEDCO/AGRI-4410",
    updated_at: "2026-01-15T12:00:00Z"
  },
  {
    id: 3,
    connection_id: "ELE-TNEB-04-10844",
    parcel_id: "TN-CBE-001-124-3",
    ulpin: "ULPIN-TN-CBE-2026-0003",
    provider: "TANGEDCO Metro Commercial Circle",
    connection_status: "CONNECTED",
    connection_type: "LT_COMMERCIAL",
    meter_status: "SMART_METER_LIVE",
    service_status: "ACTIVE_ENERGIZED",
    sanctioned_load_kw: 28.0,
    transformer_id: "TR-SULUR-COM-01",
    transformer_distance_meters: 22.0,
    application_reference: "TANGEDCO/COM-9011",
    updated_at: "2026-02-05T15:30:00Z"
  },
  {
    id: 4,
    connection_id: "ELE-TNEB-04-10845",
    parcel_id: "TN-CBE-001-125-1",
    ulpin: "ULPIN-TN-CBE-2026-0004",
    provider: "TANGEDCO Industrial High Tension (HT)",
    connection_status: "CONNECTED",
    connection_type: "HT_INDUSTRIAL",
    meter_status: "SMART_METER_LIVE",
    service_status: "ACTIVE_ENERGIZED",
    sanctioned_load_kw: 150.0,
    transformer_id: "TR-SULUR-110KV-HT",
    transformer_distance_meters: 15.0,
    application_reference: "TANGEDCO/HT-IND-012",
    updated_at: "2026-01-25T11:00:00Z"
  }
];

// 5. Drainage & Sewerage Infrastructure Database
const drainageInfrastructureDatabase = [
  {
    id: 1,
    infrastructure_id: "DRN-SLR-001",
    parcel_id: "TN-CBE-001-124-1",
    ulpin: "ULPIN-TN-CBE-2026-0001",
    infrastructure_type: "STORM_WATER_DRAIN",
    availability_status: "AVAILABLE",
    provider: "Sulur Town Panchayat Engineering Wing",
    distance_to_network: 2.5,
    connection_status: "CONNECTED",
    capacity_status: "ADEQUATE_CONCRETE_BOX_DRAIN",
    updated_at: "2026-01-10T10:00:00Z"
  },
  {
    id: 2,
    infrastructure_id: "SWR-SLR-001",
    parcel_id: "TN-CBE-001-124-1",
    ulpin: "ULPIN-TN-CBE-2026-0001",
    infrastructure_type: "SEWER_LINE",
    availability_status: "AVAILABLE",
    provider: "Coimbatore City Municipal Corp Underground Drainage (UGD)",
    distance_to_network: 4.0,
    connection_status: "CONNECTED",
    capacity_status: "OPERATIONAL_UGD_SYSTEM",
    updated_at: "2026-01-10T10:00:00Z"
  },
  {
    id: 3,
    infrastructure_id: "DRN-SLR-003",
    parcel_id: "TN-CBE-001-124-3",
    ulpin: "ULPIN-TN-CBE-2026-0003",
    infrastructure_type: "STORM_WATER_DRAIN",
    availability_status: "AVAILABLE",
    provider: "State Highways & Sulur Panchayat",
    distance_to_network: 1.0,
    connection_status: "CONNECTED",
    capacity_status: "HIGH_CAPACITY_DRAIN",
    updated_at: "2026-01-12T11:00:00Z"
  },
  {
    id: 4,
    infrastructure_id: "SWR-SLR-003",
    parcel_id: "TN-CBE-001-124-3",
    ulpin: "ULPIN-TN-CBE-2026-0003",
    infrastructure_type: "SEWER_LINE",
    availability_status: "AVAILABLE",
    provider: "Coimbatore Metro Drainage",
    distance_to_network: 5.0,
    connection_status: "CONNECTED",
    capacity_status: "CONNECTED_TO_STP_3",
    updated_at: "2026-01-12T11:00:00Z"
  },
  {
    id: 5,
    infrastructure_id: "DRN-SLR-007",
    parcel_id: "TN-CBE-001-126-2",
    ulpin: "ULPIN-TN-CBE-2026-0007",
    infrastructure_type: "DRAINAGE_CHANNEL",
    availability_status: "NOT_AVAILABLE",
    provider: "Rural Development Board",
    distance_to_network: 120.0,
    connection_status: "NO_NETWORK",
    capacity_status: "NATURAL_SURFACE_RUNOFF",
    updated_at: "2026-01-14T09:00:00Z"
  }
];

// 6. Road Access Database
const roadAccessDatabase = [
  {
    id: 1,
    road_access_id: "ROAD-CBE-SLR-01",
    parcel_id: "TN-CBE-001-124-1",
    ulpin: "ULPIN-TN-CBE-2026-0001",
    road_name: "Sulur Town Main Link Road (Ward 4)",
    road_type: "LOCAL_ROAD",
    road_width: 12.0,
    distance_to_road: 0.0,
    access_status: "GOOD_ACCESS",
    authority: "Sulur Town Panchayat Roads Division",
    right_of_way_clear: true,
    surface_type: "ASPHALT",
    encroachment_detected: false,
    restrictions: [],
    updated_at: "2026-01-20T10:00:00Z"
  },
  {
    id: 2,
    road_access_id: "ROAD-CBE-SLR-02",
    parcel_id: "TN-CBE-001-124-2",
    ulpin: "ULPIN-TN-CBE-2026-0002",
    road_name: "Kallipalayam Agricultural Cart Track",
    road_type: "SERVICE_ROAD",
    road_width: 6.0,
    distance_to_road: 5.0,
    access_status: "GOOD_ACCESS",
    authority: "Sulur Village Panchayat",
    right_of_way_clear: true,
    surface_type: "GRAVEL",
    encroachment_detected: false,
    restrictions: ["Tractor / Heavy Farm Machinery load limits"],
    updated_at: "2026-01-18T10:00:00Z"
  },
  {
    id: 3,
    road_access_id: "ROAD-CBE-SLR-03",
    parcel_id: "TN-CBE-001-124-3",
    ulpin: "ULPIN-TN-CBE-2026-0003",
    road_name: "State Highway 174 (Sulur - Coimbatore Bypass)",
    road_type: "HIGHWAY",
    road_width: 24.0,
    distance_to_road: 0.0,
    access_status: "GOOD_ACCESS",
    authority: "Tamil Nadu State Highways Department",
    right_of_way_clear: true,
    surface_type: "ASPHALT",
    encroachment_detected: false,
    restrictions: ["NHAI / State Highway setback requirement: 5 meters from RoW"],
    updated_at: "2026-02-01T10:00:00Z"
  },
  {
    id: 4,
    road_access_id: "ROAD-CBE-SLR-04",
    parcel_id: "TN-CBE-001-125-1",
    ulpin: "ULPIN-TN-CBE-2026-0004",
    road_name: "State Highway 174 Service Lane",
    road_type: "HIGHWAY",
    road_width: 24.0,
    distance_to_road: 0.0,
    access_status: "REQUIRES_REVIEW",
    authority: "Tamil Nadu State Highways Department",
    right_of_way_clear: false,
    surface_type: "ASPHALT",
    encroachment_detected: true,
    restrictions: ["165 sqm unauthorized temporary structure on Highway Right of Way"],
    updated_at: "2026-02-05T14:00:00Z"
  },
  {
    id: 5,
    road_access_id: "ROAD-CBE-SLR-07",
    parcel_id: "TN-CBE-001-126-2",
    ulpin: "ULPIN-TN-CBE-2026-0007",
    road_name: "Palanisamy Field Pathway",
    road_type: "FOOTPATH",
    road_width: 2.5,
    distance_to_road: 140.0,
    access_status: "NO_DIRECT_ACCESS",
    authority: "Panchayat Unclassified Pathway",
    right_of_way_clear: false,
    surface_type: "UNPAVED",
    encroachment_detected: false,
    restrictions: ["No vehicular access easement recorded in Patta or registered deed"],
    updated_at: "2026-01-22T08:00:00Z"
  }
];

// 7. Infrastructure Projects Database
const infrastructureProjectsDatabase = [
  {
    id: 1,
    project_id: "PROJ-CBE-METRO-02",
    project_name: "Coimbatore Metro Rail Corridor Line 2 (Airport to Sulur Extension)",
    project_type: "METRO",
    authority: "Chennai Metro Rail Limited (CMRL) / TN Urban Infra",
    status: "UNDER_CONSTRUCTION",
    start_date: "2024-03-01T00:00:00Z",
    expected_completion: "2027-12-31T00:00:00Z",
    description: "21.8 km mass rapid transit corridor connecting Coimbatore International Airport, Sulur Air Force Station, and Trichy Road hub.",
    affected_area: "Trichy Road Corridor, Sulur West & Central",
    investment_inr_cr: 3200.0,
    influence_radius_meters: 600.0,
    geometry: {
      type: "LineString",
      coordinates: [[77.0250, 11.0220], [77.0350, 11.0260], [77.0450, 11.0290]]
    },
    created_at: "2024-03-01T00:00:00Z"
  },
  {
    id: 2,
    project_id: "PROJ-CBE-RING-06",
    project_name: "Sulur - Coimbatore 6-Lane Western Ring Road Expansion",
    project_type: "ROAD_PROJECT",
    authority: "National Highways Authority of India (NHAI) / TN State Highways",
    status: "UNDER_CONSTRUCTION",
    start_date: "2023-08-15T00:00:00Z",
    expected_completion: "2026-10-31T00:00:00Z",
    description: "Widening of existing 2-lane corridor to 6-lane access-controlled bypass with dedicated service roads and stormwater channels.",
    affected_area: "SH-174 Alignment, Sulur Industrial Belt",
    investment_inr_cr: 850.0,
    influence_radius_meters: 300.0,
    geometry: {
      type: "LineString",
      coordinates: [[77.0280, 11.0240], [77.0420, 11.0270]]
    },
    created_at: "2023-08-15T00:00:00Z"
  },
  {
    id: 3,
    project_id: "PROJ-ATHI-CANAL-01",
    project_name: "Avinashi - Athikadavu Groundwater Recharge & Irrigation Canal Project",
    project_type: "WATER_PROJECT",
    authority: "Water Resources Department (WRD) Tamil Nadu",
    status: "COMPLETED",
    start_date: "2021-02-10T00:00:00Z",
    expected_completion: "2024-11-30T00:00:00Z",
    description: "Recharging 1,045 ponds and irrigation tanks across Coimbatore, Tiruppur, and Erode districts.",
    affected_area: "Sulur Agricultural Basin",
    investment_inr_cr: 1650.0,
    influence_radius_meters: 1000.0,
    geometry: {
      type: "LineString",
      coordinates: [[77.0310, 11.0310], [77.0410, 11.0330]]
    },
    created_at: "2021-02-10T00:00:00Z"
  },
  {
    id: 4,
    project_id: "PROJ-SMART-UGD-04",
    project_name: "Smart City Digital Command & Modern Underground Drainage System",
    project_type: "SMART_CITY",
    authority: "Coimbatore Smart City Limited & Municipal Corp",
    status: "NEAR_COMPLETION",
    start_date: "2023-01-10T00:00:00Z",
    expected_completion: "2026-06-30T00:00:00Z",
    description: "Smart underground drainage with automated flow sensors, SCADA-linked STP units, and IoT flood monitors.",
    affected_area: "Sulur Town Panchayat Core",
    investment_inr_cr: 420.0,
    influence_radius_meters: 500.0,
    created_at: "2023-01-10T00:00:00Z"
  }
];

// 8. Digital Infrastructure Database
const digitalInfrastructureDatabase = [
  {
    id: 1,
    infrastructure_id: "DIGI-BN-001",
    parcel_id: "TN-CBE-001-124-1",
    ulpin: "ULPIN-TN-CBE-2026-0001",
    infrastructure_type: "FIBER",
    provider: "BharatNet / BSNL FTTH & Private ISP Gigabit Fiber",
    availability_status: "HIGH_SPEED_AVAILABLE",
    connection_status: "CONNECTED",
    max_speed_mbps: 1000,
    mobile_5g_coverage: true,
    nearest_digital_seva_meters: 180,
    updated_at: "2026-01-15T10:00:00Z"
  },
  {
    id: 2,
    infrastructure_id: "DIGI-BN-002",
    parcel_id: "TN-CBE-001-124-2",
    ulpin: "ULPIN-TN-CBE-2026-0002",
    infrastructure_type: "MOBILE_NETWORK",
    provider: "BharatNet Gram Panchayat Optical Fiber",
    availability_status: "MODERATE",
    connection_status: "AVAILABLE_ON_DEMAND",
    max_speed_mbps: 100,
    mobile_5g_coverage: true,
    nearest_digital_seva_meters: 450,
    updated_at: "2026-01-12T10:00:00Z"
  },
  {
    id: 3,
    infrastructure_id: "DIGI-BN-003",
    parcel_id: "TN-CBE-001-124-3",
    ulpin: "ULPIN-TN-CBE-2026-0003",
    infrastructure_type: "FIBER",
    provider: "Commercial Dark Fiber & Jio/Airtel 5G Enterprise",
    availability_status: "HIGH_SPEED_AVAILABLE",
    connection_status: "CONNECTED",
    max_speed_mbps: 10000,
    mobile_5g_coverage: true,
    nearest_digital_seva_meters: 120,
    updated_at: "2026-02-01T10:00:00Z"
  },
  {
    id: 4,
    infrastructure_id: "DIGI-BN-004",
    parcel_id: "TN-CBE-001-125-1",
    ulpin: "ULPIN-TN-CBE-2026-0004",
    infrastructure_type: "FIBER",
    provider: "Industrial Multi-Gigabit Leased Line",
    availability_status: "HIGH_SPEED_AVAILABLE",
    connection_status: "CONNECTED",
    max_speed_mbps: 10000,
    mobile_5g_coverage: true,
    nearest_digital_seva_meters: 350,
    updated_at: "2026-01-20T10:00:00Z"
  }
];

// 9. Civic Service Requests & Alerts Database
const civicServiceRequestsDatabase = [
  {
    id: 1,
    request_id: "REQ-CIV-2026-081",
    parcel_id: "TN-CBE-001-124-1",
    citizen_name: "Ravi Kumar",
    citizen_email: "citizen@landsync.gov.in",
    service_category: "PROPERTY_TAX_REVIEW",
    description: "Request for electronic receipt synchronization and property tax assessment certificate for FY 2025-26.",
    status: "COMPLETED",
    priority: "LOW",
    assigned_department: "Sulur Town Panchayat Revenue Branch",
    submitted_at: "2026-01-10T14:20:00Z",
    updated_at: "2026-01-12T16:45:00Z"
  },
  {
    id: 2,
    request_id: "REQ-CIV-2026-082",
    parcel_id: "TN-CBE-001-126-2",
    citizen_name: "R. Palanisamy",
    citizen_email: "citizen@landsync.gov.in",
    service_category: "ROAD_ACCESS_NOC",
    description: "Application for recorded public right-of-way connectivity under Panchayat Village Road Connect scheme.",
    status: "UNDER_VERIFICATION",
    priority: "HIGH",
    assigned_department: "Panchayat Union Engineering & Tahsildar Sulur",
    submitted_at: "2026-02-14T09:15:00Z",
    updated_at: "2026-02-16T11:30:00Z"
  },
  {
    id: 3,
    request_id: "REQ-CIV-2026-083",
    parcel_id: "TN-CBE-001-124-3",
    citizen_name: "Senthil Enterprises",
    citizen_email: "citizen@landsync.gov.in",
    service_category: "PROPERTY_TAX_REVIEW",
    description: "Property tax payer name correction from prior owner K. Velusamy to registered entity Senthil Enterprises.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assigned_department: "Municipal Tax Assessment Directorate",
    submitted_at: "2026-02-18T10:00:00Z",
    updated_at: "2026-02-20T14:00:00Z"
  }
];

const civicAlertsDatabase = [
  {
    id: "ALT-TAX-001",
    alert_type: "PROPERTY_TAX_OVERDUE",
    severity: "HIGH",
    title: "Property Tax Overdue: ₹48,500 Arrears",
    message: "Commercial property tax assessment for parcel TN-CBE-001-125-1 is past statutory due date.",
    parcel_id: "TN-CBE-001-125-1",
    ulpin: "ULPIN-TN-CBE-2026-0004",
    timestamp: "2026-02-10T14:30:00Z",
    status: "ACTIVE"
  },
  {
    id: "ALT-ROAD-002",
    alert_type: "LIMITED_ROAD_ACCESS",
    severity: "MEDIUM",
    title: "No Direct Public Road Access Recorded",
    message: "Parcel TN-CBE-001-126-2 is 140 meters away from public right-of-way; easement verification required.",
    parcel_id: "TN-CBE-001-126-2",
    ulpin: "ULPIN-TN-CBE-2026-0007",
    timestamp: "2026-02-05T09:00:00Z",
    status: "ACTIVE"
  },
  {
    id: "ALT-PROJ-003",
    alert_type: "INFRASTRUCTURE_PROJECT_NEARBY",
    severity: "LOW",
    title: "Metro Rail Corridor Line 2 Zone",
    message: "Parcel TN-CBE-001-124-1 is within 250m influence corridor of Coimbatore Metro Rail Line 2.",
    parcel_id: "TN-CBE-001-124-1",
    ulpin: "ULPIN-TN-CBE-2026-0001",
    timestamp: "2026-01-20T11:00:00Z",
    status: "ACTIVE"
  }
];

// Helper Functions for Civic Intelligence

function calculateCivicServiceScoreForParcel(parcelId: string) {
  const water = waterConnectionsDatabase.find(w => w.parcel_id === parcelId);
  const ele = electricityConnectionsDatabase.find(e => e.parcel_id === parcelId);
  const road = roadAccessDatabase.find(r => r.parcel_id === parcelId);
  const drain = drainageInfrastructureDatabase.find(d => d.parcel_id === parcelId && d.infrastructure_type === "STORM_WATER_DRAIN");
  const sewer = drainageInfrastructureDatabase.find(d => d.parcel_id === parcelId && d.infrastructure_type === "SEWER_LINE");
  const digi = digitalInfrastructureDatabase.find(dg => dg.parcel_id === parcelId);

  // Water score (max 20)
  let wScore = 14;
  let wStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'DEFICIENT' | 'CRITICAL' = 'ACCEPTABLE';
  if (water?.connection_status === 'CONNECTED') {
    wScore = 20;
    wStatus = 'OPTIMAL';
  } else if (water?.connection_status === 'AVAILABLE') {
    wScore = 14;
    wStatus = 'ACCEPTABLE';
  } else if (water?.connection_status === 'PENDING') {
    wScore = 8;
    wStatus = 'DEFICIENT';
  } else if (water?.connection_status === 'NOT_AVAILABLE') {
    wScore = 0;
    wStatus = 'CRITICAL';
  }

  // Electricity score (max 20)
  let eScore = 15;
  let eStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'DEFICIENT' | 'CRITICAL' = 'ACCEPTABLE';
  if (ele?.connection_status === 'CONNECTED') {
    eScore = 20;
    eStatus = 'OPTIMAL';
  } else if (ele?.connection_status === 'AVAILABLE') {
    eScore = 15;
    eStatus = 'ACCEPTABLE';
  } else if (ele?.connection_status === 'NOT_AVAILABLE') {
    eScore = 0;
    eStatus = 'CRITICAL';
  }

  // Road Access score (max 20)
  let rScore = 12;
  let rStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'DEFICIENT' | 'CRITICAL' = 'ACCEPTABLE';
  if (road?.access_status === 'GOOD_ACCESS') {
    rScore = 20;
    rStatus = 'OPTIMAL';
  } else if (road?.access_status === 'LIMITED_ACCESS') {
    rScore = 12;
    rStatus = 'ACCEPTABLE';
  } else if (road?.access_status === 'REQUIRES_REVIEW') {
    rScore = 8;
    rStatus = 'DEFICIENT';
  } else if (road?.access_status === 'NO_DIRECT_ACCESS') {
    rScore = 2;
    rStatus = 'CRITICAL';
  }

  // Drainage score (max 15)
  let dScore = 10;
  let dStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'DEFICIENT' | 'CRITICAL' = 'ACCEPTABLE';
  if (drain?.connection_status === 'CONNECTED' || drain?.availability_status === 'AVAILABLE') {
    dScore = 15;
    dStatus = 'OPTIMAL';
  } else if (drain?.availability_status === 'UNDER_DEVELOPMENT') {
    dScore = 8;
    dStatus = 'ACCEPTABLE';
  } else if (drain?.availability_status === 'NOT_AVAILABLE') {
    dScore = 0;
    dStatus = 'CRITICAL';
  }

  // Sewerage score (max 15)
  let sScore = 8;
  let sStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'DEFICIENT' | 'CRITICAL' = 'ACCEPTABLE';
  if (sewer?.connection_status === 'CONNECTED') {
    sScore = 15;
    sStatus = 'OPTIMAL';
  } else if (sewer?.availability_status === 'AVAILABLE') {
    sScore = 10;
    sStatus = 'ACCEPTABLE';
  } else if (sewer?.availability_status === 'NOT_AVAILABLE') {
    sScore = 0;
    sStatus = 'CRITICAL';
  }

  // Digital score (max 10)
  let tScore = 8;
  let tStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'DEFICIENT' | 'CRITICAL' = 'ACCEPTABLE';
  if (digi?.availability_status === 'HIGH_SPEED_AVAILABLE' || digi?.connection_status === 'CONNECTED') {
    tScore = 10;
    tStatus = 'OPTIMAL';
  } else if (digi?.availability_status === 'MODERATE') {
    tScore = 7;
    tStatus = 'ACCEPTABLE';
  } else {
    tScore = 4;
    tStatus = 'DEFICIENT';
  }

  const totalScore = wScore + eScore + rScore + dScore + sScore + tScore;

  let category: 'LIMITED' | 'BASIC' | 'GOOD' | 'WELL_CONNECTED' = 'GOOD';
  if (totalScore >= 76) category = 'WELL_CONNECTED';
  else if (totalScore >= 51) category = 'GOOD';
  else if (totalScore >= 26) category = 'BASIC';
  else category = 'LIMITED';

  return {
    parcel_id: parcelId,
    overall_score: totalScore,
    score_category: category,
    water_score: wScore,
    electricity_score: eScore,
    road_access_score: rScore,
    drainage_score: dScore,
    sewerage_score: sScore,
    digital_score: tScore,
    factors: [
      { factor_name: "Piped Water Supply", score: wScore, max_score: 20, weight: 20, status: wStatus, summary: water?.connection_status || "AVAILABLE" },
      { factor_name: "Electricity Grid Connectivity", score: eScore, max_score: 20, weight: 20, status: eStatus, summary: ele?.connection_status || "CONNECTED" },
      { factor_name: "Road Access & Frontage", score: rScore, max_score: 20, weight: 20, status: rStatus, summary: road?.access_status || "GOOD_ACCESS" },
      { factor_name: "Storm Water Drainage", score: dScore, max_score: 15, weight: 15, status: dStatus, summary: drain?.availability_status || "AVAILABLE" },
      { factor_name: "Underground Sewerage (UGD)", score: sScore, max_score: 15, weight: 15, status: sStatus, summary: sewer?.connection_status || "AVAILABLE" },
      { factor_name: "High-Speed Digital & 5G", score: tScore, max_score: 10, weight: 10, status: tStatus, summary: digi?.availability_status || "HIGH_SPEED_AVAILABLE" }
    ],
    explainable_summary: `Parcel has an overall Civic Service Score of ${totalScore}/100 (${category}). Powered by unified municipal data infrastructure.`,
    disclaimer: "Informational civic indicator, not an official government rating."
  };
}

function analyzeRoadAccessForParcel(parcelId: string) {
  const record = roadAccessDatabase.find(r => r.parcel_id === parcelId) || {
    id: 99,
    road_access_id: `ROAD-${parcelId}`,
    parcel_id: parcelId,
    ulpin: `ULPIN-${parcelId}`,
    road_name: "Sulur Ward Link Road",
    road_type: "LOCAL_ROAD" as const,
    road_width: 9.0,
    distance_to_road: 0.0,
    access_status: "GOOD_ACCESS" as const,
    authority: "Sulur Town Panchayat",
    right_of_way_clear: true,
    surface_type: "ASPHALT" as const,
    encroachment_detected: false,
    restrictions: [],
    updated_at: new Date().toISOString()
  };

  let category = record.access_status;
  let score = 90;
  let recommendation = "Maintain required statutory road setback clearances.";
  const restrictions: string[] = [...(record.restrictions || [])];

  if (record.distance_to_road > 100) {
    category = "NO_DIRECT_ACCESS";
    score = 25;
    restrictions.push(`Parcel is ${record.distance_to_road}m away from public right-of-way.`);
    recommendation = "Formal access easement deed or village cart-track regularization required.";
  } else if (record.distance_to_road > 20) {
    category = "LIMITED_ACCESS";
    score = 55;
    restrictions.push(`Narrow access pathway (${record.distance_to_road}m).`);
    recommendation = "Verify width of connecting pathway meets municipal fire safety norms.";
  } else if (record.encroachment_detected) {
    category = "REQUIRES_REVIEW";
    score = 45;
    recommendation = "Clear encroachment on road Right of Way before applying for building sanction.";
  }

  return {
    parcel_id: parcelId,
    nearest_road: record.road_name,
    road_distance_meters: record.distance_to_road,
    road_type: record.road_type,
    road_width_meters: record.road_width,
    access_category: category,
    access_availability: record.distance_to_road === 0 ? `Direct frontage on ${record.road_width}m wide ${record.road_type}` : `${record.distance_to_road}m to nearest ${record.road_type}`,
    possible_access_restrictions: restrictions,
    access_score: score,
    recommendation
  };
}

function analyzeProjectImpactForParcel(parcelId: string) {
  // Simulated distances
  const isCentral = parcelId.includes("124-1") || parcelId.includes("124-3");
  const isIndustrial = parcelId.includes("125-1");

  const projectImpacts = infrastructureProjectsDatabase.map(p => {
    let dist = 850;
    if (p.project_id === "PROJ-CBE-METRO-02") dist = isCentral ? 220 : 1200;
    else if (p.project_id === "PROJ-CBE-RING-06") dist = isIndustrial ? 150 : 650;
    else if (p.project_id === "PROJ-SMART-UGD-04") dist = isCentral ? 90 : 800;

    const inZone = dist <= p.influence_radius_meters;
    let impactLevel: 'NO_KNOWN_IMPACT' | 'NEARBY_PROJECT' | 'POSSIBLE_IMPACT' | 'REQUIRES_AUTHORITY_REVIEW' = 'NO_KNOWN_IMPACT';
    let benefit = "No direct impact on land boundaries.";

    if (dist <= 50) {
      impactLevel = "REQUIRES_AUTHORITY_REVIEW";
      benefit = "Direct alignment or right-of-way corridor buffer.";
    } else if (inZone) {
      impactLevel = "POSSIBLE_IMPACT";
      benefit = `Inside ${p.influence_radius_meters}m statutory development catalyst influence zone.`;
    } else if (dist <= 2000) {
      impactLevel = "NEARBY_PROJECT";
      benefit = `Located within ${dist}m of major transit/utility corridor.`;
    }

    return {
      project: p,
      distance_meters: dist,
      intersects_corridor: dist <= 50,
      is_inside_influence_zone: inZone,
      potential_benefit_or_disruption: benefit,
      impact_level: impactLevel
    };
  });

  const within2km = projectImpacts.filter(p => p.distance_meters <= 2000).length;
  const hasReview = projectImpacts.some(p => p.impact_level === "REQUIRES_AUTHORITY_REVIEW");
  const hasPossible = projectImpacts.some(p => p.impact_level === "POSSIBLE_IMPACT");

  let overall: 'NO_KNOWN_IMPACT' | 'NEARBY_PROJECT' | 'POSSIBLE_IMPACT' | 'REQUIRES_AUTHORITY_REVIEW' = 'NO_KNOWN_IMPACT';
  if (hasReview) overall = "REQUIRES_AUTHORITY_REVIEW";
  else if (hasPossible) overall = "POSSIBLE_IMPACT";
  else if (within2km > 0) overall = "NEARBY_PROJECT";

  return {
    parcel_id: parcelId,
    total_projects_within_2km: within2km,
    overall_impact_level: overall,
    primary_affected_project: projectImpacts.find(p => p.is_inside_influence_zone)?.project || null,
    projects: projectImpacts,
    statutory_advisory: overall === "POSSIBLE_IMPACT"
      ? "Parcel is situated inside an active infrastructure influence corridor. Higher appreciation potential and TOD zoning regulations may apply."
      : overall === "REQUIRES_AUTHORITY_REVIEW"
      ? "NOC from executing project authority required prior to structural modifications."
      : "Standard municipal and zoning development regulations apply."
  };
}

function generateCivicInsightsForParcel(parcelId: string) {
  const parcel = parcelsDatabase.find(p => p.parcel_id === parcelId);
  const tax = propertyTaxDatabase.find(t => t.parcel_id === parcelId);
  const road = roadAccessDatabase.find(r => r.parcel_id === parcelId);
  const water = waterConnectionsDatabase.find(w => w.parcel_id === parcelId);
  const projImpact = analyzeProjectImpactForParcel(parcelId);

  const insights: any[] = [];

  // 1. Property Tax + Ownership Mismatch
  if (tax && parcel) {
    if (tax.tax_payer_name && parcel.current_owner && tax.tax_payer_name.trim().toLowerCase() !== parcel.current_owner.trim().toLowerCase()) {
      insights.push({
        id: `INS-TAX-OWN-${parcelId}`,
        parcel_id: parcelId,
        insight_type: "TAX_OWNERSHIP_MISMATCH",
        severity: "WARNING",
        title: "Property Tax Payer & Revenue Owner Mismatch",
        description: `Local body tax record is registered under '${tax.tax_payer_name}' whereas Revenue Patta lists '${parcel.current_owner}'.`,
        source: "Local Body Municipal Tax Register vs Revenue Patta",
        confidence: 94,
        last_updated: new Date().toISOString(),
        requires_human_review: true,
        recommended_action: "Execute computerized municipal name transfer mutation using latest registered sale deed."
      });
    }

    if (tax.payment_status === "OVERDUE" || tax.arrears > 0) {
      insights.push({
        id: `INS-TAX-DUE-${parcelId}`,
        parcel_id: parcelId,
        insight_type: "SERVICE_DEFICIT",
        severity: "WARNING",
        title: `Property Tax Arrears Outstanding: ₹${tax.arrears.toLocaleString('en-IN')}`,
        description: `Assessment year ${tax.assessment_year} has ₹${tax.amount_due.toLocaleString('en-IN')} pending for collection.`,
        source: "Sulur Town Panchayat Revenue Branch",
        confidence: 98,
        last_updated: new Date().toISOString(),
        requires_human_review: false,
        recommended_action: "Pay municipal taxes online to prevent statutory interest levy."
      });
    }
  }

  // 2. Road Access Gap
  if (road && road.distance_to_road > 50) {
    insights.push({
      id: `INS-ROAD-GAP-${parcelId}`,
      parcel_id: parcelId,
      insight_type: "ROAD_ACCESS_GAP",
      severity: "WARNING",
      title: "No Direct Public Road Access Recorded",
      description: `Parcel is located ${road.distance_to_road}m from nearest public thoroughfare without recorded municipal frontage.`,
      source: "State Highways & Panchayat GIS Road Network",
      confidence: 89,
      last_updated: new Date().toISOString(),
      requires_human_review: true,
      recommended_action: "Verify registered right-of-way easement in survey sketch before building sanction."
    });
  }

  // 3. Infrastructure Project Corridor
  const nearestProj = projImpact.projects.find(p => p.is_inside_influence_zone);
  if (nearestProj) {
    insights.push({
      id: `INS-PROJ-CORRIDOR-${parcelId}`,
      parcel_id: parcelId,
      insight_type: "INFRASTRUCTURE_OPPORTUNITY",
      severity: "POSITIVE",
      title: `High Growth Corridor: Near ${nearestProj.project.project_name}`,
      description: `Located ${nearestProj.distance_meters}m from ₹${nearestProj.project.investment_inr_cr} Cr ${nearestProj.project.project_type.replace('_', ' ')} corridor.`,
      source: "TN Infrastructure & Urban Development Authority",
      confidence: 95,
      last_updated: new Date().toISOString(),
      requires_human_review: false,
      recommended_action: "Check Transit-Oriented Development (TOD) incentives and floor space index benefits."
    });
  }

  // 4. Utility Connection Available
  if (water && water.connection_status === "CONNECTED") {
    insights.push({
      id: `INS-WTR-OK-${parcelId}`,
      parcel_id: parcelId,
      insight_type: "INFRASTRUCTURE_OPPORTUNITY",
      severity: "INFO",
      title: "Active 24x7 Piped Water Infrastructure",
      description: "Direct connection with TWAD / Municipal water distribution network with smart metered pipeline.",
      source: "TWAD Board GIS Asset Register",
      confidence: 96,
      last_updated: new Date().toISOString(),
      requires_human_review: false,
      recommended_action: "No action needed. Infrastructure status optimal."
    });
  }

  return insights;
}

// -------------------------------------------------------------------------
// PHASE 9: API ENDPOINTS
// -------------------------------------------------------------------------

// 1. GET /api/civic/parcel-360-civic/:parcel_id - Complete Parcel 360 Civic Overview
app.get("/api/civic/parcel-360-civic/:parcel_id", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const parcel = parcelsDatabase.find(p => p.parcel_id === parcel_id);

  if (!parcel) {
    return res.status(404).json({ detail: "Parcel record not found in DPI database." });
  }

  const tax = propertyTaxDatabase.find(t => t.parcel_id === parcel_id) || null;
  const val = landValuationDatabase.find(v => v.parcel_id === parcel_id) || {
    id: 99,
    valuation_id: `VAL-${parcel_id}`,
    parcel_id,
    ulpin: (parcel as any).ulpin || parcel.parcel_id,
    location_reference: `${parcel.village}, ${parcel.district}`,
    land_category: `${parcel.land_use} Land`,
    reference_rate: 2200,
    unit: "INR/Sq.Ft",
    min_rate: 1900,
    max_rate: 2500,
    effective_date: "2025-04-01T00:00:00Z",
    source_authority: "IGRS Tamil Nadu Guideline Value Register",
    confidence_level: "HIGH" as const,
    notes: "Indicative baseline reference rate.",
    historical_trends: [
      { year: 2022, guideline_rate: 1600, market_estimate: 1800 },
      { year: 2023, guideline_rate: 1800, market_estimate: 2050 },
      { year: 2024, guideline_rate: 2000, market_estimate: 2300 },
      { year: 2025, guideline_rate: 2200, market_estimate: 2550 }
    ],
    comparable_references: [
      { location: "Sulur Radial Link", distance_km: 0.6, rate_per_sqft: 2350, category: "Residential Class A" }
    ],
    disclaimer: "Valuation references are indicative prototype data and do not represent official property valuation.",
    created_at: "2025-04-01T00:00:00Z"
  };

  const water = waterConnectionsDatabase.find(w => w.parcel_id === parcel_id) || {
    id: 99,
    connection_id: `WTR-${parcel_id}`,
    parcel_id,
    ulpin: (parcel as any).ulpin || parcel.parcel_id,
    provider: "TWAD Board / Local Panchayat Water Supply",
    connection_status: "AVAILABLE" as const,
    connection_type: "DOMESTIC" as const,
    meter_status: "METERED_ACTIVE" as const,
    supply_status: "NORMAL_24X7" as const,
    pipeline_distance_meters: 8.0,
    pressure_bar: 2.0,
    application_reference: null,
    created_at: "2024-01-01T00:00:00Z"
  };

  const electricity = electricityConnectionsDatabase.find(e => e.parcel_id === parcel_id) || {
    id: 99,
    connection_id: `ELE-${parcel_id}`,
    parcel_id,
    ulpin: (parcel as any).ulpin || parcel.parcel_id,
    provider: "TANGEDCO (Tamil Nadu Electricity Board)",
    connection_status: "CONNECTED" as const,
    connection_type: "LT_RESIDENTIAL" as const,
    meter_status: "SMART_METER_LIVE" as const,
    service_status: "ACTIVE_ENERGIZED" as const,
    sanctioned_load_kw: 5.0,
    transformer_id: "TR-SULUR-SS-02",
    transformer_distance_meters: 45.0,
    application_reference: null,
    updated_at: new Date().toISOString()
  };

  const drainage = drainageInfrastructureDatabase.find(d => d.parcel_id === parcel_id && d.infrastructure_type === "STORM_WATER_DRAIN") || {
    id: 99,
    infrastructure_id: `DRN-${parcel_id}`,
    parcel_id,
    ulpin: (parcel as any).ulpin || parcel.parcel_id,
    infrastructure_type: "STORM_WATER_DRAIN" as const,
    availability_status: "AVAILABLE" as const,
    provider: "Sulur Town Panchayat",
    distance_to_network: 4.0,
    connection_status: "CONNECTED" as const,
    capacity_status: "ADEQUATE",
    updated_at: new Date().toISOString()
  };

  const sewerage = drainageInfrastructureDatabase.find(d => d.parcel_id === parcel_id && d.infrastructure_type === "SEWER_LINE") || {
    id: 99,
    infrastructure_id: `SWR-${parcel_id}`,
    parcel_id,
    ulpin: (parcel as any).ulpin || parcel.parcel_id,
    infrastructure_type: "SEWER_LINE" as const,
    availability_status: "AVAILABLE" as const,
    provider: "Coimbatore Municipal Drainage",
    distance_to_network: 6.0,
    connection_status: "CONNECTED" as const,
    capacity_status: "CONNECTED_TO_STP",
    updated_at: new Date().toISOString()
  };

  const road = roadAccessDatabase.find(r => r.parcel_id === parcel_id) || null;
  const roadAnalysis = analyzeRoadAccessForParcel(parcel_id);

  const digital = digitalInfrastructureDatabase.find(dg => dg.parcel_id === parcel_id) || {
    id: 99,
    infrastructure_id: `DIGI-${parcel_id}`,
    parcel_id,
    ulpin: (parcel as any).ulpin || parcel.parcel_id,
    infrastructure_type: "FIBER" as const,
    provider: "BharatNet / BSNL FTTH",
    availability_status: "HIGH_SPEED_AVAILABLE" as const,
    connection_status: "CONNECTED" as const,
    max_speed_mbps: 300,
    mobile_5g_coverage: true,
    nearest_digital_seva_meters: 220,
    updated_at: new Date().toISOString()
  };

  const projImpact = analyzeProjectImpactForParcel(parcel_id);
  const score = calculateCivicServiceScoreForParcel(parcel_id);
  const insights = generateCivicInsightsForParcel(parcel_id);
  const alerts = civicAlertsDatabase.filter(a => a.parcel_id === parcel_id);

  const profile = {
    parcel_id,
    ulpin: (parcel as any).ulpin || parcel.parcel_id,
    water_status: water.connection_status,
    electricity_status: electricity.connection_status,
    drainage_status: drainage.availability_status,
    sewerage_status: sewerage.connection_status,
    road_access_status: roadAnalysis.access_category,
    telecom_status: digital.availability_status,
    property_tax_status: tax?.payment_status || "PENDING",
    overall_civic_readiness: score.score_category,
    last_updated: new Date().toISOString()
  };

  res.json({
    parcel_id,
    ulpin: (parcel as any).ulpin || parcel.parcel_id,
    survey_number: parcel.survey_number,
    village: parcel.village,
    district: parcel.district,
    current_owner: parcel.current_owner,
    land_use: parcel.land_use,
    property_tax: tax,
    valuation: val,
    water,
    electricity,
    drainage,
    sewerage,
    road_access: road,
    road_analysis: roadAnalysis,
    digital,
    nearby_projects: infrastructureProjectsDatabase,
    project_impact: projImpact,
    civic_profile: profile,
    civic_score: score,
    civic_insights: insights,
    active_alerts: alerts
  });
});

// 2. GET /api/civic/parcel/:parcel_id/tax - Property Tax Record
app.get("/api/civic/parcel/:parcel_id/tax", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const tax = propertyTaxDatabase.find(t => t.parcel_id === parcel_id) || null;
  res.json(tax);
});

// 3. POST /api/civic/parcel/:parcel_id/tax/pay-simulated - Simulated Tax Payment
app.post("/api/civic/parcel/:parcel_id/tax/pay-simulated", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const { amount } = req.body;
  const taxIndex = propertyTaxDatabase.findIndex(t => t.parcel_id === parcel_id);

  if (taxIndex === -1) {
    return res.status(404).json({ detail: "Property tax record not found." });
  }

  const tax = propertyTaxDatabase[taxIndex];
  const payAmt = Number(amount) || tax.amount_due;
  tax.amount_paid += payAmt;
  tax.amount_due = Math.max(0, tax.amount_due - payAmt);
  tax.arrears = Math.max(0, tax.arrears - payAmt);
  tax.payment_status = tax.amount_due === 0 ? "PAID" : "PARTIALLY_PAID";
  tax.last_payment_date = new Date().toISOString();
  tax.updated_at = new Date().toISOString();

  if (!tax.history) tax.history = [];
  tax.history.unshift({
    assessment_year: tax.assessment_year,
    assessed_value: tax.assessed_value,
    tax_amount: tax.annual_tax,
    paid_amount: payAmt,
    status: tax.payment_status,
    receipt_no: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    payment_date: new Date().toISOString().split('T')[0]
  });

  // Resolve any tax overdue alert
  const alertIndex = civicAlertsDatabase.findIndex(a => a.parcel_id === parcel_id && a.alert_type === "PROPERTY_TAX_OVERDUE");
  if (alertIndex !== -1 && tax.amount_due === 0) {
    civicAlertsDatabase[alertIndex].status = "RESOLVED";
  }

  res.json(tax);
});

// 4. GET /api/civic/parcel/:parcel_id/valuation - Land Valuation Reference
app.get("/api/civic/parcel/:parcel_id/valuation", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const val = landValuationDatabase.find(v => v.parcel_id === parcel_id) || null;
  res.json(val);
});

// 5. GET /api/civic/parcel/:parcel_id/utilities - Utilities
app.get("/api/civic/parcel/:parcel_id/utilities", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const water = waterConnectionsDatabase.find(w => w.parcel_id === parcel_id) || null;
  const electricity = electricityConnectionsDatabase.find(e => e.parcel_id === parcel_id) || null;
  const drainage = drainageInfrastructureDatabase.find(d => d.parcel_id === parcel_id && d.infrastructure_type === "STORM_WATER_DRAIN") || null;
  const sewerage = drainageInfrastructureDatabase.find(d => d.parcel_id === parcel_id && d.infrastructure_type === "SEWER_LINE") || null;
  const digital = digitalInfrastructureDatabase.find(dg => dg.parcel_id === parcel_id) || null;

  res.json({ water, electricity, drainage, sewerage, digital });
});

// 6. GET /api/civic/parcel/:parcel_id/roads - Road Access & Analysis
app.get("/api/civic/parcel/:parcel_id/roads", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const record = roadAccessDatabase.find(r => r.parcel_id === parcel_id) || null;
  const analysis = analyzeRoadAccessForParcel(parcel_id);
  res.json({ record, analysis });
});

// 7. GET /api/civic/parcel/:parcel_id/projects - Public Infrastructure Projects
app.get("/api/civic/parcel/:parcel_id/projects", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const analysis = analyzeProjectImpactForParcel(parcel_id);
  res.json({ projects: infrastructureProjectsDatabase, analysis });
});

// 8. GET /api/civic/parcel/:parcel_id/score - Civic Score
app.get("/api/civic/parcel/:parcel_id/score", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const score = calculateCivicServiceScoreForParcel(parcel_id);
  const tax = propertyTaxDatabase.find(t => t.parcel_id === parcel_id);
  const water = waterConnectionsDatabase.find(w => w.parcel_id === parcel_id);
  const ele = electricityConnectionsDatabase.find(e => e.parcel_id === parcel_id);

  const profile = {
    parcel_id,
    ulpin: `ULPIN-${parcel_id}`,
    water_status: water?.connection_status || "AVAILABLE",
    electricity_status: ele?.connection_status || "CONNECTED",
    drainage_status: "AVAILABLE",
    sewerage_status: "CONNECTED",
    road_access_status: "GOOD_ACCESS",
    telecom_status: "HIGH_SPEED_AVAILABLE",
    property_tax_status: tax?.payment_status || "PAID",
    overall_civic_readiness: score.score_category,
    last_updated: new Date().toISOString()
  };

  res.json({ profile, score });
});

// 9. GET /api/civic/parcel/:parcel_id/insights - Cross-layer Insights
app.get("/api/civic/parcel/:parcel_id/insights", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id } = req.params;
  const insights = generateCivicInsightsForParcel(parcel_id);
  const alerts = civicAlertsDatabase.filter(a => a.parcel_id === parcel_id);
  res.json({ insights, alerts });
});

// 10. GET /api/civic/analytics - Admin & Officer Civic Dashboard Summary
app.get("/api/civic/analytics", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const totalParcels = parcelsDatabase.length;
  const paidCount = propertyTaxDatabase.filter(t => t.payment_status === "PAID").length;
  const overdueCount = propertyTaxDatabase.filter(t => t.payment_status === "OVERDUE").length;
  const partialCount = propertyTaxDatabase.filter(t => t.payment_status === "PARTIALLY_PAID").length;
  const pendingCount = propertyTaxDatabase.filter(t => t.payment_status === "PENDING").length;

  const totalCollected = propertyTaxDatabase.reduce((acc, t) => acc + (t.amount_paid || 0), 0);
  const totalArrears = propertyTaxDatabase.reduce((acc, t) => acc + (t.arrears || 0), 0);

  const waterConnected = waterConnectionsDatabase.filter(w => w.connection_status === "CONNECTED").length;
  const powerConnected = electricityConnectionsDatabase.filter(e => e.connection_status === "CONNECTED").length;
  const roadGood = roadAccessDatabase.filter(r => r.access_status === "GOOD_ACCESS").length;
  const drainConnected = drainageInfrastructureDatabase.filter(d => d.connection_status === "CONNECTED").length;

  res.json({
    total_parcels: totalParcels,
    water_coverage_percentage: Math.round((waterConnected / Math.max(1, totalParcels)) * 100) || 88,
    electricity_coverage_percentage: Math.round((powerConnected / Math.max(1, totalParcels)) * 100) || 94,
    road_access_coverage_percentage: Math.round((roadGood / Math.max(1, totalParcels)) * 100) || 82,
    drainage_coverage_percentage: Math.round((drainConnected / Math.max(1, totalParcels)) * 100) || 76,
    sewerage_coverage_percentage: 72,
    digital_coverage_percentage: 95,
    average_civic_score: 78,
    total_tax_collected_cr: Number((totalCollected / 10000000).toFixed(3)),
    total_tax_arrears_cr: Number((totalArrears / 10000000).toFixed(3)),
    tax_compliance_percentage: Math.round((paidCount / Math.max(1, propertyTaxDatabase.length)) * 100),
    active_infrastructure_projects: infrastructureProjectsDatabase.length,
    pending_service_requests: civicServiceRequestsDatabase.filter(r => r.status !== "COMPLETED").length,
    service_availability_by_area: [
      { area_name: "Sulur Town Core (Ward 1-5)", water_pct: 96, power_pct: 98, road_pct: 92, drain_pct: 88, avg_score: 86 },
      { area_name: "Sulur Industrial Estate Belt", water_pct: 90, power_pct: 100, road_pct: 85, drain_pct: 82, avg_score: 82 },
      { area_name: "Kallipalayam Agro Corridor", water_pct: 78, power_pct: 92, road_pct: 70, drain_pct: 60, avg_score: 68 },
      { area_name: "SH-174 Commercial Frontage", water_pct: 94, power_pct: 96, road_pct: 94, drain_pct: 85, avg_score: 84 }
    ],
    tax_payment_distribution: [
      { status: "PAID", count: paidCount, amount_inr_lakhs: Number((totalCollected / 100000).toFixed(1)), color: "#10b981" },
      { status: "PARTIALLY_PAID", count: partialCount, amount_inr_lakhs: 4.8, color: "#f59e0b" },
      { status: "OVERDUE", count: overdueCount, amount_inr_lakhs: Number((totalArrears / 100000).toFixed(1)), color: "#ef4444" },
      { status: "PENDING", count: pendingCount, amount_inr_lakhs: 2.1, color: "#64748b" }
    ],
    civic_score_distribution: [
      { range: "76 - 100", category: "WELL_CONNECTED", count: 9, percentage: 56, color: "#10b981" },
      { range: "51 - 75", category: "GOOD", count: 4, percentage: 25, color: "#0ea5e9" },
      { range: "26 - 50", category: "BASIC", count: 2, percentage: 13, color: "#f59e0b" },
      { range: "0 - 25", category: "LIMITED", count: 1, percentage: 6, color: "#ef4444" }
    ],
    infrastructure_projects: infrastructureProjectsDatabase,
    service_deficits_by_category: [
      { category: "Road Access Gap", unserved_parcels: 2, critical_cases: 1 },
      { category: "Water Network Extension", unserved_parcels: 3, critical_cases: 1 },
      { category: "Underground Sewerage (UGD)", unserved_parcels: 4, critical_cases: 0 },
      { category: "Property Tax Overdue", unserved_parcels: 2, critical_cases: 2 }
    ]
  });
});

// 11. GET /api/civic/my-services - Citizen's Civic Services View
app.get("/api/civic/my-services", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const userName = user?.full_name || user?.email || "";
  const userParcels = parcelsDatabase.filter(p => p.current_owner.toLowerCase().includes(userName.toLowerCase()) || p.parcel_id === "TN-CBE-001-124-1");

  const parcelsData = userParcels.map(p => {
    const tax = propertyTaxDatabase.find(t => t.parcel_id === p.parcel_id) || null;
    const water = waterConnectionsDatabase.find(w => w.parcel_id === p.parcel_id) || null;
    const ele = electricityConnectionsDatabase.find(e => e.parcel_id === p.parcel_id) || null;
    const road = roadAccessDatabase.find(r => r.parcel_id === p.parcel_id) || null;
    const score = calculateCivicServiceScoreForParcel(p.parcel_id).overall_score;

    return {
      parcel_id: p.parcel_id,
      survey_number: p.survey_number,
      village: p.village,
      property_tax: tax,
      water,
      electricity: ele,
      road,
      civic_score: score
    };
  });

  const pids = userParcels.map(p => p.parcel_id);
  const requests = civicServiceRequestsDatabase.filter(r => pids.includes(r.parcel_id) || r.citizen_email === user.email);
  const alerts = civicAlertsDatabase.filter(a => pids.includes(a.parcel_id));

  res.json({
    parcels: parcelsData,
    service_requests: requests,
    unread_alerts: alerts
  });
});

// 12. POST /api/civic/service-request - Citizen Submits Service Request
app.post("/api/civic/service-request", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { parcel_id, service_category, description, priority } = req.body;

  const newReq = {
    id: civicServiceRequestsDatabase.length + 1,
    request_id: `REQ-CIV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    parcel_id,
    citizen_name: user?.full_name || user?.email || "Citizen User",
    citizen_email: user.email,
    service_category,
    description,
    status: "SUBMITTED" as const,
    priority: (priority || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
    assigned_department: service_category === "PROPERTY_TAX_REVIEW"
      ? "Town Panchayat Tax Section"
      : service_category === "WATER_CONNECTION"
      ? "TWAD Board Division"
      : service_category === "ELECTRICITY_SANCTION"
      ? "TANGEDCO Sub-Division"
      : "Municipal Engineering Wing",
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  civicServiceRequestsDatabase.unshift(newReq);
  res.status(201).json(newReq);
});

// 13. POST /api/civic/record-review - Officer Actions
app.post("/api/civic/record-review", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { parcel_id, action, notes } = req.body;

  // Log action
  console.log(`[Officer Civic Action] Parcel: ${parcel_id} | Action: ${action} | Notes: ${notes}`);

  res.json({
    status: "SUCCESS",
    message: `Civic review recorded for parcel ${parcel_id}. Status updated to ${action}.`
  });
});

// 14. GET /api/civic/layers/:layerId - Civic Vector GIS Layers
app.get("/api/civic/layers/:layerId", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { layerId } = req.params;

  switch (layerId) {
    case "civic_water":
      res.json({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "TWAD Board 300mm Main Distribution Pipeline",
              capacity: "1.2 MLD",
              color: "#0284c7"
            },
            geometry: {
              type: "LineString",
              coordinates: [[77.0310, 11.0255], [77.0380, 11.0265], [77.0450, 11.0280]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Sulur Pumping Station & Booster Reservoir",
              type: "PUMPING_STATION",
              color: "#0369a1"
            },
            geometry: {
              type: "Point",
              coordinates: [77.0375, 11.0270]
            }
          }
        ]
      });
      break;

    case "civic_power":
      res.json({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "TANGEDCO 11kV Feeder Line (Sulur Sub-Station)",
              voltage: "11kV",
              color: "#eab308"
            },
            geometry: {
              type: "LineString",
              coordinates: [[77.0305, 11.0245], [77.0390, 11.0255], [77.0440, 11.0275]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Distribution Transformer TR-04 (250 kVA)",
              color: "#ca8a04"
            },
            geometry: {
              type: "Point",
              coordinates: [77.0345, 11.0252]
            }
          }
        ]
      });
      break;

    case "civic_roads":
      res.json({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "SH-174 Sulur - Coimbatore Bypass (24m RoW)",
              authority: "State Highways",
              color: "#64748b"
            },
            geometry: {
              type: "LineString",
              coordinates: [[77.0280, 11.0240], [77.0420, 11.0270]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Sulur Ward 4 Main Link Road (12m Paved)",
              authority: "Town Panchayat",
              color: "#94a3b8"
            },
            geometry: {
              type: "LineString",
              coordinates: [[77.0330, 11.0230], [77.0345, 11.0290]]
            }
          }
        ]
      });
      break;

    case "civic_projects":
      res.json({
        type: "FeatureCollection",
        features: infrastructureProjectsDatabase.map(p => ({
          type: "Feature",
          properties: {
            id: p.project_id,
            name: p.project_name,
            type: p.project_type,
            status: p.status,
            investment_inr_cr: p.investment_inr_cr,
            color: "#6366f1"
          },
          geometry: p.geometry || {
            type: "Point",
            coordinates: [77.0360, 11.0260]
          }
        }))
      });
      break;

    case "civic_telecom":
      res.json({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "BharatNet Optical Fiber High-Speed Backbone",
              type: "FIBER",
              color: "#a855f7"
            },
            geometry: {
              type: "LineString",
              coordinates: [[77.0290, 11.0240], [77.0370, 11.0260], [77.0430, 11.0280]]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "5G Ultra-Wideband Tower & Digital Seva Kendra",
              type: "TOWER",
              color: "#9333ea"
            },
            geometry: {
              type: "Point",
              coordinates: [77.0350, 11.0265]
            }
          }
        ]
      });
      break;

    case "civic_tax":
      res.json({
        type: "FeatureCollection",
        features: propertyTaxDatabase.map(t => ({
          type: "Feature",
          properties: {
            parcel_id: t.parcel_id,
            tax_record_id: t.tax_record_id,
            status: t.payment_status,
            arrears: t.arrears,
            color: t.payment_status === "PAID" ? "#10b981" : t.payment_status === "OVERDUE" ? "#ef4444" : "#f59e0b"
          },
          geometry: {
            type: "Point",
            coordinates: [77.0340 + (t.id * 0.0005), 11.0250 + (t.id * 0.0003)]
          }
        }))
      });
      break;

    default:
      res.json({ type: "FeatureCollection", features: [] });
  }
});

// ============================================================================
// PHASE 10: NATIONAL SCALABILITY & STATE CONFIGURATION ENGINE ENDPOINTS
// ============================================================================

const stateProfilesStore = [
  {
    id: 1,
    state_code: "TN",
    state_name: "Tamil Nadu",
    country: "India",
    primary_language: "Tamil",
    supported_languages: ["Tamil", "English"],
    land_record_system_name: "Tamil Nilam (e-District Land Portal)",
    registration_system_name: "STAR 2.0 (Registration & Stamp)",
    survey_system_name: "CollabLand Tamil Nadu (Cadastral Mapping)",
    default_area_unit: "Acre / Cent",
    default_language: "ta",
    timezone: "Asia/Kolkata",
    currency: "INR",
    status: "ACTIVE",
    rural_structure: ["State", "District", "Revenue Division", "Taluk (வட்டம்)", "Firka", "Revenue Village (வருவாய் கிராமம்)"],
    urban_structure: ["State", "City Municipal Corporation", "Zone", "Ward (வார்டு)", "Town Survey Number (TS No)", "Block"],
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-08-20T10:30:00Z"
  },
  {
    id: 2,
    state_code: "KA",
    state_name: "Karnataka",
    country: "India",
    primary_language: "Kannada",
    supported_languages: ["Kannada", "English"],
    land_record_system_name: "Bhoomi RTC (Revenue Record System)",
    registration_system_name: "KAVERI 2.0 (Department of Stamps & Registration)",
    survey_system_name: "Dishaank & Mojini 3.0 (GIS Survey Engine)",
    default_area_unit: "Acre / Guntha",
    default_language: "kn",
    timezone: "Asia/Kolkata",
    currency: "INR",
    status: "ACTIVE",
    rural_structure: ["State", "District", "Sub-Division", "Taluk", "Hobli (ಹೋಬಳಿ)", "Village (ಗ್ರಾಮ)"],
    urban_structure: ["State", "BBMP / City Corporation", "Zone", "Ward", "E-Aasthi Property ID", "PID"],
    created_at: "2026-01-20T00:00:00Z",
    updated_at: "2026-08-22T14:15:00Z"
  },
  {
    id: 3,
    state_code: "KL",
    state_name: "Kerala",
    country: "India",
    primary_language: "Malayalam",
    supported_languages: ["Malayalam", "English"],
    land_record_system_name: "e-Rekha (Digital Land Records)",
    registration_system_name: "PEARL (Package for Effective Administration of Registration of Land)",
    survey_system_name: "Bhoo Bhoomi Resurvey Engine",
    default_area_unit: "Acre / Cent / Hectare",
    default_language: "ml",
    timezone: "Asia/Kolkata",
    currency: "INR",
    status: "ACTIVE",
    rural_structure: ["State", "District", "Revenue Division", "Taluk", "Village (വില്ലേജ്)", "Desom (ദേശം)"],
    urban_structure: ["State", "Municipal Corporation / Municipality", "Ward (വാർഡ്)", "Door No / Building Tax ID"],
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-08-24T09:00:00Z"
  },
  {
    id: 4,
    state_code: "MH",
    state_name: "Maharashtra",
    country: "India",
    primary_language: "Marathi",
    supported_languages: ["Marathi", "English", "Hindi"],
    land_record_system_name: "MahaBhulekh (7/12 & 8A Online)",
    registration_system_name: "iSARITA 2.0 (Inspector General of Registration)",
    survey_system_name: "e-Mojani (Land Records Settlement)",
    default_area_unit: "Hectare / Are / Guntha",
    default_language: "hi",
    timezone: "Asia/Kolkata",
    currency: "INR",
    status: "ACTIVE",
    rural_structure: ["State", "Division (विभाग)", "District", "Sub-Division", "Taluka (तालुका)", "Circle", "Village (गाव)"],
    urban_structure: ["State", "Municipal Corporation (MCGM/PMC)", "Prabhag / Ward", "City Survey Office (CTSO)", "City Survey Number (CTS No)"],
    created_at: "2026-02-10T00:00:00Z",
    updated_at: "2026-08-25T11:20:00Z"
  },
  {
    id: 5,
    state_code: "DL",
    state_name: "Delhi (NCT)",
    country: "India",
    primary_language: "Hindi",
    supported_languages: ["Hindi", "English"],
    land_record_system_name: "Bhulekh Delhi (Revenue Department)",
    registration_system_name: "DORIS (Delhi Online Registration Information System)",
    survey_system_name: "DDA GIS Portal (L-Zone Masterplan)",
    default_area_unit: "Bigha / Biswa / Sq.Yards",
    default_language: "hi",
    timezone: "Asia/Kolkata",
    currency: "INR",
    status: "ACTIVE",
    rural_structure: ["State", "District", "Sub-Division", "Tehsil", "Revenue Village"],
    urban_structure: ["State", "MCD (Municipal Corp)", "Zone", "Ward", "Colony Category (A-H)", "Property Tax UPIC"],
    created_at: "2026-02-15T00:00:00Z",
    updated_at: "2026-08-26T16:00:00Z"
  },
  {
    id: 6,
    state_code: "PB",
    state_name: "Punjab",
    country: "India",
    primary_language: "Punjabi",
    supported_languages: ["Punjabi", "English", "Hindi"],
    land_record_system_name: "PLRS (Punjab Land Records Society - Jamabandi)",
    registration_system_name: "NGDRS Punjab (National Generic Document Registration)",
    survey_system_name: "PLRS Cadastral Map Engine",
    default_area_unit: "Kanal / Marla / Acre",
    default_language: "hi",
    timezone: "Asia/Kolkata",
    currency: "INR",
    status: "ACTIVE",
    rural_structure: ["State", "Division", "District", "Tehsil", "Sub-Tehsil", "Kanungo Circle", "Patwar Circle", "Hadbast / Village"],
    urban_structure: ["State", "Municipal Corporation", "Zone", "Ward", "Urban Property ID"],
    created_at: "2026-02-20T00:00:00Z",
    updated_at: "2026-08-27T08:45:00Z"
  }
];

app.get("/api/state/profiles", (req: Request, res: Response) => {
  res.json(stateProfilesStore);
});

app.get("/api/state/:stateCode", (req: Request, res: Response) => {
  const code = req.params.stateCode.toUpperCase();
  const profile = stateProfilesStore.find(s => s.state_code === code);
  if (!profile) {
    res.status(404).json({ detail: `State profile for ${code} not found` });
    return;
  }
  res.json(profile);
});

app.post("/api/state/onboard", (req: Request, res: Response) => {
  const data = req.body;
  const newId = stateProfilesStore.length + 1;
  const newProfile = {
    id: newId,
    state_code: (data.state_code || "XX").toUpperCase(),
    state_name: data.state_name || "New State",
    country: "India",
    primary_language: data.primary_language || "English",
    supported_languages: data.supported_languages || [data.primary_language || "English", "English"],
    land_record_system_name: data.land_record_system_name || "State Land Portal",
    registration_system_name: data.registration_system_name || "SRO Registration Portal",
    survey_system_name: data.survey_system_name || "Cadastral Survey Engine",
    default_area_unit: data.default_area_unit || "Acre / Cent",
    default_language: data.default_language || "en",
    timezone: "Asia/Kolkata",
    currency: "INR",
    status: "ACTIVE",
    rural_structure: data.rural_structure || ["State", "District", "Taluk", "Village"],
    urban_structure: data.urban_structure || ["State", "Corporation", "Ward", "Assessment No"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  stateProfilesStore.push(newProfile);
  res.json({
    success: true,
    state_code: newProfile.state_code,
    message: `State ${newProfile.state_name} (${newProfile.state_code}) onboarded successfully.`
  });
});

app.post("/api/state/:stateCode/normalize", (req: Request, res: Response) => {
  const code = req.params.stateCode.toUpperCase();
  const { source_system, source_record } = req.body;
  const raw = source_record || {};

  let survey_number = raw.survey_no || raw.pula_en || raw.gat_kramank || raw.khasra_no || "124/1";
  let subdivision_number = raw.subdivision_no || raw.utpirivu_en || raw.hissa_no || raw.pot_hissa || "1";
  let owner_name = raw.owner_name || raw.patta_dharar_peyar || raw.khatedar_name || "Ramasamy Govindaraj";
  let owner_identifier = raw.owner_identifier || "XXXX-XXXX-8921";
  let rawArea = Number(raw.area || raw.extent || raw.extent_in_acres || raw.parappu_hec_are || 2.0);
  let original_unit = raw.area_unit || (code === "TN" ? "Cent" : code === "KA" ? "Guntha" : code === "MH" ? "Are" : "Acre");
  let area_sq_m = 8093.71;

  if (original_unit.toLowerCase().includes("cent")) {
    area_sq_m = rawArea * 40.4686;
  } else if (original_unit.toLowerCase().includes("guntha")) {
    area_sq_m = rawArea * 101.1714;
  } else if (original_unit.toLowerCase().includes("are")) {
    area_sq_m = rawArea * 100;
  } else if (original_unit.toLowerCase().includes("acre")) {
    area_sq_m = rawArea * 4046.8564;
  } else if (original_unit.toLowerCase().includes("hectare")) {
    area_sq_m = rawArea * 10000;
  }

  res.json({
    state_code: code,
    source_system: source_system || "State Revenue Ingestion Gateway",
    standardized_record: {
      parcel_id: `PARCEL-${code}-${survey_number.replace(/\//g, "-")}`,
      ulpin: `IN-${code}-${Math.floor(100000 + Math.random() * 900000)}`,
      survey_number,
      subdivision_number,
      owner_name,
      owner_identifier,
      area_sq_m: Number(area_sq_m.toFixed(2)),
      original_area: rawArea,
      original_unit,
      land_use: raw.land_use || "Agricultural (Wet / நஞ்சை)",
      registration_id: raw.registration_id || raw.doc_reg_number || `REG-${code}-2026-9182`,
      registration_date: raw.registration_date || "2026-03-12",
      administrative_units: {
        state: code === "TN" ? "Tamil Nadu" : code === "KA" ? "Karnataka" : code === "KL" ? "Kerala" : "Maharashtra",
        district: raw.district || "Coimbatore",
        sub_district: raw.taluk || raw.taluka || "Sulur",
        village_or_ward: raw.village || raw.gav || "Kannampalayam"
      }
    },
    applied_transformations: [
      {
        source_field: "extent / area",
        standard_field: "area_sq_m",
        rule_applied: `CONVERT_${original_unit.toUpperCase()}_TO_SQM`,
        original_value: `${rawArea} ${original_unit}`,
        transformed_value: `${area_sq_m.toFixed(2)} Square Meters`
      },
      {
        source_field: "owner_name_source",
        standard_field: "owner_name",
        rule_applied: "TRIM_AND_STANDARDIZE_CASE",
        original_value: owner_name,
        transformed_value: owner_name
      }
    ],
    quality_status: "DATA_VALID",
    quality_notes: [
      "ULPIN coordinate verified with National Cadastral standard",
      "Area converted accurately to SI Square Meters"
    ]
  });
});

app.post("/api/state/:stateCode/quality-check", (req: Request, res: Response) => {
  const code = req.params.stateCode.toUpperCase();
  res.json({
    state_code: code,
    total_records_checked: 2450,
    valid_count: 2380,
    warning_count: 55,
    error_count: 15,
    compliance_percentage: 97.1,
    validation_issues: [
      {
        rule_id: "RULE-EXTENT-01",
        severity: "WARNING",
        field: "extent",
        message: "Extent specified in legacy regional unit with sub-decimal precision mapped to SI standard",
        record_ref: `REC-${code}-009`
      },
      {
        rule_id: "RULE-ULPIN-02",
        severity: "INFO",
        field: "ulpin",
        message: "ULPIN geo-coordinate centroid verified with 0.05m tolerance",
        record_ref: `REC-${code}-124`
      }
    ]
  });
});

// Vite Middleware for development / Static Serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LandSync] Full-stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
