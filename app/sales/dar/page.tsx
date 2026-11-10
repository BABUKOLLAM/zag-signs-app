"use client";

import { useState, Suspense } from "react";
import { api } from "@/lib/api-client";
import { Loader2, Download, Send } from "lucide-react";
import { useToast } from "@/components/Toaster";
import DateRangeFilter, { useDateRangeQuery } from "@/components/DateRangeFilter";
import { formatRange, todayIst } from "@/lib/date-range";

const todayRange = () => ({ from: todayIst(), to: todayIst() });

function DARPageInner() {
  const toast = useToast();
  // Range defaults to today (India). A single day can be submitted as that day's DAR;
  // a longer range is a summary for review/download only.
  const dr = useDateRangeQuery({ defaultRange: todayRange });
  const range = dr.range ?? todayRange();
  const date = range.from;
  const singleDay = range.from === range.to;
  const [darData, setDarData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleGenerateDAR = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/sales/dar/generate`, { from: range.from, to: range.to });
      if ((res as any)?.data) {
        setDarData((res as any).data);
        setSubmitted(false);
      }
    } catch (error) {
      console.error("Error generating DAR:", error);
      toast.error("Failed to generate DAR");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDAR = async () => {
    if (!darData || !singleDay) return;

    setLoading(true);
    try {
      await api.post("/sales/dar/generate", {
        date,
      });
      setSubmitted(true);
      setTimeout(() => toast.success("DAR submitted successfully!"), 500);
    } catch (error) {
      console.error("Error submitting DAR:", error);
      toast.error("Failed to submit DAR");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDAR = () => {
    if (!darData) return;

    const content = `
DAILY ACTIVITY REPORT (DAR)
${formatRange(range)}

ACTIVITIES SUMMARY:
- Calls Made: ${darData.activities.calls}
- Customer Visits: ${darData.activities.visits}
- Follow-ups: ${darData.activities.followUps}
- Emails Sent: ${darData.activities.emails}

Total Time Spent: ${darData.totalTime} minutes

OUTCOMES:
- Orders Booked: ${darData.outcomes.ordersBooked}
- Meetings Scheduled: ${darData.outcomes.meetingsScheduled}
- Quotations Sent: ${darData.outcomes.quotationsSent}

HIGHLIGHTS:
${darData.activityDetails.map((a: any) => `- ${singleDay ? "" : a.day + " "}${a.time}: ${a.type} with ${a.customerOrLead} - ${a.outcome || a.purpose}`).join("\n")}

CHALLENGES/NOTES:
[Add any challenges faced or important notes]
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = singleDay ? `DAR_${date}.txt` : `DAR_${range.from}_to_${range.to}.txt`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Activity Report</h1>
          <p className="text-gray-600 mt-1">Auto-generate DAR from logged activities</p>
        </div>
      </div>

      {/* Date Picker */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-0">
            <label className="text-sm font-medium block mb-2">Date range</label>
            <DateRangeFilter
              value={range}
              onChange={(r) => { dr.setRange(r); setDarData(null); }}
              urlError={dr.urlError}
              basisLabel="Activity date"
              allowAll={false}
            />
          </div>
          <button
            onClick={handleGenerateDAR}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 inline animate-spin mr-2" /> : ""}
            Generate DAR
          </button>
        </div>
      </div>

      {/* DAR Preview */}
      {darData && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase">Calls Made</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{darData.activities.calls}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase">Visits</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{darData.activities.visits}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase">Follow-ups</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{darData.activities.followUps}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase">Total Time</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{darData.totalTime} min</p>
            </div>
          </div>

          {/* Outcomes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold mb-4">Outcomes & Achievements</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Orders Booked</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{darData.outcomes.ordersBooked}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Meetings Scheduled</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{darData.outcomes.meetingsScheduled}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Quotations Sent</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{darData.outcomes.quotationsSent}</p>
              </div>
            </div>
          </div>

          {/* Activity Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold mb-4">Activity Details</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {darData.activityDetails.length > 0 ? (
                darData.activityDetails.map((a: any, i: number) => (
                  <div key={i} className="p-3 border rounded hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{a.customerOrLead}</p>
                        <p className="text-xs text-gray-600">{!singleDay && a.day ? `${a.day} ` : ""}{a.time} • {a.type}</p>
                      </div>
                      <span className="text-xs font-semibold text-green-600">
                        {a.duration ? `${a.duration}m` : ""}
                      </span>
                    </div>
                    {(a.purpose || a.outcome) && (
                      <p className="text-sm text-gray-700 mt-1">
                        {a.purpose && <strong>Purpose:</strong>} {a.purpose}
                        {a.outcome && <><br /><strong>Outcome:</strong> {a.outcome}</>}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No activities logged for {singleDay ? "this date" : "this range"}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleDownloadDAR}
              className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download as Text
            </button>
            <button
              onClick={handleSubmitDAR}
              disabled={loading || submitted || !singleDay}
              title={singleDay ? undefined : "Pick a single day to submit it as that day's DAR"}
              className={`flex-1 px-4 py-3 rounded-lg text-white flex items-center justify-center gap-2 ${
                submitted
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              }`}
            >
              <Send className="w-4 h-4" />
              {submitted ? "✓ Submitted" : "Submit DAR"}
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900">
              ℹ️ DAR is auto-generated from your logged activities. Review the summary and submit to management.
              You can download it as a text file for record-keeping.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// useSearchParams (date range in the URL) needs a Suspense boundary.
export default function DARPage() {
  return (
    <Suspense fallback={null}>
      <DARPageInner />
    </Suspense>
  );
}
