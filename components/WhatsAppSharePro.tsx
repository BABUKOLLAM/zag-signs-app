"use client";
import { useState } from "react";
import { MessageCircle, Mail, X, FileText, Send, AlertCircle, CheckCircle } from "lucide-react";

interface WhatsAppShareProProps {
  documentType: "quotation" | "work-order" | "invoice" | "sales-order";
  documentNumber: string;
  customerName: string;
  customerPhone: string;
  documentDetails?: string;
  pdfUrl?: string;
}

export default function WhatsAppSharePro({
  documentType,
  documentNumber,
  customerName,
  customerPhone,
  documentDetails,
  pdfUrl,
}: WhatsAppShareProProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState(customerPhone.replace(/\D/g, ""));
  const [name, setName] = useState(customerName);
  const [message, setMessage] = useState("");
  const [sendingType, setSendingType] = useState<"text" | "document">("text");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const generateMessage = (editedName: string) => {
    const docTypeLabel = {
      quotation: "Quotation",
      "work-order": "Work Order Ticket",
      invoice: "Invoice",
      "sales-order": "Sales Order",
    }[documentType];

    return `Hi ${editedName},\n\nPlease find the ${docTypeLabel} ${documentNumber}.\n\n${documentDetails || ""}\n\nPlease review and let us know if you have any questions.\n\nThank you!`;
  };

  const handleOpenShare = () => {
    setMessage(generateMessage(name));
    setStatus(null);
    setErrorMsg("");
    setIsOpen(true);
  };

  const handleSend = async () => {
    if (phone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit phone number");
      setStatus("error");
      return;
    }

    setSending(true);
    setErrorMsg("");

    try {
      let formattedPhone = phone.replace(/\D/g, "");
      if (formattedPhone.length === 10) {
        formattedPhone = "91" + formattedPhone;
      }

      const payload = {
        type: sendingType,
        to: formattedPhone,
        message: message,
        documentUrl: pdfUrl && sendingType === "document" ? pdfUrl : undefined,
        filename: sendingType === "document" ? `${documentNumber}.pdf` : undefined,
        documentType,
        documentId: documentNumber,
      };

      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      setStatus("sent");
      setTimeout(() => setIsOpen(false), 2000);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Failed to send message");
      setStatus("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenShare}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        title="Share via WhatsApp"
      >
        <MessageCircle size={16} />
        WhatsApp
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <span className="font-semibold">Share via WhatsApp</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-green-500 p-1 rounded">
                <X size={20} />
              </button>
            </div>

            {/* Status Messages */}
            {status === "sent" && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600" />
                <span className="text-green-800 font-medium">Message sent successfully!</span>
              </div>
            )}

            {status === "error" && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-600" />
                <span className="text-red-800 font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Document Info */}
              <div className="bg-green-50 p-3 rounded-lg text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold capitalize">{documentType}:</span> {documentNumber}
                </p>
              </div>

              {/* Message Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Send As</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSendingType("text")}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 font-medium transition ${
                      sendingType === "text"
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <MessageCircle size={16} className="inline mr-1" />
                    Text
                  </button>
                  {pdfUrl && (
                    <button
                      onClick={() => setSendingType("document")}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 font-medium transition ${
                        sendingType === "document"
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-300 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      <FileText size={16} className="inline mr-1" />
                      PDF
                    </button>
                  )}
                </div>
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setMessage(generateMessage(e.target.value));
                  }}
                  disabled={sending}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    disabled={sending}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    placeholder="10-digit number"
                    maxLength="10"
                  />
                </div>
              </div>

              {/* Message */}
              {sendingType === "text" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={sending}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">{message.length} characters</p>
                </div>
              )}

              {/* Info Box */}
              {sendingType === "document" && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                  <p className="font-semibold mb-1">📎 PDF will be sent with message</p>
                  <p>The {documentNumber}.pdf file will be attached to the message above.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={16} />
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-500 text-center pt-2">Requires WhatsApp Business API to be configured</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
