import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  XMarkIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

export function AccuracyFeedback({
  userMessage,
  assistantMessage,
  onSaveToLibrary,
  onMarkInaccurate,
  isLoading = false,
  isSaved = false,
}) {
  const [feedback, setFeedback] = useState(null); // null, 'accurate', 'inaccurate'
  // Animation state for fade-in
  const [show, setShow] = useState(false);
  React.useEffect(() => {
    setShow(true);
  }, []);

  const handleAccurate = async () => {
    setFeedback("accurate");
    try {
      await onSaveToLibrary(userMessage, assistantMessage);
    } catch (error) {
      console.error("Error saving to library:", error);
      setFeedback(null); // Reset on error
    }
  };

  const handleInaccurate = () => {
    setFeedback("inaccurate");
    onMarkInaccurate?.(userMessage, assistantMessage);
  };

  // If already saved, show saved status but don't show feedback buttons
  if (isSaved) {
    return (
      <div
        className={`mt-3 p-3 bg-white border-2 border-[#E2001A] rounded-xl shadow-lg transition-all duration-500 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex items-center gap-2 text-[#E2001A]">
          <BookmarkIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">Saved to Library</span>
        </div>
      </div>
    );
  }

  if (feedback === "accurate") {
    return (
      <div
        className={`mt-3 p-3 bg-white border-2 border-[#E2001A] rounded-xl shadow-lg transition-all duration-500 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex items-center gap-2 text-[#E2001A]">
          <CheckIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {isLoading
              ? "Saving to library..."
              : "Saved to library successfully!"}
          </span>
        </div>
      </div>
    );
  }

  if (feedback === "inaccurate") {
    return (
      <div
        className={`mt-3 p-3 bg-[#E2001A]/10 border-2 border-[#E2001A] rounded-xl shadow-lg transition-all duration-500 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex items-center gap-2 text-[#E2001A]">
          <XMarkIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">
            Thank you for the feedback!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mt-3 p-3 bg-white border-2 rounded-xl shadow-lg transition-all duration-500 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex flex-col gap-2">
        <p className="text-base font-medium text-[#E2001A]">
          Was this information accurate and helpful?
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAccurate}
            disabled={isLoading}
            className="flex items-center gap-1 border-[#6bf070] text-[#0c4d19] hover:bg-[#E2001A]/10 font-semibold"
          >
            <CheckIcon className="w-3 h-3" />
            Yes, save to library
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleInaccurate}
            disabled={isLoading}
            className="flex items-center gap-1 border-[#E2001A] text-[#E2001A] hover:bg-[#E2001A]/10 font-semibold"
          >
            <XMarkIcon className="w-3 h-3" />
            No, inaccurate
          </Button>
        </div>
      </div>
    </div>
  );
}
