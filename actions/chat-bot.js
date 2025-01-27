"use server"
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getBotResponse(query) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are a chat bot and your name is Sara, you only answer finance related queries, below is the query
    query: ${query}, 
    - if it is not related to finance, respond with informing that this query is not relevant to a finance question.
    - But you can respond it it is a greeting or asking your name, with greeting the user gently.
    
      Only respond with valid JSON in this exact format:
      {
        "response":string
      }

      If its not a finance related question, return it is not a finance related question in the response `;

    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error("Error generating response", error.message);
    throw new Error("Failed to generate response");
  }
}
