"use client";
import TopBar from "@/components/TopBar";
import { Wrench } from "lucide-react";

const stages = ["Sales Order Confirmed", "Production Work Order Created", "Fabrication Started", "Quality Check", "Dispatch Ready", "Installation Work Order", "Site Completion Certificate", "Invoice Raised"];

export default function WorkOrdersPage() {
  return (
    <div>
      <TopBar title="Work Orders" />
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench size={28} className="text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Work Order Management</h2>
          <p className="text-gray-500 text-sm mb-6">Phase 2 Module — Automated workflow from Sales Order to Installation</p>
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col gap-2">
              {stages.map((stage, i) => (
                <div key={stage} className="flex items-center gap-3 text-left bg-gray-50 rounded-lg px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                  <span className="text-sm text-gray-700 font-medium">{stage}</span>
                  {i < stages.length - 1 && <div className="ml-auto text-gray-300">→</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
