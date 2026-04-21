import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import crypto from "crypto";
import axios from "axios";

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

    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    const host = process.env.PHONEPE_HOST || "https://api-preprod.phonepe.com/apis/hermes";

    // If keys are missing, use mock flow
    if (!merchantId || !saltKey) {
      console.warn("PhonePe keys missing, using mock flow");
      const mockTxnId = `MT-MOCK-${Date.now()}`;
      return res.json({
        success: true,
        paymentUrl: `https://${req.get("host")}/payment-status?id=${mockTxnId}`,
        transactionId: mockTxnId
      });
    }

    const merchantTransactionId = `MT${Date.now()}`;
    // Improved price parsing: extract numbers and handle decimals
    const priceMatch = pkg.price.match(/[\d,.]+/);
    const numericPrice = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, "")) : 0;
    const amountInPaisa = Math.round(numericPrice * 100);

    const payload = {
      merchantId,
      merchantTransactionId,
      merchantUserId: userId,
      amount: amountInPaisa,
      redirectUrl: `https://${req.get("host")}/payment-status?id=${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: `https://${req.get("host")}/api/payments/callback`,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const stringToHash = base64Payload + "/pg/v1/pay" + saltKey;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const checksum = sha256 + "###" + saltIndex;

    try {
      const response = await axios.post(
        `${host}/pg/v1/pay`,
        { request: base64Payload },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            accept: "application/json"
          }
        }
      );

      res.json({
        success: true,
        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
        transactionId: merchantTransactionId
      });
    } catch (error: any) {
      const errorData = error.response?.data;
      console.error("PhonePe Error:", errorData || error.message);
      res.status(500).json({ 
        error: "Payment initiation failed", 
        details: errorData?.message || error.message,
        code: errorData?.code
      });
    }
  });

  app.post("/api/payments/callback", (req, res) => {
    try {
      const { response } = req.body;
      if (response) {
        const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());
        console.log("PhonePe Server Callback:", decodedResponse);
        
        // In a real app, you would verify the checksum here and update the database
        // const { success, code, data } = decodedResponse;
        // if (success && code === 'PAYMENT_SUCCESS') { ... }
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("Callback Error:", error);
      res.status(500).send("Error");
    }
  });

  // PhonePe Status API
  app.get("/api/payments/status/:merchantTransactionId", async (req, res) => {
    const { merchantTransactionId } = req.params;
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    const host = process.env.PHONEPE_HOST || "https://api-preprod.phonepe.com/apis/hermes";

    if (!merchantId || !saltKey) {
      return res.json({ success: true, status: "COMPLETED", mock: true });
    }

    const stringToHash = `/pg/v1/status/${merchantId}/${merchantTransactionId}${saltKey}`;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const checksum = sha256 + "###" + saltIndex;

    try {
      const response = await axios.get(
        `${host}/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            "X-MERCHANT-ID": merchantId,
            accept: "application/json"
          }
        }
      );
      res.json(response.data);
    } catch (error: any) {
      const errorData = error.response?.data;
      console.error("PhonePe Status Error:", errorData || error.message);
      res.status(500).json({ 
        error: "Failed to fetch payment status",
        details: errorData?.message || error.message,
        code: errorData?.code
      });
    }
  });

  // PhonePe Refund API
  app.post("/api/payments/refund", async (req, res) => {
    const { transactionId, amount, userId } = req.body;
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    const host = process.env.PHONEPE_HOST || "https://api-preprod.phonepe.com/apis/hermes";

    if (!merchantId || !saltKey) {
      return res.json({ success: true, message: "Refund initiated (Mock)" });
    }

    const merchantTransactionId = `REF${Date.now()}`;
    const payload = {
      merchantId,
      merchantUserId: userId,
      merchantTransactionId,
      originalTransactionId: transactionId,
      amount: amount * 100, // Convert to paisa
      callbackUrl: `${req.protocol}://${req.get("host")}/api/payments/refund-callback`
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const stringToHash = base64Payload + "/pg/v1/refund" + saltKey;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const checksum = sha256 + "###" + saltIndex;

    try {
      const response = await axios.post(
        `${host}/pg/v1/refund`,
        { request: base64Payload },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            accept: "application/json"
          }
        }
      );
      res.json(response.data);
    } catch (error: any) {
      console.error("PhonePe Refund Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Refund initiation failed" });
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
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
      res.json({ user });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
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
