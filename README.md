# 🛡️ ContractShield AI – Revolutionary Legal Assistant

**Tagline:** *“Democratizing Legal Power – Understand, Defend, and Negotiate Any Contract Without a Lawyer.”*

ContractShield AI is a mobile-first legal tech application designed to empower South Africans by providing AI-powered contract analysis, red flag detection, loophole identification, and negotiation support. The platform works offline, supports multiple local languages, and provides a trustworthy, professional user experience.

---

## 🌟 Features

### Core Functionality

* **Contract Upload:** Drag-and-drop, camera scan, or file upload.
* **AI Contract Analysis:** Detects illegal, unfair, or exploitative clauses.
* **Plain Language Explanation:** Simplifies complex legal terms in English, isiZulu, Afrikaans, and Xhosa.
* **Loophole Finder:** Identifies contradictions, unenforceable clauses, and exit strategies.
* **Negotiation Tools:** Generates counter-offers, WhatsApp/email scripts, and suggested amendments.
* **User Profile:** Subscription management, contract history, and multi-language settings.
* **Dashboard:** Tracks all contract analyses, statuses, and notifications.

### Design & UX

* Professional and trustworthy color palette:

  * Primary Blue: `#1E40AF`
  * Secondary Green: `#059669`
  * Warning Red: `#DC2626`
  * Neutral Grays for readability
* Inter font family for clean, legible text
* Card-based layout with rounded corners and subtle shadows
* Mobile-first responsive design
* Smooth micro-interactions, hover states, and visual feedback
* Accessibility-focused design with proper contrast ratios

---

## 🛠️ Tech Stack

**Frontend:**

* React Native + Expo
* React Navigation (Tabs)
* @expo-google-fonts/inter
* @expo/vector-icons
* react-native-reanimated, react-native-gesture-handler

**Backend (Pluggable/MVP):**

* AI-powered contract analysis (GPT-4 fine-tuned for SA law)
* OCR: Tesseract + PyMuPDF
* Voice narration with Whisper
* Multi-language NLP for English, isiZulu, Afrikaans, Xhosa

**Database / State Management:**

* PostgreSQL / Supabase for contract storage and user management
* React Context for global state management

---

## 📂 Project Structure

```
contractshield-ai/
│── app/
│   ├── (tabs)/index.tsx        # Dashboard / Home
│   ├── (tabs)/upload.tsx       # Contract upload screen
│   ├── (tabs)/analysis.tsx     # Analysis results screen
│   ├── (tabs)/profile.tsx      # User profile & subscription
│
│── components/
│   ├── ContractUpload.tsx      # Upload form & camera integration
│   ├── AnalysisResults.tsx     # AI results, red flags, loopholes
│
│── lib/                        # API services & utilities
│── hooks/                       # Custom React hooks
│── types/                       # TypeScript types
│── App.tsx
│── package.json
│── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nkululeko111/contractshield-ai.git
cd contractshield-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the app

```bash
npm run dev
```

Open on your device using **Expo Go** or an emulator.

---

## 🔑 Authentication & User Flow

1. **Sign Up / Login** – Users create an account or sign in securely.
2. **Upload Contract** – Users upload or scan a contract for analysis.
3. **AI Analysis** – System scans for red flags, illegal clauses, and loopholes.
4. **Plain Language Explanation** – Legal terms simplified in user’s preferred language.
5. **Negotiation Tools** – Counter-offers and amendment suggestions generated automatically.
6. **Track History** – Users can view past contract analyses, subscription plan, and notifications.

---

## 💼 Revenue Model (MVP-Ready)

| Plan       | Features                                                | Price      |
| ---------- | ------------------------------------------------------- | ---------- |
| Free       | 1 contract/month, basic analysis                        | R0         |
| Basic      | 5 contracts/month, red flag detection                   | R49/month  |
| Pro        | Unlimited contracts, loophole finder, negotiation tools | R199/month |
| Enterprise | API access, bulk uploads, team dashboard                | Custom     |

Additional streams:

* Affiliate network with vetted lawyers (R500/hour consultations)
* White-label versions for unions, NGOs, or HR departments

---

## 📈 Future Enhancements

* **USSD / WhatsApp integration** for rural users
* **Blockchain timestamping** for proof of review
* **Crowdsourced clause database** to train AI on real-world contracts
* **AI + human hybrid service** for complex contract issues

---

## 📜 License

MIT License © 2025 ContractShield AI

---

This README positions **ContractShield AI** as a professional, investor-ready MVP app while highlighting its **AI-driven legal assistance, multi-language support, and mobile-first accessibility**.

---


