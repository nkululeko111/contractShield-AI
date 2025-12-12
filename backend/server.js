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
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const text = data.text || "";
    console.log("[DEBUG] PDF extraction successful, text length:", text.length);
    return text;
  } catch (error) {
    console.error("[ERROR] PDF extraction failed:", error.message);
    throw new Error("Failed to extract text from PDF. File may be corrupted or encrypted.");
  }
}

async function extractDOCX(filePath) {
  console.log("[DEBUG] Extracting text from DOCX:", filePath);
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value || "";
    console.log("[DEBUG] DOCX extraction successful, text length:", text.length);
    return text;
  } catch (error) {
    console.error("[ERROR] DOCX extraction failed:", error.message);
    throw new Error("Failed to extract text from DOCX. File may be corrupted.");
  }
}

async function extractImage(filePath) {
  console.log("[DEBUG] Extracting text from image:", filePath);
  try {
    const worker = await createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data: { text } } = await worker.recognize(filePath);
    await worker.terminate();
    console.log("[DEBUG] Image OCR extraction successful, text length:", text.length);
    return text || "";
  } catch (error) {
    console.error("[ERROR] Image OCR extraction failed:", error.message);
    await worker.terminate().catch(() => {});
    throw new Error("Failed to extract text from image using OCR.");
  }
}

/* -------------------- AI CONTRACT ANALYSIS -------------------- */
async function analyzeContract(text, language = "en") {
  console.log("[DEBUG] Analyzing contract text length:", text.length);
  
  if (!text || text.trim().length === 0) {
    console.error("[ERROR] Empty text provided for analysis");
    throw new Error("No text available for analysis");
  }
  
  const prompt = `
You are an expert South African contract law attorney with 15+ years of experience in employment law, commercial contracts, and legal compliance. Analyze this contract COMPREHENSIVELY and return ONLY valid JSON.

EXTRACT AND RETURN THIS EXACT STRUCTURE:

{
  "score": 65,
  "contractDetails": {
    "startDate": "Exact start date from contract or 'Not specified'",
    "endDate": "Exact end date from contract or 'Not specified' or 'No end date (indefinite)'",
    "compensation": "Total salary/fees/consideration mentioned",
    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
    "terminationClause": "Summary of how either party can terminate",
    "keyLoopholes": ["Loophole 1", "Loophole 2"]
  },
  "aiSummary": "A comprehensive 4-5 sentence summary combining: start date, end date, compensation, benefits offered, termination terms, and any major loopholes. Example: 'This contract is effective from [DATE] to [DATE] with an annual compensation of [AMOUNT] plus [BENEFITS]. Termination can occur with [NOTICE PERIOD]. However, significant loopholes include [LOOPHOLES].'",
  "overviewCategories": {
    "earlyTerminationClause": {
      "icon": "alert-triangle",
      "title": "Early Termination Clause",
      "description": "Details about early termination, notice periods, and conditions",
      "assessment": "Whether this is fair or problematic",
      "severity": "high|medium|low"
    },
    "fairCompetition": {
      "icon": "zap",
      "title": "Fair Competition & Non-Compete",
      "description": "Non-compete period, geographic scope, and reasonableness",
      "assessment": "Is it reasonable or too restrictive?",
      "severity": "high|medium|low"
    },
    "disputeResolution": {
      "icon": "message-square",
      "title": "Lack of Clear Dispute Resolution",
      "description": "Whether contract has dispute resolution mechanism",
      "assessment": "Mediation, arbitration, or litigation path",
      "severity": "high|medium|low"
    },
    "insuranceRequirements": {
      "icon": "shield",
      "title": "Insurance Requirements",
      "description": "Any insurance obligations or protections required",
      "assessment": "Are insurance requirements adequate?",
      "severity": "high|medium|low"
    }
  },
  "redFlags": [
    {
      "icon": "alert-triangle",
      "title": "Flag Title",
      "severity": "high",
      "description": "Specific problematic clause",
      "clause": "Clause reference number",
      "legalImplication": "How this violates SA law",
      "riskLevel": "Financial/Legal/Career"
    }
  ],
  "loopholesBreakdown": {
    "earlyTerminationClause": {
      "icon": "zap",
      "title": "Early Termination Loopholes",
      "issues": ["Issue 1", "Issue 2"],
      "exposure": "How this could disadvantage you",
      "severity": "high"
    },
    "insuranceRequirements": {
      "icon": "shield",
      "title": "Insurance Requirement Loopholes",
      "issues": ["Issue 1", "Issue 2"],
      "exposure": "How this could disadvantage you",
      "severity": "medium"
    }
  },
  "negotiationAdvice": {
    "fairCompensation": {
      "icon": "coins",
      "title": "Advice on Fair Compensation",
      "current": "What the contract currently states about compensation",
      "suggested": "What you should negotiate for based on market standards",
      "reasoning": "Why this adjustment is justified",
      "priority": "high"
    },
    "disputeResolution": {
      "icon": "message-square",
      "title": "Clear Dispute Resolution Advice",
      "current": "Current dispute resolution mechanism (or lack thereof)",
      "suggested": "Recommended dispute resolution path",
      "reasoning": "Why this protects you better",
      "priority": "high"
    }
  }
}

CONTRACT TEXT (first 40000 characters):
${text.substring(0, 40000)}

CRITICAL ANALYSIS REQUIREMENTS:
1. SCORE: Calculate 0-100 based on fairness. Factors: fair pay, reasonable termination, clear dispute resolution, balanced non-compete, insurance clarity. (High risk issues = lower score)
2. CONTRACT DETAILS: Extract EXACT dates, compensation amounts, and specific benefits listed
3. AI SUMMARY: Must be 4-5 sentences combining all critical details: dates, pay, benefits, termination, and loopholes
4. OVERVIEW CATEGORIES: Provide assessment for EACH of the 4 categories (termination, competition, dispute resolution, insurance)
5. RED FLAGS: List ALL problematic clauses with legal references and South African law implications
6. LOOPHOLES: Focus on early termination and insurance loopholes with specific exposure risks
7. NEGOTIATION: Give specific advice on compensation and dispute resolution based on SA law

Return ONLY valid JSON, no markdown, no code blocks, no extra text.
`;

  try {
    console.log("[DEBUG] Sending request to Groq AI");
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    let analysisText = completion.choices[0].message.content;
    console.log("[DEBUG] Raw AI response received, length:", analysisText.length);

    // Clean the response
    analysisText = analysisText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    
    const analysis = JSON.parse(analysisText);
    console.log("[DEBUG] Parsed analysis successfully");

    // Validate and ensure proper structure - return analysis as-is from Groq
    const validatedAnalysis = {
      score: typeof analysis.score === 'number' && analysis.score >= 0 && analysis.score <= 100 ? analysis.score : 50,
      aiSummary: typeof analysis.aiSummary === 'string' ? analysis.aiSummary : "Contract analysis completed.",
      contractDetails: analysis.contractDetails || {},
      overviewCategories: analysis.overviewCategories || {},
      redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags.filter(item => 
        item && typeof item === 'object' && item.title && item.description
      ) : [],
      loopholesBreakdown: analysis.loopholesBreakdown || {},
      negotiationAdvice: analysis.negotiationAdvice || {}
    };

    console.log("[DEBUG] Validated analysis items - RedFlags:", validatedAnalysis.redFlags.length, 
      "Overview Categories:", Object.keys(validatedAnalysis.overviewCategories).length);
    return validatedAnalysis;

  } catch (err) {
    console.error("[ERROR] AI analysis failed:", err.message);
    
    // Return a more helpful fallback analysis with new structure
    return {
      score: 55,
      aiSummary: "Contract analysis completed. Unable to use AI analysis due to service limitations. Please consult with a legal professional for detailed review.",
      contractDetails: {
        startDate: "Not specified",
        endDate: "Not specified",
        compensation: "Not specified",
        benefits: [],
        terminationClause: "See contract",
        keyLoopholes: []
      },
      overviewCategories: {
        earlyTerminationClause: {
          icon: "alert-triangle",
          title: "Early Termination Clause",
          description: "Unable to analyze",
          assessment: "Please review manually",
          severity: "medium"
        }
      },
      redFlags: [
        {
          icon: "alert-triangle",
          title: "Professional Review Recommended",
          description: "Contract needs professional legal review",
          legalImplication: "Complex clauses require expert interpretation",
          riskLevel: "Medium"
        }
      ],
      loopholesBreakdown: {},
      negotiationAdvice: {}
    };
  }
}

