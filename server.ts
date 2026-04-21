import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import crypto from "crypto";
import axios from "axios";
import { v4 as uuid } from 'uuid';
import { 
  StandardCheckoutClient, 
  Env, 
  MetaInfo, 
  StandardCheckoutPayRequest,
  CreateSdkOrderRequest,
  RefundRequest
} from '@phonepe-pg/pg-sdk-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use("/uploads", express.static(uploadsDir));

  // PhonePe Client Initialization
  const phonepeClientId = process.env.PHONEPE_CLIENT_ID || "";
  const phonepeClientSecret = process.env.PHONEPE_CLIENT_SECRET || "";
  const phonepeClientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || "1", 10);
  const phonepeEnv = process.env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

  let phonepeClient: any = null;
  if (phonepeClientId && phonepeClientSecret) {
    try {
      phonepeClient = StandardCheckoutClient.getInstance(
        phonepeClientId,
        phonepeClientSecret,
        phonepeClientVersion,
        phonepeEnv
      );
      console.log("PhonePe SDK initialized successfully");
    } catch (error) {
      console.error("Failed to initialize PhonePe SDK:", error);
    }
  }

  // Mock Database
  const db = {
    users: [
      { 
        id: "admin-1", 
        email: "admin@gmail.com",
        password: "12345",
        role: "admin", 
        fullName: "Admin User",
        status: "approved",
        package: "diamond",
        paymentStatus: "paid",
        reports: 0
      },
      { 
        id: "owner-admin", 
        email: "shivaparvatimatrimonialgulburg@gmail.com",
        password: "password",
        role: "admin", 
        fullName: "Owner Admin",
        status: "approved",
        package: "diamond",
        paymentStatus: "paid",
        reports: 0
      },
      { 
        id: "user-1", 
        email: "user@gmail.com",
        password: "password",
        role: "user", 
        fullName: "Test User",
        status: "approved",
        package: "free",
        paymentStatus: "unpaid",
        reports: 0
      }
    ],
    profiles: [
      { id: '1', uid: '1', fullName: 'Priya Sharma', gender: 'Female', birthDate: '1998-05-12', education: 'B.E', occupation: 'Software Engineer', nativePlace: 'Gulbarga', state: 'Karnataka', religion: 'Hindu', caste: 'Lingayat', annualIncome: '5L - 10L', status: 'approved', package: 'free' },
      { id: '2', uid: '2', fullName: 'Rahul Patil', gender: 'Male', birthDate: '1995-11-20', education: 'MBA', occupation: 'Business', nativePlace: 'Hubli', state: 'Karnataka', religion: 'Hindu', caste: 'Maratha', annualIncome: '10L - 20L', status: 'approved', package: 'gold' },
      { id: '3', uid: '3', fullName: 'Sneha Kulkarni', gender: 'Female', birthDate: '1997-02-15', education: 'MBBS', occupation: 'Doctor', nativePlace: 'Gulbarga', state: 'Karnataka', religion: 'Hindu', caste: 'Brahmin', annualIncome: '20L - 50L', status: 'approved', package: 'diamond' },
      { id: '4', uid: '4', fullName: 'Vijay Singh', gender: 'Male', birthDate: '1994-08-30', education: 'M.Tech', occupation: 'Civil Engineer', nativePlace: 'Bangalore', state: 'Karnataka', religion: 'Hindu', caste: 'Lingayat', annualIncome: '10L - 20L', status: 'approved', package: 'free' },
    ],
    matches: [],
    successStories: [],
    supportTickets: [
      { id: "t1", userId: "user-1", subject: "Payment Issue", message: "My payment was deducted but package not updated.", status: "open", createdAt: new Date().toISOString() }
    ],
    requestLogs: [
      { id: "l1", userId: "user-1", action: "Profile View", target: "user-2", timestamp: new Date().toISOString() }
    ],
    chatLogs: [
      { id: "c1", from: "user-1", to: "user-2", message: "Hello, interested in your profile.", timestamp: new Date().toISOString() }
    ],
    interests: [] as any[],
    likes: [] as any[],
    connectRequests: [] as any[], // For tracking share/chat requests
    transactions: [
      { 
        id: "MT123456789", 
        userId: "admin-1", 
        packageId: "gold", 
        amount: 150000, 
        status: "COMPLETED", 
        timestamp: new Date().toISOString() 
      }
    ] as any[], // For tracking payments
    settings: {
      homeBanners: [
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1920&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1920&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920&auto=format&fit=crop"
      ],
      aboutImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop",
      logoUrl: "",
      googleMapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3812.68417646633!2d76.8246!3d17.3297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDE5JzQ2LjkiTiA3NsKwNDknMjguNiJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
    },
    masterData: {
      qualifications: ["B.E", "M.Tech", "MBA", "MBBS", "B.Com", "M.Sc", "PhD", "Diploma"],
      professions: ["Software Engineer", "Doctor", "Teacher", "Business", "Civil Engineer", "Accountant", "Lawyer"],
      castes: ["Lingayat", "Brahmin", "Maratha", "Jain", "Reddy", "Vaishya", "Kuruba", "Devanga", "Vishwakarma", "Others"],
      subCastes: ["Panchamasali", "Banajiga", "Gowda", "Saraswat", "Kudaldeshkar", "Chitpavan", "Others"],
      religions: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Others"],
      states: ["Karnataka", "Maharashtra", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Kerala", "Goa", "Gujarat", "Rajasthan", "Delhi"],
      languages: ["Kannada", "English", "Hindi", "Marathi", "Telugu", "Tamil", "Malayalam", "Gujarati", "Konkani"],
      incomeRanges: ["Below 3L", "3L - 5L", "5L - 7L", "7L - 10L", "10L - 15L", "15L - 25L", "25L - 50L", "50L - 1Cr", "Above 1Cr"],
      packages: [
        { id: "free", name: "Free", price: "₹0.00", features: "Basic features, upto 20 profiles visible.", limit: 20 },
        { id: "gold", name: "Gold", price: "₹1,500 / month", features: "Premium features, upto 50 profiles visible.", limit: 50 },
        { id: "diamond", name: "Diamond", price: "₹2,500 / month", features: "All features, unlimited Profiles.", limit: -1 }
      ]
    }
  };

  // API Routes
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ url: filePath });
  });

  app.get("/api/settings", (req, res) => {
    res.json(db.settings);
  });

  app.get("/api/master-data", (req, res) => {
    res.json(db.masterData);
  });

  app.post("/api/admin/master-data/:type", (req, res) => {
    const { type } = req.params;
    const { item } = req.body;
    if (db.masterData[type as keyof typeof db.masterData]) {
      (db.masterData[type as keyof typeof db.masterData] as string[]).push(item);
      res.json(db.masterData);
    } else {
      res.status(400).json({ error: "Invalid type" });
    }
  });

  app.post("/api/admin/settings", (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    res.json(db.settings);
  });

  app.post("/api/admin/packages", (req, res) => {
    const { packages } = req.body;
    db.masterData.packages = packages;
    res.json(db.masterData.packages);
  });

  app.get("/api/admin/logs/connect-requests", (req, res) => {
    const logsWithNames = db.connectRequests.map(r => {
      const fromUser = db.users.find(u => u.id === r.fromUserId);
      const toUser = db.users.find(u => u.id === r.toUserId);
      return {
        ...r,
        fromUserName: fromUser?.fullName || 'Unknown',
        toUserName: toUser?.fullName || 'Unknown'
      };
    });
    res.json(logsWithNames);
  });
  
  app.get("/api/admin/logs/requests", (req, res) => res.json(db.requestLogs));
  app.get("/api/admin/logs/chats", (req, res) => res.json(db.chatLogs));
  
  app.get("/api/admin/payments", (req, res) => {
    const payments = db.transactions.map(t => {
      const user = db.users.find(u => u.id === t.userId);
      return {
        ...t,
        userName: user?.fullName || "Unknown User",
        email: user?.email || "N/A"
      };
    });
    res.json(payments);
  });

  app.get("/api/admin/support", (req, res) => res.json(db.supportTickets));
  app.get("/api/admin/requests", (req, res) => res.json(db.connectRequests));
  
  app.post("/api/connect-request", (req, res) => {
    const { fromUserId, toUserId, type } = req.body;
    const request = {
      id: `req-${Date.now()}`,
      fromUserId,
      toUserId,
      type, // 'chat' or 'share'
      status: 'pending', // 'pending', 'approved', 'declined'
      timestamp: new Date().toISOString()
    };
    db.connectRequests.push(request);
    res.json(request);
  });

  app.patch("/api/connect-request/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const index = db.connectRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      db.connectRequests[index].status = status;
      res.json(db.connectRequests[index]);
    } else res.status(404).json({ error: "Request not found" });
  });

  app.get("/api/connect-requests/user/:userId", (req, res) => {
    const { userId } = req.params;
    res.json({
      sent: db.connectRequests.filter(r => r.fromUserId === userId),
      received: db.connectRequests.filter(r => r.toUserId === userId)
    });
  });

  app.post("/api/support", (req, res) => {
    const ticket = { id: `t${Date.now()}`, ...req.body, status: "open", createdAt: new Date().toISOString() };
    db.supportTickets.push(ticket);
    res.json(ticket);
  });

  app.patch("/api/admin/support/:id", (req, res) => {
    const { id } = req.params;
    const index = db.supportTickets.findIndex(t => t.id === id);
    if (index !== -1) {
      db.supportTickets[index] = { ...db.supportTickets[index], ...req.body };
      res.json(db.supportTickets[index]);
    } else res.status(404).json({ error: "Ticket not found" });
  });

  // Manager Management
  app.post("/api/admin/managers", (req, res) => {
    const manager = { ...req.body, id: `mgr-${Date.now()}`, role: "manager", status: "approved" };
    db.users.push(manager);
    res.json(manager);
  });

  // PhonePe Integration
  app.post("/api/payments/initiate", async (req, res) => {
    const { packageId, userId } = req.body;
    const pkg = db.masterData.packages.find(p => p.id === packageId);
    if (!pkg) return res.status(400).json({ error: "Invalid package" });

    // If SDK is not initialized, use mock flow
    if (!phonepeClient) {
      console.warn("PhonePe SDK not initialized, using mock flow");
      const mockTxnId = `MT-MOCK-${Date.now()}`;
      return res.json({
        success: true,
        paymentUrl: `https://${req.get("host")}/payment-status?id=${mockTxnId}`,
        transactionId: mockTxnId
      });
    }

    try {
      const merchantOrderId = uuid();
      const priceMatch = pkg.price.match(/[\d,.]+/);
      const numericPrice = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, "")) : 0;
      const amountInPaisa = Math.round(numericPrice * 100);

      const request = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(amountInPaisa)
        .redirectUrl(`https://${req.get("host")}/payment-status?id=${merchantOrderId}`)
        .message(`Subscription for ${pkg.name} package`)
        .build();

      const response = await phonepeClient.pay(request);
      
      // Store transaction record
      db.transactions.push({
        id: merchantOrderId,
        userId,
        packageId,
        amount: amountInPaisa,
        status: 'PENDING',
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        paymentUrl: response.redirectUrl,
        transactionId: merchantOrderId,
        phonepeOrderId: response.orderId
      });
    } catch (error: any) {
      console.error("PhonePe SDK Pay Error:", error);
      res.status(500).json({ 
        error: "Payment initiation failed", 
        message: error.message 
      });
    }
  });

  app.post("/api/payments/callback", (req, res) => {
    const authorizationHeader = req.headers['authorization'] as string;
    const body = JSON.stringify(req.body);
    
    const username = process.env.PHONEPE_CALLBACK_USERNAME;
    const password = process.env.PHONEPE_CALLBACK_PASSWORD;

    if (!phonepeClient || !username || !password) {
      console.log("Mocking callback verification");
      return res.status(200).send("OK");
    }

    try {
      const callbackResponse = phonepeClient.validateCallback(
        username,
        password,
        authorizationHeader,
        body
      );

      console.log("Verified PhonePe Callback:", callbackResponse);
      const { orderId, state } = callbackResponse.payload;
      
      // Update DB based on state...
      
      res.status(200).send("OK");
    } catch (error) {
      console.error("Callback Verification Failed:", error);
      res.status(401).send("Unauthorized");
    }
  });

  app.get("/api/payments/status/:merchantOrderId", async (req, res) => {
    const { merchantOrderId } = req.params;

    if (!phonepeClient) {
      return res.json({ success: true, state: "COMPLETED", mock: true });
    }

    try {
      const response = await phonepeClient.getOrderStatus(merchantOrderId);
      
      // Update our database if status is COMPLETED
      if (response.state === 'COMPLETED') {
        const txnIndex = db.transactions.findIndex(t => t.id === merchantOrderId);
        if (txnIndex !== -1) {
          const txn = db.transactions[txnIndex];
          db.transactions[txnIndex].status = 'COMPLETED';

          // Update user package
          const userIndex = db.users.findIndex(u => u.id === txn.userId);
          if (userIndex !== -1) {
            db.users[userIndex].package = txn.packageId;
            db.users[userIndex].paymentStatus = 'paid';
            
            // Also update profile
            const profileIndex = db.profiles.findIndex(p => p.uid === txn.userId);
            if (profileIndex !== -1) {
              db.profiles[profileIndex].package = txn.packageId;
            }
          }
        }
      }

      res.json(response);
    } catch (error: any) {
      console.error("PhonePe SDK Status Error:", error);
      res.status(500).json({ 
        error: "Failed to fetch payment status",
        message: error.message 
      });
    }
  });

  app.post("/api/payments/refund", async (req, res) => {
    const { merchantOrderId, amount } = req.body;

    if (!phonepeClient) {
      return res.json({ success: true, message: "Refund initiated (Mock)", state: "PENDING" });
    }

    try {
      const refundId = uuid();
      const request = RefundRequest.builder()
        .amount(amount * 100)
        .merchantRefundId(refundId)
        .originalMerchantOrderId(merchantOrderId)
        .build();

      const response = await phonepeClient.refund(request);
      res.json(response);
    } catch (error: any) {
      console.error("PhonePe SDK Refund Error:", error);
      res.status(500).json({ 
        error: "Refund initiation failed",
        message: error.message 
      });
    }
  });

  // User Management API
  app.get("/api/admin/users", (req, res) => {
    res.json(db.users);
  });

  app.patch("/api/admin/users/:id", (req, res) => {
    const { id } = req.params;
    const index = db.users.findIndex(u => u.id === id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...req.body };
      // Also update profile if exists
      const pIndex = db.profiles.findIndex(p => p.uid === id);
      if (pIndex !== -1) {
        db.profiles[pIndex] = { ...db.profiles[pIndex], ...req.body };
      }
      res.json(db.users[index]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    const { id } = req.params;
    db.users = db.users.filter(u => u.id !== id);
    db.profiles = db.profiles.filter(p => p.uid !== id);
    res.json({ success: true });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const cleanEmail = email.toLowerCase().trim();
    const user = db.users.find(u => u.email.toLowerCase().trim() === cleanEmail && u.password === password);
    if (user) {
      res.json({ user });
    } else {
      res.status(401).json({ error: "Invalid credentials. Please check your email and password." });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const userData = req.body;
    const status = userData.status || "pending";
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      role: "user",
      status
    };
    db.users.push(newUser);
    db.profiles.push({ ...userData, uid: newUser.id, status });
    res.json({ user: newUser });
  });

  app.patch("/api/profiles/:id", (req, res) => {
    const { id } = req.params;
    const index = db.profiles.findIndex(p => p.id === id || p.uid === id);
    if (index !== -1) {
      db.profiles[index] = { ...db.profiles[index], ...req.body };
      // Also update user record if it's a shared field
      const uIndex = db.users.findIndex(u => u.id === db.profiles[index].uid);
      if (uIndex !== -1) {
        if (req.body.fullName) db.users[uIndex].fullName = req.body.fullName;
        if (req.body.email) db.users[uIndex].email = req.body.email;
      }
      res.json(db.profiles[index]);
    } else {
      res.status(404).json({ error: "Profile not found" });
    }
  });

  app.get("/api/profiles", (req, res) => {
    res.json(db.profiles.filter(p => p.status === "approved"));
  });

  app.get("/api/profiles/:id", (req, res) => {
    const { id } = req.params;
    const profile = db.profiles.find(p => p.id === id || p.uid === id);
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ error: "Profile not found" });
    }
  });

  app.post("/api/interests", (req, res) => {
    const { fromUserId, toUserId } = req.body;
    const interest = {
      id: `int-${Date.now()}`,
      fromUserId,
      toUserId,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    db.interests.push(interest);
    res.json(interest);
  });

  app.post("/api/likes", (req, res) => {
    const { userId, targetProfileId } = req.body;
    const existing = db.likes.find(l => l.userId === userId && l.targetProfileId === targetProfileId);
    if (existing) {
      db.likes = db.likes.filter(l => l.userId !== userId || l.targetProfileId !== targetProfileId);
      res.json({ liked: false });
    } else {
      const like = {
        id: `like-${Date.now()}`,
        userId,
        targetProfileId,
        timestamp: new Date().toISOString()
      };
      db.likes.push(like);
      res.json({ liked: true });
    }
  });

  app.get("/api/interests/sent/:userId", (req, res) => {
    const { userId } = req.params;
    res.json(db.interests.filter(i => i.fromUserId === userId));
  });

  app.get("/api/likes/:userId", (req, res) => {
    const { userId } = req.params;
    res.json(db.likes.filter(l => l.userId === userId));
  });

  app.get("/api/admin/users", (req, res) => {
    res.json(db.users);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
