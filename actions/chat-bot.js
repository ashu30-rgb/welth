"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getChatHistory() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const chats = await db.chat.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return chats;
  } catch (error) {
    console.error(error.message);
    throw new Error("Error fetching chat history", error.message);
  }
}

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

    const history = await getChatHistory();

    const preprocessedHistory = history.map(chat => ({
        userMessage: chat.userMessage,
        botMessage: chat.botMessage
      }));

    const prompt = `
    You are a chatbot named Sara that only answers finance-related queries. Use the provided chat history for context. 

    - Refer to the history for past interactions when formulating your response. 
    - If the query is finance-related, generate a contextually relevant response using the history.
    - If the query is not finance-related, respond that this is not a finance-related question.
    - If the query is a greeting or asks for your name, greet the user gently and introduce yourself.
    - If there's no relevant data in the history for the query, handle it independently.

    Respond strictly in the following JSON format:
    {
        "response": string
    }

    Chat history for context:
    ${JSON.stringify(preprocessedHistory)}

    Query:
    ${query}
    `;

    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const parsedResponse = JSON.parse(cleanedText);

    await db.chat.create({
      data: {
        userMessage: query,
        botMessage: parsedResponse.response,
        userId: user.id,
      },
    });

    return parsedResponse;
  } catch (error) {
    console.error("Error generating response", error.message);
    throw new Error("Failed to generate response");
  }
}