/* -------------------- UPLOAD + ANALYZE ROUTE -------------------- */
app.post("/api/analyze/upload", upload.single("file"), async (req, res) => {
  console.log("[INFO] /analyze/upload called", req.file?.originalname);

  try {
    if (!req.file) {
      console.error("[ERROR] No file uploaded");
      return res.status(400).json({ error: "No file uploaded." });
    }

    console.log("[DEBUG] File details:", {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    let extracted = "";
    const mimeType = req.file.mimetype;

    try {
      // Determine file type and extract text accordingly
      if (mimeType === "application/pdf") {
        extracted = await extractPDF(req.file.path);
      } else if (mimeType.includes("word") || mimeType.includes("document")) {
        extracted = await extractDOCX(req.file.path);
      } else if (mimeType.startsWith("image/")) {
        extracted = await extractImage(req.file.path);
      } else {
        // Attempt to read as text file
        console.log("[DEBUG] Attempting to read file as text");
        extracted = fs.readFileSync(req.file.path, "utf8");
      }
    } catch (extractError) {
      console.error("[ERROR] Text extraction failed:", extractError.message);
      
      // Clean up file
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn("[WARN] Failed to delete temp file:", cleanupError);
      }
      
      return res.status(400).json({ 
        error: extractError.message || "Failed to extract text from file. Please ensure the file is a valid PDF, DOCX, or image."
      });
    }

    console.log("[DEBUG] Extracted text length:", extracted.length);

    // Check if we got any text
    if (!extracted || !extracted.trim() || extracted.trim().length < 10) {
      console.error("[ERROR] Extracted text is empty or too short");
      
      // Clean up file
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn("[WARN] Failed to delete temp file:", cleanupError);
      }
      
      return res.status(400).json({ 
        error: "No readable text found in the file. Please ensure the file contains text and is not corrupted or image-based without OCR support." 
      });
    }

    // Analyze the extracted text
    console.log("[DEBUG] Starting contract analysis");
    const aiAnalysis = await analyzeContract(extracted, req.body.language || "en");
    
    // Clean up uploaded file (no longer needed)
    try {
      fs.unlinkSync(req.file.path);
      console.log("[DEBUG] Temporary file cleaned up");
    } catch (cleanupError) {
      console.warn("[WARN] Failed to delete temp file:", cleanupError);
    }

    // Store the analysis result
    const id = uuidv4();
    const record = { 
      id, 
      analysis: aiAnalysis, 
      createdAt: new Date(),
      fileName: req.file.originalname,
      textLength: extracted.length
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
      analysis: aiAnalysis,
      fileName: req.file.originalname
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