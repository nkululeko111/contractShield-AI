const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { createWorker } = require("tesseract.js");
const { Groq } = require("groq-sdk");
const { OpenAI } = require("openai");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const recentAnalyses = new Map();
const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- SECURITY MIDDLEWARE -------------------- */
app.use(helmet());
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan("combined"));

/* -------------------- RATE LIMITING -------------------- */
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
  })
);

/* -------------------- FILE UPLOAD -------------------- */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

/* -------------------- AI CLIENTS -------------------- */
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* -------------------- TEXT EXTRACTION -------------------- */
async function extractPDF(filePath) {
  console.log("[DEBUG] Extracting text from PDF:", filePath);
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  console.log("[DEBUG] PDF text length:", data.text.length);
  return data.text;
}

async function extractDOCX(filePath) {
  console.log("[DEBUG] Extracting text from DOCX:", filePath);
  const result = await mammoth.extractRawText({ path: filePath });
  console.log("[DEBUG] DOCX text length:", result.value.length);
  return result.value;
}

async function extractImage(filePath) {
  console.log("[DEBUG] Extracting text from image:", filePath);
  const worker = await createWorker();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const { data: { text } } = await worker.recognize(filePath);
  await worker.terminate();
  console.log("[DEBUG] Image text length:", text.length);
  return text;
}

