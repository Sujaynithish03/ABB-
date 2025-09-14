import { useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { AccuracyFeedback } from "./AccuracyFeedback";

export function ResponseRenderer({
  message,
  timestamp,
  userMessage,
  onSaveToLibrary,
  onMarkInaccurate,
  isSaved = false,
}) {
  const [copiedStates, setCopiedStates] = useState({});

  // Handle different content types
  let structuredResponse = null;
  let displayContent = message.content;

  // New: if content is already an array from backend, wrap as structured responses
  if (Array.isArray(message.content)) {
    structuredResponse = { responses: message.content };
    displayContent = null;
  } else if (message.content && typeof message.content === "object") {
    if (message.content.responses && Array.isArray(message.content.responses)) {
      // It's already a structured response object
      structuredResponse = message.content;
      displayContent = null;
    } else if (message.content.type && message.content.content) {
      // It's a single response object, wrap it in the expected format
      structuredResponse = { responses: [message.content] };
      displayContent = null;
    }
  } else if (typeof message.content === "string") {
    // Try to parse as JSON
    let cleanContent = message.content.trim();

    // Remove markdown code blocks if present
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.substring(7);
    }
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.substring(3);
    }
    if (cleanContent.endsWith("```")) {
      cleanContent = cleanContent.substring(0, cleanContent.length - 3);
    }

    cleanContent = cleanContent.trim();

    try {
      const parsed = JSON.parse(cleanContent);

      // Response should be an array due to response schema
      if (Array.isArray(parsed)) {
        const validResponses = parsed.every(
          (item) =>
            item && typeof item === "object" && item.type && item.content
        );

        if (validResponses) {
          structuredResponse = { responses: parsed };
          displayContent = null;
        }
      }
    } catch (e) {
      // Not JSON, use as plain text
      displayContent = cleanContent;
    }
  }

  const copyToClipboard = async (content, id) => {
    try {
      const text =
        typeof content === "string"
          ? content
          : JSON.stringify(content, null, 2);
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const getLanguageFromType = (type) => {
    switch (type) {
      case "ladder":
        return "text"; // Monaco doesn't have native ladder support, use text
      case "plc-code":
        return "text"; // You can change this to 'iecst' if you have IEC structured text support
      default:
        return "text";
    }
  };

  const getTitle = (type) => {
    switch (type) {
      case "ladder":
        return "Ladder Diagram";
      case "plc-code":
        return "PLC Code";
      case "text":
      default:
        return "Response";
    }
  };

  const renderValidation = (validation) => {
    if (!validation) return null;
    const statusColor =
      validation.status === "valid"
        ? "text-green-700 bg-green-50 border-green-200"
        : validation.status === "invalid"
        ? "text-red-700 bg-red-50 border-red-200"
        : "text-amber-700 bg-amber-50 border-amber-200";

    return (
      <div className={`mt-2 rounded-lg border ${statusColor} p-3`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Validation</span>
          <span className="text-xs">
            {validation.executable ? "Executable" : "Not Executable"}
          </span>
        </div>
        {validation.reason && (
          <p className="text-sm mt-1 whitespace-pre-wrap">
            {validation.reason}
          </p>
        )}
        {Array.isArray(validation.warnings) &&
          validation.warnings.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-xs space-y-1">
              {validation.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
      </div>
    );
  };

  if (structuredResponse) {
    // All responses are now arrays, so always handle as multiple responses
    if (
      structuredResponse.responses &&
      Array.isArray(structuredResponse.responses)
    ) {
      return (
        <div className="w-full max-w-none space-y-3">
          {structuredResponse.responses.map((response, index) => {
            const copyId = `${message.role}-${timestamp}-${response.type}-${index}`;
            const fadeClass =
              "transition-all duration-700 ease-in-out opacity-100 translate-y-0";

            if (
              response.type === "plc-code" ||
              response.type === "ladder" ||
              response.type === "code" ||
              response.type === "structured-text"
            ) {
              // Code block in luxury card (no border)
              const handleDownload = () => {
                const code =
                  typeof response.content === "string"
                    ? response.content.replace(/\\n/g, "\n")
                    : response.content;
                const blob = new Blob([code], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `plc-code-${timestamp || Date.now()}.st`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              };
              return (
                <div key={index} className="flex flex-col gap-2">
                  <Card
                    className={`w-full max-w-none p-0 overflow-hidden rounded-xl shadow-xl ${fadeClass}`}
                    style={{
                      fontFamily: "Segoe UI, Arial, sans-serif",
                      border: "none",
                    }}
                  >
                    <div
                      className="flex items-center justify-between px-6 py-3 bg-[#E2001A]/10 rounded-t-xl"
                      style={{ borderBottom: "none" }}
                    >
                      <span className="text-sm font-semibold text-[#E2001A]">
                        {getTitle(response.type)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-[#E2001A] hover:bg-[#E2001A]/10"
                          onClick={() =>
                            copyToClipboard(response.content, copyId)
                          }
                        >
                          {copiedStates[copyId] ? (
                            <CheckIcon className="w-3 h-3 text-green-600" />
                          ) : (
                            <ClipboardIcon className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-[#E2001A] hover:bg-[#E2001A]/10"
                          onClick={handleDownload}
                          aria-label="Download code as .st"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 16v-8m0 8l-4-4m4 4l4-4M4 20h16"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>
                    <div
                      className="w-full min-w-0"
                      style={{
                        background: "white",
                        borderRadius: "0 0 1rem 1rem",
                        border: "none",
                      }}
                    >
                      <Editor
                        height="220px"
                        defaultLanguage={getLanguageFromType(response.type)}
                        value={
                          typeof response.content === "string"
                            ? response.content.replace(/\\n/g, "\n")
                            : response.content
                        }
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                          fontSize: 15,
                          fontFamily: "Consolas, Segoe UI, Arial, monospace",
                          theme: "vs-light",
                          selectOnLineNumbers: true,
                          automaticLayout: true,
                          scrollbar: {
                            horizontal: "hidden",
                            vertical: "hidden",
                          },
                          overviewRulerLanes: 0,
                          hideCursorInOverviewRuler: true,
                          overviewRulerBorder: false,
                        }}
                      />
                    </div>
                    <div className="px-6 pb-4" style={{ border: "none" }}>
                      {renderValidation(response.validation)}
                    </div>
                  </Card>
                  {/* Explanation below code block if present */}
                  {response.explanation && (
                    <div className="mt-2 text-base text-gray-800 font-normal px-2">
                      {response.explanation}
                    </div>
                  )}
                </div>
              );
            } else {
              // Normal text/explanation
              return (
                <div
                  key={index}
                  className="mt-2 text-base text-gray-800 font-normal px-2"
                  style={{ border: "none" }}
                >
                  {typeof response.content === "string"
                    ? response.content.replace(/\\n/g, "\n")
                    : response.content}
                </div>
              );
            }
          })}
          {timestamp && (
            <div
              className="text-xs text-[#E2001A] text-right"
              style={{ border: "none" }}
            >
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
          {userMessage && onSaveToLibrary && (
            <div style={{ border: "none" }}>
              <AccuracyFeedback
                userMessage={userMessage}
                assistantMessage={message}
                onSaveToLibrary={onSaveToLibrary}
                onMarkInaccurate={onMarkInaccurate}
                isSaved={isSaved}
              />
            </div>
          )}
        </div>
      );
    }

    // All responses should be arrays now due to response schema
    // If we reach here, there's an unexpected format - fall back to plain text
  }

  // Fallback for non-structured responses
  const copyId = `${message.role}-${timestamp}-fallback`;
  // Ensure displayContent is string to avoid React errors
  const safeDisplay =
    typeof displayContent === "string"
      ? displayContent
      : JSON.stringify(displayContent, null, 2);
  return (
    <div className="bg-white text-gray-900 border rounded-bl-none rounded-2xl px-4 py-3 shadow max-w-[85%]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Response</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => copyToClipboard(safeDisplay, copyId)}
        >
          {copiedStates[copyId] ? (
            <CheckIcon className="w-3 h-3 text-green-600" />
          ) : (
            <ClipboardIcon className="w-3 h-3" />
          )}
        </Button>
      </div>
      <p className="whitespace-pre-wrap leading-relaxed">
        {typeof safeDisplay === "string"
          ? safeDisplay.replace(/\\n/g, "\n")
          : safeDisplay}
      </p>
      {timestamp && (
        <div className="text-xs mt-1 text-gray-500">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
      {userMessage && onSaveToLibrary && (
        <AccuracyFeedback
          userMessage={userMessage}
          assistantMessage={message}
          onSaveToLibrary={onSaveToLibrary}
          onMarkInaccurate={onMarkInaccurate}
          isSaved={isSaved}
        />
      )}
    </div>
  );
}
