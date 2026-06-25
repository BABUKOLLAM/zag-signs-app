"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Loader2, Plus, Download } from "lucide-react";

export default function ClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("my-claims");

  const [formData, setFormData] = useState({
    claimType: "TRAVEL",
    claimReason: "",
    amount: "",
    supportingDetails: "",
  });

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/sales/claims");
      if ((res as any)?.data) setClaims((res as any).data);
    } catch (error) {
      console.error("Error fetching claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.claimReason) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/sales/claims", {
        ...formData,
        amount: parseFloat(formData.amount),
        status: "SUBMITTED",
      });

      setFormData({
        claimType: "TRAVEL",
        claimReason: "",
        amount: "",
        supportingDetails: "",
      });
      setShowForm(false);
      await fetchClaims();
    } catch (error: any) {
      console.error("Error submitting claim:", error);
      alert(error.message || "Failed to submit claim");
    } finally {
      setLoading(false);
    }
  };

  // Get current window status
  const today = new Date();
  const dayOfMonth = today.getDate();
  const isWindowOpen = dayOfMonth <= 10;
  const daysLeft = Math.max(0, 11 - dayOfMonth);
  const nextWindowDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    MANAGER_REVIEW: "bg-amber-100 text-amber-700",
    MANAGER_APPROVED: "bg-indigo-100 text-indigo-700",
    AVP_REVIEW: "bg-orange-100 text-orange-700",
    AVP_APPROVED: "bg-purple-100 text-purple-700",
    MD_FINAL_REVIEW: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const claimTypeLabels: Record<string, string> = {
    INCENTIVE: "Sales Incentive",
    TRAVEL: "Travel Reimbursement",
    MEETING_EXPENSE: "Client Meeting Expense",
    CHARGEBACK: "Product Return/Chargeback",
  };

  const myClaims = claims.filter((c) => c.status !== "APPROVED" && c.status !== "REJECTED");
  const approvedClaims = claims.filter((c) => c.status === "APPROVED");
  const rejectedClaims = claims.filter((c) => c.status === "REJECTED");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Claims</h1>
          <p className="text-gray-600 mt-1">Submit travel, incentive & expense claims</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={!isWindowOpen}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isWindowOpen
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Plus className="w-4 h-4" />
          New Claim
        </button>
      </div>

      {/* Submission Window Alert */}
      <div className={`rounded-xl border p-4 ${
        isWindowOpen
          ? "bg-green-50 border-green-200"
          : "bg-orange-50 border-orange-200"
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`font-semibold ${isWindowOpen ? "text-green-900" : "text-orange-900"}`}>
              {isWindowOpen ? "✓ Claims Window Open" : "⏳ Claims Window Closed"}
            </p>
            <p className={`text-sm mt-1 ${isWindowOpen ? "text-green-700" : "text-orange-700"}`}>
              {isWindowOpen
                ? `Submit claims until the 10th. ${daysLeft} days remaining in this window.`
                : `Window closes on the 10th. Next window opens on ${nextWindowDate.toLocaleDateString()}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{daysLeft}</p>
            <p className="text-xs text-gray-600">days left</p>
          </div>
        </div>
      </div>

      {/* Claim Form */}
      {showForm && isWindowOpen && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold mb-4">Submit New Claim</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Claim Type</label>
              <select
                value={formData.claimType}
                onChange={(e) => setFormData({ ...formData, claimType: e.target.value })}
                className="w-full border rounded px-3 py-2 mt-1"
              >
                <option value="TRAVEL">Travel Reimbursement</option>
                <option value="INCENTIVE">Sales Incentive</option>
                <option value="MEETING_EXPENSE">Client Meeting Expense</option>
                <option value="CHARGEBACK">Product Return/Chargeback</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Claim Reason/Description</label>
              <input
                value={formData.claimReason}
                onChange={(e) => setFormData({ ...formData, claimReason: e.target.value })}
                placeholder="e.g., Fuel for customer visit, Hotel for trade show"
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Amount (₹)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
                className="w-full border rounded px-3 py-2 mt-1"
                min="0"
                step="100"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Supporting Details</label>
              <textarea
                value={formData.supportingDetails}
                onChange={(e) => setFormData({ ...formData, supportingDetails: e.target.value })}
                placeholder="Receipt details, dates, purpose, attendees, etc."
                className="w-full border rounded px-3 py-2 mt-1 h-24"
              />
              <p className="text-xs text-gray-500 mt-1">Note: Attach receipt photos in next step after submission</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 inline mr-2 animate-spin" /> : ""}Submit Claim
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("my-claims")}
          className={`px-4 py-2 font-medium ${activeTab === "my-claims" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >
          My Claims
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`px-4 py-2 font-medium ${activeTab === "approved" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >
          Approved ({approvedClaims.length})
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-4 py-2 font-medium ${activeTab === "rejected" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >
          Rejected ({rejectedClaims.length})
        </button>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "my-claims" && (
              <div className="space-y-3">
                {myClaims.length > 0 ? (
                  myClaims.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{claimTypeLabels[c.claimType]}</h3>
                          <p className="text-sm text-gray-600">{c.claimNo}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[c.status]}`}>
                          {c.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Reason</p>
                          <p className="font-medium text-sm">{c.claimReason}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Amount</p>
                          <p className="font-bold text-lg text-green-600">₹{c.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Submitted</p>
                          <p className="font-medium text-sm">{new Date(c.submittedDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {c.approvalHistory && c.approvalHistory.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded text-xs">
                          <p className="font-medium text-blue-900">Approval Status:</p>
                          {c.approvalHistory.map((h: any, i: number) => (
                            <p key={i} className="text-blue-700">
                              {h.approver.name} ({h.stage}) - {h.action.toLowerCase()} on{" "}
                              {new Date(h.createdAt).toLocaleDateString()}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No pending claims</p>
                )}
              </div>
            )}

            {activeTab === "approved" && (
              <div className="space-y-3">
                {approvedClaims.length > 0 ? (
                  approvedClaims.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl border border-green-200 shadow-sm p-4 bg-green-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-green-900">{claimTypeLabels[c.claimType]}</h3>
                          <p className="text-sm text-green-700">✓ Approved · {c.claimNo}</p>
                        </div>
                        <p className="font-bold text-2xl text-green-600">₹{c.approvedAmount || c.amount}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No approved claims yet</p>
                )}
              </div>
            )}

            {activeTab === "rejected" && (
              <div className="space-y-3">
                {rejectedClaims.length > 0 ? (
                  rejectedClaims.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl border border-red-200 shadow-sm p-4 bg-red-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-red-900">{claimTypeLabels[c.claimType]}</h3>
                          <p className="text-sm text-red-700">✗ Rejected · {c.claimNo}</p>
                        </div>
                        <p className="text-sm text-red-600 font-medium">Can Resubmit</p>
                      </div>
                      {c.rejectionReason && (
                        <p className="text-sm text-red-700"><strong>Reason:</strong> {c.rejectionReason}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No rejected claims</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
