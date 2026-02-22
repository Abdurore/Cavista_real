# 🩺 PreventAI  
### AI Health Partner for Adults & Pregnant Women  
Built during Cavista Hackathon 2026

PreventAI is a real-time AI-powered preventive health assistant that analyzes lifestyle and pregnancy health data to detect risks early and provide personalized prevention advice.

> Our mission: Shift healthcare from reactive treatment to proactive prevention.

---

## 🚨 Problem

- Rising lifestyle-related diseases due to unhealthy habits  
- Pregnant women require continuous monitoring to reduce maternal risks  
- Preventive health tools are often inaccessible or not personalized  
- Users lack instant feedback on daily health decisions  

Healthcare today is mostly reactive — PreventAI makes it proactive.

---

## 💡 Solution

PreventAI evaluates user health inputs and instantly returns:

- Risk score (0–100)  
- Risk level (Low / Moderate / High)  
- Detected health risks  
- Personalized prevention advice  
- Improvement simulation (adjust inputs → see better score)  

---

## ⚙️ How It Works

1. User selects profile (Adult / Pregnant Woman)  
2. User submits health data via React form  
3. Data is sent to FastAPI backend /analyze  
4. Rule-based AI engine calculates risk score  
5. Frontend visualizes results using color-coded indicators  

---

## ✨ Key Features

- Dual-profile health analysis  
- AI-powered rule-based scoring  
- Dynamic risk meter (Green / Yellow / Red)  
- Risk detection cards  
- Personalized advice cards  
- Improvement simulation  
- Fully responsive design  

---

## 🧠 Tech Stack

### Frontend
- React  
- Responsive UI  

### Backend
- FastAPI (Python)  
- RESTful API architecture  
- Rule-based AI scoring engine  

### Deployment
- Vercel (Frontend)  
- Cloud-hosted backend  

---

## 🔌 API Example

### POST /analyze

*Request*
json
{
  "profile": "adult",
  "age": 45,
  "sleep": 4,
  "exercise": 0,
  "stress": 8
}


*Response*
json
{
  "risk_score": 78,
  "risk_level": "High",
  "detected_risks": ["Hypertension Risk"],
  "advice": ["Increase physical activity"]
}


---

## 🔐 Responsible AI Use

- No real patient data stored  
- No personally identifiable information collected  
- AI tools were used for brainstorming and development support  
- All implementation was completed during the hackathon period  

---

## 💼 Business Potential

PreventAI can serve:

- Individual users  
- Telehealth platforms  
- Clinics and maternity centers  
- Corporate wellness programs  

Monetization pathways:

- Freemium subscription model  
- API licensing for health platforms  
- Institutional partnerships  

---

## 👥 Team

### FOR_GERS

- Oreagba Abdulhameed  
- Orelesi Alamin  
- Alimi Quadri  

---

## 🔗 Links

*GitHub Repository:*  
https://github.com/Abdurore/Cavista_real.git  

*Live Demo:*  
https://cavista-real-w2eb.vercel.app/
