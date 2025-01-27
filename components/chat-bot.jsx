"use client";
import { BotMessageSquare, SendHorizontal, X } from "lucide-react";
import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { getBotResponse } from "@/actions/chat-bot";

const ChatBot = () => {
  const [chatVisible, setChatVisible] = useState(false);
  const [chats, setChats] = useState([]);
  const [query, setQuery] = useState("");

  const callChatBot = async () => {
    const userMessage = query;

    setChats((prevChats) => [...prevChats, { user: userMessage, bot: "" }]);
    setQuery("");

    const botResponse = await getBotResponse(userMessage);

    setChats((prevChats) => {
      const updatedChats = [...prevChats]; // Create a shallow copy of the chats array
      updatedChats[updatedChats.length - 1].bot = botResponse.response; // Update the last chat object
      return updatedChats; // Return the updated array
    });
  };

  const formatBotResponse = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\*)/);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-bold">
            {part.replace(/\*\*/g, "")}
          </strong>
        );
      } else if (part === "*") {
        return <br key={index} />;
      }
      return part;
    });
  };

  return (
    <div className="bottom-5 right-5 fixed ">
      {chatVisible ? (
        <div className="bg-gray-100 h-[480px] w-96">
          <div className="bg-white shadow-lg rounded-lg w-full max-w-md flex flex-col h-full">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold p-3 rounded-t-lg flex justify-between">
              Chatbot
              <X
                className="cursor-pointer"
                onClick={() => setChatVisible(false)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chats?.length > 0 ? (
                chats.map((chat, index) => {
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-end">
                        <div className="bg-blue-500 text-white p-2 rounded-lg max-w-64 shadow text-sm">
                          {chat.user}
                        </div>
                      </div>

                      <div className="flex justify-start">
                        <div className="bg-gray-200 p-2 rounded-lg max-w-64 shadow text-sm">
                          {formatBotResponse(chat.bot)}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <svg
                    fill="#808080"
                    width="100px"
                    height="100px"
                    viewBox="0 0 32 32"
                    id="icon"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M16,19a6.9908,6.9908,0,0,1-5.833-3.1287l1.666-1.1074a5.0007,5.0007,0,0,0,8.334,0l1.666,1.1074A6.9908,6.9908,0,0,1,16,19Z" />
                    <path d="M20,8a2,2,0,1,0,2,2A1.9806,1.9806,0,0,0,20,8Z" />
                    <path d="M12,8a2,2,0,1,0,2,2A1.9806,1.9806,0,0,0,12,8Z" />
                    <path d="M17.7358,30,16,29l4-7h6a1.9966,1.9966,0,0,0,2-2V6a1.9966,1.9966,0,0,0-2-2H6A1.9966,1.9966,0,0,0,4,6V20a1.9966,1.9966,0,0,0,2,2h9v2H6a3.9993,3.9993,0,0,1-4-4V6A3.9988,3.9988,0,0,1,6,2H26a3.9988,3.9988,0,0,1,4,4V20a3.9993,3.9993,0,0,1-4,4H21.1646Z" />
                  </svg>
                  <div className="text-muted-foreground text-2xl font-semibold">
                    Ask Sara!!
                  </div>
                  <span className="text-muted-foreground">
                    You Finance AI chat bot
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-300">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={callChatBot}
                >
                  <SendHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div
                className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-full cursor-pointer"
                onClick={() => setChatVisible(true)}
              >
                <BotMessageSquare stroke="#FFFFFF" className="w-9 h-9" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Ask Sara</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default ChatBot;
