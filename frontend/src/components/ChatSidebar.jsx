import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  PlusIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onUpdateTitle,
  onDeleteSession,
  isLoading,
}) {
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (session) => {
    setEditingSessionId(session.session_id);
    setEditTitle(session.title);
  };

  const cancelEditing = () => {
    setEditingSessionId(null);
    setEditTitle("");
  };

  const saveTitle = async (sessionId) => {
    if (editTitle.trim()) {
      await onUpdateTitle(sessionId, editTitle.trim());
    }
    cancelEditing();
  };

  const handleKeyPress = (e, sessionId) => {
    if (e.key === "Enter") {
      saveTitle(sessionId);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    // Example: Sep 13, 2025, 14:32
    return messageDate.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="w-80 h-screen bg-white flex flex-col fixed left-0 top-0 z-10 shadow-xl"
      style={{ fontFamily: "Segoe UI, Arial, sans-serif", borderRight: "none" }}
    >
      {/* Header */}
      <div className="p-4 border-b-2 border-[#E2001A]/20 bg-[#E2001A]/5">
        <Button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-[#E2001A] text-white font-semibold rounded-lg shadow hover:bg-[#E2001A]/90 transition-all duration-200"
          disabled={isLoading}
        >
          <PlusIcon className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-pulse">Loading chats...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No chats yet</p>
            <p className="text-sm">Start a new conversation!</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {sessions.map((session) => (
              <Card
                key={session.session_id}
                className={`group p-4 cursor-pointer rounded-xl shadow-md transition-all duration-200 bg-gradient-to-r from-white via-[#E2001A]/5 to-white hover:from-[#E2001A]/10 hover:to-white ${
                  currentSessionId === session.session_id
                    ? "bg-[#E2001A]/10 shadow-lg"
                    : ""
                }`}
                style={{ border: "none" }}
                onClick={() => onSessionSelect(session.session_id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingSessionId === session.session_id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) =>
                            handleKeyPress(e, session.session_id)
                          }
                          className="h-7 text-base font-medium rounded-md border-[#E2001A]/30 focus:border-[#E2001A]"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-[#E2001A] hover:bg-[#E2001A]/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveTitle(session.session_id);
                          }}
                        >
                          <CheckIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-gray-500 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditing();
                          }}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-bold text-base truncate text-[#E2001A] group-hover:text-[#E2001A]/80 transition-all duration-200">
                          {session.title}
                        </h3>
                        <div className="mt-1">
                          <span className="text-xs text-gray-600 font-semibold tracking-wide block">
                            {formatDate(session.updated_at)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {editingSessionId !== session.session_id && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-[#E2001A]"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(session);
                          }}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "Are you sure you want to delete this chat?"
                              )
                            ) {
                              onDeleteSession(session.session_id);
                            }
                          }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