/* -------------------- AI CONTRACT ANALYSIS -------------------- */
async function analyzeContract(text, language = "en") {
  console.log("[DEBUG] Analyzing contract text length:", text.length);
  
  const prompt = `
You are a South African contract law expert. Analyze this employment contract and return ONLY valid JSON in this exact structure:

{
  "score": 72,
  "overview": "This employment contract has some concerning clauses that could disadvantage you. The termination clause violates BCEA requirements, and the non-compete period is excessive. However, payment terms are fair and comply with labour law.",
  "analysis": [
    {
      "icon": "alert-triangle",
      "title": "Illegal Termination Clause",
      "description": "Clause 4.2 violates BCEA Section 188",
      "severity": "high",
      "details": "The contract allows termination without proper notice period required by the Basic Conditions of Employment Act. This clause is unenforceable and you can challenge it legally."
    },
    {
      "icon": "zap",
      "title": "Unfair Non-Compete",
      "description": "6-month restriction may be excessive",
      "severity": "medium", 
      "details": "The non-compete clause extends for 6 months which may be deemed unreasonable by SA courts. Consider negotiating down to 3 months or adding geographic limitations."
    },
    {
      "icon": "check-circle",
      "title": "Fair Salary Payment", 
      "description": "Payment terms comply with labour law",
      "severity": "low",
      "details": "Monthly salary payments within 7 days of month-end comply with standard employment practices and BCEA requirements."
    },
    {
      "icon": "message-square",
      "title": "Missing Dispute Resolution",
      "description": "No clear process for handling disputes", 
      "severity": "info",
      "details": "The contract lacks a dispute resolution mechanism. Consider adding a clause requiring mediation before litigation to save costs."
    }
  ]
}

Contract Text to analyze:
${text.substring(0, 52000)} // Limit text to avoid token limits

Return ONLY the JSON, no other text.
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    let analysisText = completion.choices[0].message.content;
    console.log("[DEBUG] Raw AI response:", analysisText);

    // Clean the response
    analysisText = analysisText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    
    const analysis = JSON.parse(analysisText);
    console.log("[DEBUG] Parsed analysis:", analysis);

    // Validate and ensure proper structure
    return {
      score: analysis.score || 50,
      overview: analysis.overview || "Contract analysis completed.",
      analysis: Array.isArray(analysis.analysis) ? analysis.analysis : []
    };

  } catch (err) {
    console.error("[ERROR] AI analysis failed:", err.message);
    
    // Fallback analysis
    return {
      score: 50,
      overview: "Basic contract analysis completed. Some clauses need review.",
      analysis: [
        {
          icon: "alert-triangle",
          title: "Review Required",
          description: "Contract needs professional legal review",
          severity: "medium",
          details: "Please consult with a legal professional for detailed analysis of this contract."
        }
      ]
    };
  }
}

/* -------------------- UPLOAD + ANALYZE ROUTE -------------------- */
app.post("/api/analyze/upload", upload.single("file"), async (req, res) => {
  console.log("[INFO] /analyze/upload called", req.file?.originalname);

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    let extracted = "";
    const mimeType = req.file.mimetype;

    try {
      if (mimeType === "application/pdf") {
        extracted = await extractPDF(req.file.path);
      } else if (mimeType.includes("word")) {
        extracted = await extractDOCX(req.file.path);
      } else if (mimeType.startsWith("image/")) {
        extracted = await extractImage(req.file.path);
      } else {
        extracted = fs.readFileSync(req.file.path, "utf8");
      }
    } catch (extractError) {
      console.error("[ERROR] Text extraction failed:", extractError);
      return res.status(400).json({ error: "Failed to extract text from file" });
    }

    console.log("[DEBUG] Extracted text length:", extracted.length);

    if (!extracted.trim()) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "No text could be extracted from the file." });
    }

    const aiAnalysis = await analyzeContract(extracted, req.body.language || "en");
    
    // Clean up file
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.warn("[WARN] Failed to delete temp file:", cleanupError);
    }

    const id = uuidv4();
    const record = { 
      id, 
      analysis: aiAnalysis, 
      createdAt: new Date(),
      fileName: req.file.originalname 
    };
    
    recentAnalyses.set(id, record);

    // Keep only last 20 analyses
    if (recentAnalyses.size > 20) {
      const firstKey = recentAnalyses.keys().next().value;
      recentAnalyses.delete(firstKey);
    }

    res.json({ 
      success: true, 
      id, 
      analysis: aiAnalysis 
    });

  } catch (err) {
    console.error("[ERROR] Upload + analyze failed:", err);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn("[WARN] Failed to delete temp file on error:", cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: "Failed to process file", 
      details: err.message 
    });
  }
});

/* -------------------- TEXT ANALYZE ROUTE -------------------- */
app.post("/api/analyze/text", async (req, res) => {
  console.log("[INFO] /analyze/text called");
  
  try {
    const { text, language = "en" } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No text provided" });
    }

    console.log("[DEBUG] Analyzing text length:", text.length);
    const aiAnalysis = await analyzeContract(text, language);
    const id = uuidv4();

    const record = { 
      id, 
      analysis: aiAnalysis, 
      createdAt: new Date(),
      source: "text" 
    };
    
    recentAnalyses.set(id, record);

    // Keep only last 20 analyses
    if (recentAnalyses.size > 20) {
      const firstKey = recentAnalyses.keys().next().value;
      recentAnalyses.delete(firstKey);
    }

    console.log("[DEBUG] Analysis completed successfully, ID:", id);
    res.json({ 
      success: true, 
      id, 
      analysis: aiAnalysis 
    });

  } catch (err) {
    console.error("[ERROR] /analyze/text failed:", err);
    res.status(500).json({ 
      error: "Analysis failed", 
      details: err.message 
    });
  }
});

/* -------------------- RECENT ANALYSES -------------------- */
app.get("/api/analyses/recent", (req, res) => {
  const analyses = Array.from(recentAnalyses.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
  
  console.log("[INFO] /analyses/recent returning", analyses.length, "records");
  res.json(analyses);
});

/* -------------------- GET ANALYSIS BY ID -------------------- */
app.get('/api/analyses/:id', (req, res) => {
  const { id } = req.params;
  const record = recentAnalyses.get(id);
  
  if (record) {
    res.json({ analysis: record.analysis });
  } else {
    res.status(404).json({ error: 'Analysis not found' });
  }
});

/* -------------------- HEALTH CHECK -------------------- */
app.get("/api/health", (req, res) =>
  res.json({
    status: "OK",
    timestamp: new Date(),
    analysesCount: recentAnalyses.size,
    groq: !!process.env.GROQ_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  })
);

/* -------------------- DEFAULT ROUTES -------------------- */
app.get("/", (req, res) => res.send("ContractShield AI Backend is running."));
app.get("/api", (req, res) => res.send("Welcome to the ContractShield AI Backend API."));

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("[ERROR] Uncaught:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

/* -------------------- START SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`ContractShield server is running at http://localhost:${PORT}`);
});

module.exports = app;