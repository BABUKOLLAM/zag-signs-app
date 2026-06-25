"use client";
import { useState } from "react";
import { MessageCircle, Mail, X } from "lucide-react";

interface WhatsAppShareProps {
  documentType: "quotation" | "work-order" | "invoice" | "sales-order";
  documentNumber: string;
  customerName: string;
  customerPhone: string;
  documentDetails?: string;
}

export default function WhatsAppShare({
  documentType,
  documentNumber,
  customerName,
  customerPhone,
  documentDetails,
}: WhatsAppShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState(customerPhone.replace(/\D/g, ""));
  const [name, setName] = useState(customerName);
  const [message, setMessage] = useState("");

  // Generate personalized message based on document type
  const generateMessage = (editedName: string) => {
    const docTypeLabel = {
      quotation: "Quotation",
      "work-order": "Work Order Ticket",
      invoice: "Invoice",
      "sales-order": "Sales Order",
    }[documentType];

    return `Hi ${editedName},\n\nPlease find attached/below the ${docTypeLabel} ${documentNumber}.\n\n${documentDetails || ""}\n\nPlease review and let us know if you have any questions.\n\nThank you!`;
  };

  const handleOpenShare = () => {
    setMessage(generateMessage(name));
    setIsOpen(true);
  };

  const handleShare = () => {
    // Validate phone number (should be at least 10 digits)
    if (phone.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }

    // Format phone: remove non-digits, add country code if needed
    let formattedPhone = phone.replace(/\D/g, "");
    if (!formattedPhone.startsWith("91")) {
      // Assume India, add 91
      if (formattedPhone.length === 10) {
        formattedPhone = "91" + formattedPhone;
      }
    }

    // Create WhatsApp share URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    // Open in new window
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
  };

  return (
    <>
      {/* WhatsApp Button */}
      <button
        onClick={handleOpenShare}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        title="Share via WhatsApp"
      >
        <MessageCircle size={16} />
        WhatsApp
      </button>

      {/* Share Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <span className="font-semibold">Share via WhatsApp</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-green-500 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Document Info */}
              <div className="bg-green-50 p-3 rounded-lg text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold capitalize">{documentType}:</span> {documentNumber}
                </p>
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setMessage(generateMessage(e.target.value));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Customer name"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number</p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-sm text-sm"
                  placeholder="Message to send"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length} characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  Send on WhatsApp
                </button>
              </div>

              {/* Info */}
              <p className="text-xs text-gray-500 text-center pt-2">
                You'll be redirected to WhatsApp Web or mobile app to send the message
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
