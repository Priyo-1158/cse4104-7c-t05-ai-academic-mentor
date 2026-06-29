const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { HfInference } = require('@huggingface/inference');


const aiGen = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const hf = new HfInference(process.env.HF_ACCESS_TOKEN || ""); 


async function processAIChat(userMessage, systemPrompt = "") {
  const fullPrompt = systemPrompt ? `${systemPrompt}\nUser: ${userMessage}` : userMessage;

  
  try {
    console.log("🤖 Attempting Primary Provider: Gemini AI...");
    const response = await aiGen.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: fullPrompt,
    });
    return { source: "Live Gemini AI API", text: response.text };
  } catch (geminiErr) {
    console.log("⚠️ Gemini Quota Exceeded! Switching to Free HuggingFace Model...");

    
    try {
      
      const hfResponse = await hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: fullPrompt,
        parameters: { max_new_tokens: 250, temperature: 0.7 }
      });
      
      return { 
        source: "HuggingFace Free API (Mistral-7B)", 
        text: hfResponse.generated_text || "AI generated response content." 
      };
    } catch (hfErr) {
      console.log("⚠️ HuggingFace Rate Limit or Network Error! Using Dynamic Local Fallback...");
    }

    
    let localResponse = "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects', which can contain data and code. It utilizes core principles like Inheritance, Encapsulation, Polymorphism, and Abstraction.";
    
    if (userMessage.toLowerCase().includes('quiz')) {
      localResponse = JSON.stringify({
        topic: "Database Management System",
        questions: [{ id: 1, question: "What stands for DBMS?", options: ["Database Management System", "Data Base Management Schema"], answer: "Database Management System" }]
      });
    } else if (userMessage.toLowerCase().includes('summarize')) {
      localResponse = "MongoDB Atlas is a fully-managed cloud database service that handles the complexity of deploying and managing database deployments.";
    } else if (userMessage.toLowerCase().includes('plan')) {
      localResponse = JSON.stringify({ week1: "Introduction to OS", week2: "Process Control", week3: "Memory Management" });
    }

    return { source: "Smart Fallback (Local Mock Mode)", text: localResponse };
  }
}

// ============ ROUTES IMPLEMENTATION ============

// 1. AI Chat Route
router.post('/chat', async (req, res) => {
  const userMessage = req.body.messages?.[0]?.content || "Explain OOP";
  const result = await processAIChat(userMessage);
  return res.status(200).json({ status: "success", source: result.source, message: result.text });
});

// 2. AI Quiz Route
router.post('/quiz', async (req, res) => {
  const topic = req.body.topic || "Database Management System";
  const result = await processAIChat(`Create a short quiz on ${topic}. Return ONLY raw text description.`, "Act as a quiz generator.");
  return res.status(200).json({ status: "success", source: result.source, quizData: result.text });
});

// 3. AI Summary Route
router.post('/summarize', async (req, res) => {
  const text = req.body.text || "MongoDB Atlas cloud database.";
  const result = await processAIChat(`Summarize this text: ${text}`);
  return res.status(200).json({ status: "success", source: result.source, summary: result.text });
});

// 4. AI Study Plan Route
router.post('/plan', async (req, res) => {
  const subject = req.body.subject || "Operating System";
  const result = await processAIChat(`Create a 3-week study plan for ${subject}`);
  return res.status(200).json({ status: "success", source: result.source, studyPlan: result.text });
});

module.exports = router;
