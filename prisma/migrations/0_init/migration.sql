-- CreateEnum
CREATE TYPE "Branch" AS ENUM ('TVM', 'KTYM', 'EKM', 'CLT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MD', 'AVP', 'BUSINESS_MANAGER', 'SALES_EXECUTIVE', 'CRES', 'PRODUCTION', 'DESIGNER', 'ACCOUNTS', 'HR', 'IT_ADMIN', 'CONSULTANT');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('COLD_CALL', 'REFERRAL', 'WALK_IN', 'WEBSITE', 'SOCIAL_MEDIA', 'EXHIBITION', 'OTHER');

-- CreateEnum
CREATE TYPE "OpportunityStage" AS ENUM ('QUALIFICATION', 'PROPOSAL_SENT', 'NEGOTIATION', 'VERBAL_COMMITMENT', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SENT', 'EMAIL', 'WHATSAPP', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'INSTALLED', 'INVOICED', 'COLLECTED');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ComplaintPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('SUBMITTED', 'MANAGER_APPROVED', 'AVP_APPROVED', 'MD_APPROVED');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('SALES_CALL', 'SITE_SURVEY', 'INSTALLATION', 'SERVICE_COMPLAINT', 'COLLECTION', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "VisitOutcome" AS ENUM ('POSITIVE', 'ORDER_EXPECTED', 'FOLLOW_UP_NEEDED', 'NOT_INTERESTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'CHEQUE', 'NEFT', 'UPI', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WOTicketSource" AS ENUM ('WALK_IN', 'PHONE', 'WHATSAPP', 'EMAIL', 'QUOTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "WOTicketStatus" AS ENUM ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'HALF_DONE', 'DONE', 'BILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WOTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "branch" "Branch",
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvalToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "reportingToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modules" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "leadNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "branch" "Branch" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "LeadSource" NOT NULL DEFAULT 'OTHER',
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "followUpDate" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedToId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "customerNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "branch" "Branch" NOT NULL,
    "gstNo" TEXT,
    "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outstandingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "stage" "OpportunityStage" NOT NULL DEFAULT 'QUALIFICATION',
    "probability" INTEGER NOT NULL DEFAULT 20,
    "value" DOUBLE PRECISION NOT NULL,
    "branch" "Branch" NOT NULL,
    "expectedClose" TIMESTAMP(3),
    "notes" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadId" TEXT,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "quotationNo" TEXT NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "validUntil" TIMESTAMP(3),
    "terms" TEXT,
    "notes" TEXT,
    "salutation" TEXT,
    "attentionSalutation" TEXT,
    "attentionName" TEXT,
    "branch" TEXT,
    "proposedById" TEXT,
    "clientCode" TEXT,
    "parentQuotationId" TEXT,
    "revisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,
    "leadId" TEXT,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'Nos',
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "quotationId" TEXT NOT NULL,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3),
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,
    "quotationId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "workOrderNo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salesOrderId" TEXT,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_logs" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productionOutput" TEXT,
    "outputQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "downtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "downtimeReason" TEXT,
    "dispatches" INTEGER NOT NULL DEFAULT 0,
    "dispatchDetails" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workOrderId" TEXT,

    CONSTRAINT "production_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'Nos',
    "currentStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minimumStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supplier" TEXT,
    "branch" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "branch" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "materialId" TEXT NOT NULL,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_operational_settings" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "contactName" TEXT NOT NULL DEFAULT '',
    "contactPhone" TEXT NOT NULL DEFAULT '',
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '18:00',
    "shiftHours" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "machineTypes" TEXT NOT NULL DEFAULT '[]',
    "materialCategories" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_operational_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "branch" TEXT NOT NULL DEFAULT 'HO',
    "items" JSONB NOT NULL DEFAULT '[]',
    "customerName" TEXT,
    "customerAddress" TEXT,
    "customerGst" TEXT,
    "customerPhone" TEXT,
    "salutation" TEXT,
    "attentionName" TEXT,
    "tallyExported" BOOLEAN NOT NULL DEFAULT false,
    "tallyExportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salesOrderId" TEXT,
    "quotationId" TEXT,
    "customerId" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "collectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL DEFAULT 'BANK_TRANSFER',
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT,
    "salesOrderId" TEXT,
    "invoiceId" TEXT,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "complaintNo" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "ComplaintPriority" NOT NULL DEFAULT 'MEDIUM',
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,
    "assignedToId" TEXT,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "relatedTo" TEXT,
    "relatedType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedToId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_visits" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitType" "VisitType" NOT NULL,
    "outcome" "VisitOutcome" NOT NULL,
    "customerName" TEXT NOT NULL,
    "location" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "geoTagged" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "orderValue" DOUBLE PRECISION,
    "nextAction" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeeId" TEXT,
    "customerId" TEXT,

    CONSTRAINT "field_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dars" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "branch" "Branch" NOT NULL,
    "department" TEXT NOT NULL,
    "customerVisits" INTEGER NOT NULL DEFAULT 0,
    "callsMade" INTEGER NOT NULL DEFAULT 0,
    "followUpsDone" INTEGER NOT NULL DEFAULT 0,
    "ordersBooked" INTEGER NOT NULL DEFAULT 0,
    "ordersValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "collectionsAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "travelFrom" TEXT,
    "travelTo" TEXT,
    "travelKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "productionOutput" TEXT,
    "outputQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "downtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "downtimeReason" TEXT,
    "dispatches" INTEGER NOT NULL DEFAULT 0,
    "dispatchDetails" TEXT,
    "accountsCollections" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "collectionFrom" TEXT,
    "vendorPayments" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendorDetails" TEXT,
    "reconciliationStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeeId" TEXT,

    CONSTRAINT "dars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wwrs" (
    "id" TEXT NOT NULL,
    "weekFrom" TIMESTAMP(3) NOT NULL,
    "weekTo" TIMESTAMP(3) NOT NULL,
    "branch" "Branch" NOT NULL,
    "department" TEXT NOT NULL,
    "weeklyTarget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weeklyAchievement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "challenges" TEXT,
    "actionPlan" TEXT,
    "escalationsNeeded" BOOLEAN NOT NULL DEFAULT false,
    "escalationDetails" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'SUBMITTED',
    "approvedByManager" TIMESTAMP(3),
    "approvedByAVP" TIMESTAMP(3),
    "approvedByMD" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" TEXT,

    CONSTRAINT "wwrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mwrs" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "branch" "Branch" NOT NULL,
    "department" TEXT NOT NULL,
    "salesTarget" DOUBLE PRECISION,
    "salesAchievement" DOUBLE PRECISION,
    "conversionPct" DOUBLE PRECISION,
    "collectionPct" DOUBLE PRECISION,
    "productionAchievement" DOUBLE PRECISION,
    "efficiencyPct" DOUBLE PRECISION,
    "rejectionCount" INTEGER,
    "rejectionReasons" TEXT,
    "collectionEfficiencyPct" DOUBLE PRECISION,
    "outstandingReduction" DOUBLE PRECISION,
    "totalCollected" DOUBLE PRECISION,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" TEXT,

    CONSTRAINT "mwrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" TEXT,
    "fileUrl" TEXT,
    "storageKey" TEXT,
    "branch" "Branch",
    "relatedTo" TEXT,
    "relatedType" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "employeeNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "branch" "Branch" NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "dateOfJoining" TIMESTAMP(3),
    "salary" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "notes" TEXT,
    "checkInLat" DOUBLE PRECISION,
    "checkInLng" DOUBLE PRECISION,
    "checkOutLat" DOUBLE PRECISION,
    "checkOutLng" DOUBLE PRECISION,
    "locationName" TEXT,
    "employeeId" TEXT,
    "userId" TEXT,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeeId" TEXT,
    "userId" TEXT,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_settings" (
    "id" TEXT NOT NULL DEFAULT 'company',
    "name" TEXT NOT NULL DEFAULT 'ZAG SIGNS',
    "tagline" TEXT NOT NULL DEFAULT 'Excellence in Signage Solutions',
    "address" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "gstNo" TEXT NOT NULL DEFAULT '',
    "panNo" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT,
    "bankName" TEXT NOT NULL DEFAULT '',
    "bankBranch" TEXT NOT NULL DEFAULT '',
    "accountNo" TEXT NOT NULL DEFAULT '',
    "ifscCode" TEXT NOT NULL DEFAULT '',
    "accountType" TEXT NOT NULL DEFAULT 'Current Account',
    "defaultTerms" TEXT NOT NULL DEFAULT '',
    "validityDays" INTEGER NOT NULL DEFAULT 30,
    "paymentQrUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_settings" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL DEFAULT '',
    "bankBranch" TEXT NOT NULL DEFAULT '',
    "accountNo" TEXT NOT NULL DEFAULT '',
    "ifscCode" TEXT NOT NULL DEFAULT '',
    "accountType" TEXT NOT NULL DEFAULT 'Current Account',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "divisions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "headName" TEXT NOT NULL DEFAULT '',
    "headEmail" TEXT NOT NULL DEFAULT '',
    "headPhone" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "headName" TEXT NOT NULL DEFAULT '',
    "headEmail" TEXT NOT NULL DEFAULT '',
    "headPhone" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_tickets" (
    "id" TEXT NOT NULL,
    "ticketNo" TEXT NOT NULL,
    "branch" TEXT NOT NULL DEFAULT 'HO',
    "source" "WOTicketSource" NOT NULL DEFAULT 'WALK_IN',
    "status" "WOTicketStatus" NOT NULL DEFAULT 'NEW',
    "priority" "WOTicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "customerAddress" TEXT,
    "quotationId" TEXT,
    "natureOfWork" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advancePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMode" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedAt" TIMESTAMP(3),
    "assignedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "halfDoneAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "billedAt" TIMESTAMP(3),
    "assignedDesignerId" TEXT,
    "halfDoneReason" TEXT,
    "designerRemarks" TEXT,
    "closingNotes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_ticket_events" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "fromStatus" "WOTicketStatus",
    "toStatus" "WOTicketStatus" NOT NULL,
    "note" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_ticket_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "activityNo" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "customerId" TEXT,
    "leadId" TEXT,
    "opportunityId" TEXT,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "purpose" TEXT,
    "outcome" TEXT,
    "nextActionRequired" BOOLEAN NOT NULL DEFAULT false,
    "nextActionDate" TIMESTAMP(3),
    "nextActionDescription" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_up_reminders" (
    "id" TEXT NOT NULL,
    "activityLogId" TEXT NOT NULL,
    "reminderDate" TIMESTAMP(3) NOT NULL,
    "reminderType" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completedNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_up_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_claims" (
    "id" TEXT NOT NULL,
    "claimNo" TEXT NOT NULL,
    "claimType" TEXT NOT NULL,
    "claimReason" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "submittedByUserId" TEXT NOT NULL,
    "submissionWindow" TEXT NOT NULL,
    "submittedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "supportingDetails" TEXT,
    "rejectionReason" TEXT,
    "resubmissionAllowed" BOOLEAN NOT NULL DEFAULT false,
    "approvedAmount" DOUBLE PRECISION,
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_approval_history" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_approval_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_attachments" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_targets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "callsTarget" INTEGER NOT NULL DEFAULT 0,
    "visitsTarget" INTEGER NOT NULL DEFAULT 0,
    "followUpsTarget" INTEGER NOT NULL DEFAULT 0,
    "ordersTarget" INTEGER NOT NULL DEFAULT 0,
    "collectionTarget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenueTarget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fjp" (
    "id" TEXT NOT NULL,
    "fjpNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "forMonth" TEXT NOT NULL,
    "submittedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalDays" INTEGER NOT NULL DEFAULT 0,
    "totalKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fjp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fjp_routes" (
    "id" TEXT NOT NULL,
    "fjpId" TEXT NOT NULL,
    "dayDate" DATE NOT NULL,
    "fromPlace" TEXT NOT NULL,
    "toPlace" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "customerOrProspect" TEXT,
    "estimatedKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "modeOfTravel" TEXT NOT NULL DEFAULT 'Two Wheeler',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fjp_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_reports" (
    "id" TEXT NOT NULL,
    "expenseNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fjpId" TEXT,
    "expenseType" TEXT NOT NULL,
    "forMonth" TEXT NOT NULL,
    "submittedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "advanceReceived" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPayable" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "holdReason" TEXT,
    "rejectionReason" TEXT,
    "approvedAmount" DOUBLE PRECISION,
    "paymentDate" TIMESTAMP(3),
    "paymentRef" TEXT,
    "printedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_items" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fromPlace" TEXT,
    "toPlace" TEXT,
    "km" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "billAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_attachments" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_approvals" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "actionById" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "machineNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "printType" TEXT,
    "model" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "capacityPerHour" DOUBLE PRECISION,
    "maintenanceDueAt" TIMESTAMP(3),
    "branch" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_schedules" (
    "id" TEXT NOT NULL,
    "scheduleNo" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "scheduledStartAt" TIMESTAMP(3) NOT NULL,
    "scheduledEndAt" TIMESTAMP(3) NOT NULL,
    "actualStartAt" TIMESTAMP(3),
    "actualEndAt" TIMESTAMP(3),
    "estimatedOutput" INTEGER,
    "actualOutput" INTEGER,
    "operatorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_hours" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "productiveHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "downtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "downtimeReason" TEXT,
    "performancePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_maintenance" (
    "id" TEXT NOT NULL,
    "maintenanceNo" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_consumptions" (
    "id" TEXT NOT NULL,
    "consumptionNo" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "plannedQty" DOUBLE PRECISION NOT NULL,
    "actualQty" DOUBLE PRECISION,
    "wastageQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'units',
    "costValue" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_checkpoints" (
    "id" TEXT NOT NULL,
    "checkpointNo" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_defects" (
    "id" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "correctionRequired" BOOLEAN NOT NULL DEFAULT true,
    "correctedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_defects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_rejections" (
    "id" TEXT NOT NULL,
    "rejectionNo" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "costImpact" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "approvedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_rejections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenders" (
    "id" TEXT NOT NULL,
    "tenderNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "branch" "Branch" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "bidValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "awardedValue" DOUBLE PRECISION,
    "rfpDate" TIMESTAMP(3),
    "submitDeadline" TIMESTAMP(3),
    "openingDate" TIMESTAMP(3),
    "competitors" TEXT,
    "boqUrl" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_costs" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "revenueQuoted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenueActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_cost_lines" (
    "id" TEXT NOT NULL,
    "jobCostId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'units',
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_cost_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "vendorCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "category" TEXT NOT NULL,
    "branch" "Branch" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "creditDays" INTEGER NOT NULL DEFAULT 30,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "poNo" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "branch" "Branch" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "po_lines" (
    "id" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "receivedQty" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "po_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_received" (
    "id" TEXT NOT NULL,
    "grnNo" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "receivedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goods_received_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grn_items" (
    "id" TEXT NOT NULL,
    "grnId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderedQty" DOUBLE PRECISION NOT NULL,
    "receivedQty" DOUBLE PRECISION NOT NULL,
    "rejectedQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "grn_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "branch" "Branch" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "driverId" TEXT,
    "insuranceExpiry" TIMESTAMP(3),
    "pucExpiry" TIMESTAMP(3),
    "nextService" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleet_trips" (
    "id" TEXT NOT NULL,
    "tripNo" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "startKm" DOUBLE PRECISION NOT NULL,
    "endKm" DOUBLE PRECISION,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "purpose" TEXT NOT NULL,
    "fromPlace" TEXT NOT NULL,
    "toPlace" TEXT NOT NULL,
    "relatedOrderId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fleet_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_logs" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "litres" DOUBLE PRECISION NOT NULL,
    "costPerLitre" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "odometer" DOUBLE PRECISION NOT NULL,
    "fuelStation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuel_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleet_maintenance" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendor" TEXT,
    "notes" TEXT,
    "nextDue" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fleet_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "projectNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salesOrderId" TEXT,
    "branch" "Branch" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "managerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_milestones" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_approvals" (
    "id" TEXT NOT NULL,
    "approvalNo" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "relatedType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "documentUrl" TEXT,
    "signatureUrl" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "remarks" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digital_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amc_contracts" (
    "id" TEXT NOT NULL,
    "amcNo" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "annualValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "visitFrequency" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amc_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_tickets" (
    "id" TEXT NOT NULL,
    "ticketNo" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amcId" TEXT,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "assignedToId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "slaHours" INTEGER NOT NULL DEFAULT 24,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_approvalToken_key" ON "users"("approvalToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetToken_key" ON "users"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_userId_key" ON "user_permissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_leadNo_key" ON "leads"("leadNo");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customerNo_key" ON "customers"("customerNo");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quotationNo_key" ON "quotations"("quotationNo");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_orderNo_key" ON "sales_orders"("orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_workOrderNo_key" ON "work_orders"("workOrderNo");

-- CreateIndex
CREATE INDEX "materials_branch_idx" ON "materials"("branch");

-- CreateIndex
CREATE INDEX "stock_movements_branch_idx" ON "stock_movements"("branch");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNo_key" ON "invoices"("invoiceNo");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_complaintNo_key" ON "complaints"("complaintNo");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeNo_key" ON "employees"("employeeNo");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_employeeId_date_key" ON "attendance"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "divisions_code_key" ON "divisions"("code");

-- CreateIndex
CREATE INDEX "divisions_branch_idx" ON "divisions"("branch");

-- CreateIndex
CREATE INDEX "departments_divisionId_idx" ON "departments"("divisionId");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_tickets_ticketNo_key" ON "work_order_tickets"("ticketNo");

-- CreateIndex
CREATE INDEX "work_order_tickets_branch_status_idx" ON "work_order_tickets"("branch", "status");

-- CreateIndex
CREATE INDEX "work_order_tickets_assignedDesignerId_status_idx" ON "work_order_tickets"("assignedDesignerId", "status");

-- CreateIndex
CREATE INDEX "work_order_ticket_events_ticketId_createdAt_idx" ON "work_order_ticket_events"("ticketId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "activity_logs_activityNo_key" ON "activity_logs"("activityNo");

-- CreateIndex
CREATE INDEX "activity_logs_userId_createdAt_idx" ON "activity_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_customerId_idx" ON "activity_logs"("customerId");

-- CreateIndex
CREATE INDEX "activity_logs_leadId_idx" ON "activity_logs"("leadId");

-- CreateIndex
CREATE INDEX "activity_logs_opportunityId_idx" ON "activity_logs"("opportunityId");

-- CreateIndex
CREATE INDEX "follow_up_reminders_reminderDate_idx" ON "follow_up_reminders"("reminderDate");

-- CreateIndex
CREATE INDEX "follow_up_reminders_activityLogId_idx" ON "follow_up_reminders"("activityLogId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_claims_claimNo_key" ON "sales_claims"("claimNo");

-- CreateIndex
CREATE INDEX "sales_claims_submittedByUserId_idx" ON "sales_claims"("submittedByUserId");

-- CreateIndex
CREATE INDEX "sales_claims_status_idx" ON "sales_claims"("status");

-- CreateIndex
CREATE INDEX "sales_claims_submissionWindow_idx" ON "sales_claims"("submissionWindow");

-- CreateIndex
CREATE INDEX "claim_approval_history_claimId_idx" ON "claim_approval_history"("claimId");

-- CreateIndex
CREATE INDEX "claim_attachments_claimId_idx" ON "claim_attachments"("claimId");

-- CreateIndex
CREATE INDEX "sales_targets_userId_idx" ON "sales_targets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_targets_userId_month_key" ON "sales_targets"("userId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "fjp_fjpNo_key" ON "fjp"("fjpNo");

-- CreateIndex
CREATE INDEX "fjp_userId_idx" ON "fjp"("userId");

-- CreateIndex
CREATE INDEX "fjp_forMonth_idx" ON "fjp"("forMonth");

-- CreateIndex
CREATE INDEX "fjp_routes_fjpId_idx" ON "fjp_routes"("fjpId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_reports_expenseNo_key" ON "expense_reports"("expenseNo");

-- CreateIndex
CREATE INDEX "expense_reports_userId_idx" ON "expense_reports"("userId");

-- CreateIndex
CREATE INDEX "expense_reports_status_idx" ON "expense_reports"("status");

-- CreateIndex
CREATE INDEX "expense_reports_forMonth_idx" ON "expense_reports"("forMonth");

-- CreateIndex
CREATE INDEX "expense_items_expenseId_idx" ON "expense_items"("expenseId");

-- CreateIndex
CREATE INDEX "expense_attachments_expenseId_idx" ON "expense_attachments"("expenseId");

-- CreateIndex
CREATE INDEX "expense_approvals_expenseId_idx" ON "expense_approvals"("expenseId");

-- CreateIndex
CREATE INDEX "expense_approvals_stage_idx" ON "expense_approvals"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "machines_machineNo_key" ON "machines"("machineNo");

-- CreateIndex
CREATE INDEX "machines_status_idx" ON "machines"("status");

-- CreateIndex
CREATE INDEX "machines_type_idx" ON "machines"("type");

-- CreateIndex
CREATE INDEX "machines_branch_idx" ON "machines"("branch");

-- CreateIndex
CREATE UNIQUE INDEX "machine_schedules_scheduleNo_key" ON "machine_schedules"("scheduleNo");

-- CreateIndex
CREATE INDEX "machine_schedules_workOrderId_idx" ON "machine_schedules"("workOrderId");

-- CreateIndex
CREATE INDEX "machine_schedules_machineId_idx" ON "machine_schedules"("machineId");

-- CreateIndex
CREATE INDEX "machine_schedules_status_idx" ON "machine_schedules"("status");

-- CreateIndex
CREATE INDEX "machine_hours_machineId_idx" ON "machine_hours"("machineId");

-- CreateIndex
CREATE INDEX "machine_hours_date_idx" ON "machine_hours"("date");

-- CreateIndex
CREATE UNIQUE INDEX "machine_maintenance_maintenanceNo_key" ON "machine_maintenance"("maintenanceNo");

-- CreateIndex
CREATE INDEX "machine_maintenance_machineId_idx" ON "machine_maintenance"("machineId");

-- CreateIndex
CREATE INDEX "machine_maintenance_type_idx" ON "machine_maintenance"("type");

-- CreateIndex
CREATE UNIQUE INDEX "material_consumptions_consumptionNo_key" ON "material_consumptions"("consumptionNo");

-- CreateIndex
CREATE INDEX "material_consumptions_workOrderId_idx" ON "material_consumptions"("workOrderId");

-- CreateIndex
CREATE INDEX "material_consumptions_materialId_idx" ON "material_consumptions"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "quality_checkpoints_checkpointNo_key" ON "quality_checkpoints"("checkpointNo");

-- CreateIndex
CREATE INDEX "quality_checkpoints_workOrderId_idx" ON "quality_checkpoints"("workOrderId");

-- CreateIndex
CREATE INDEX "quality_checkpoints_stage_idx" ON "quality_checkpoints"("stage");

-- CreateIndex
CREATE INDEX "quality_checkpoints_status_idx" ON "quality_checkpoints"("status");

-- CreateIndex
CREATE INDEX "quality_defects_checkpointId_idx" ON "quality_defects"("checkpointId");

-- CreateIndex
CREATE INDEX "quality_defects_severity_idx" ON "quality_defects"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "production_rejections_rejectionNo_key" ON "production_rejections"("rejectionNo");

-- CreateIndex
CREATE INDEX "production_rejections_workOrderId_idx" ON "production_rejections"("workOrderId");

-- CreateIndex
CREATE INDEX "production_rejections_action_idx" ON "production_rejections"("action");

-- CreateIndex
CREATE UNIQUE INDEX "tenders_tenderNo_key" ON "tenders"("tenderNo");

-- CreateIndex
CREATE INDEX "tenders_branch_idx" ON "tenders"("branch");

-- CreateIndex
CREATE INDEX "tenders_status_idx" ON "tenders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "job_costs_salesOrderId_key" ON "job_costs"("salesOrderId");

-- CreateIndex
CREATE INDEX "job_cost_lines_jobCostId_idx" ON "job_cost_lines"("jobCostId");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_vendorCode_key" ON "vendors"("vendorCode");

-- CreateIndex
CREATE INDEX "vendors_branch_idx" ON "vendors"("branch");

-- CreateIndex
CREATE INDEX "vendors_status_idx" ON "vendors"("status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_poNo_key" ON "purchase_orders"("poNo");

-- CreateIndex
CREATE INDEX "purchase_orders_vendorId_idx" ON "purchase_orders"("vendorId");

-- CreateIndex
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");

-- CreateIndex
CREATE INDEX "po_lines_poId_idx" ON "po_lines"("poId");

-- CreateIndex
CREATE UNIQUE INDEX "goods_received_grnNo_key" ON "goods_received"("grnNo");

-- CreateIndex
CREATE INDEX "goods_received_poId_idx" ON "goods_received"("poId");

-- CreateIndex
CREATE INDEX "grn_items_grnId_idx" ON "grn_items"("grnId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicleNo_key" ON "vehicles"("vehicleNo");

-- CreateIndex
CREATE INDEX "vehicles_branch_idx" ON "vehicles"("branch");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_trips_tripNo_key" ON "fleet_trips"("tripNo");

-- CreateIndex
CREATE INDEX "fleet_trips_vehicleId_idx" ON "fleet_trips"("vehicleId");

-- CreateIndex
CREATE INDEX "fleet_trips_driverId_idx" ON "fleet_trips"("driverId");

-- CreateIndex
CREATE INDEX "fuel_logs_vehicleId_idx" ON "fuel_logs"("vehicleId");

-- CreateIndex
CREATE INDEX "fleet_maintenance_vehicleId_idx" ON "fleet_maintenance"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_projectNo_key" ON "projects"("projectNo");

-- CreateIndex
CREATE INDEX "projects_branch_idx" ON "projects"("branch");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "project_milestones_projectId_idx" ON "project_milestones"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "digital_approvals_approvalNo_key" ON "digital_approvals"("approvalNo");

-- CreateIndex
CREATE INDEX "digital_approvals_relatedId_idx" ON "digital_approvals"("relatedId");

-- CreateIndex
CREATE INDEX "digital_approvals_status_idx" ON "digital_approvals"("status");

-- CreateIndex
CREATE INDEX "digital_approvals_type_idx" ON "digital_approvals"("type");

-- CreateIndex
CREATE UNIQUE INDEX "amc_contracts_amcNo_key" ON "amc_contracts"("amcNo");

-- CreateIndex
CREATE INDEX "amc_contracts_customerId_idx" ON "amc_contracts"("customerId");

-- CreateIndex
CREATE INDEX "amc_contracts_status_idx" ON "amc_contracts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "service_tickets_ticketNo_key" ON "service_tickets"("ticketNo");

-- CreateIndex
CREATE INDEX "service_tickets_customerId_idx" ON "service_tickets"("customerId");

-- CreateIndex
CREATE INDEX "service_tickets_status_idx" ON "service_tickets"("status");

-- CreateIndex
CREATE INDEX "service_tickets_priority_idx" ON "service_tickets"("priority");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_reportingToId_fkey" FOREIGN KEY ("reportingToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_parentQuotationId_fkey" FOREIGN KEY ("parentQuotationId") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_logs" ADD CONSTRAINT "production_logs_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_visits" ADD CONSTRAINT "field_visits_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_visits" ADD CONSTRAINT "field_visits_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dars" ADD CONSTRAINT "dars_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wwrs" ADD CONSTRAINT "wwrs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mwrs" ADD CONSTRAINT "mwrs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_tickets" ADD CONSTRAINT "work_order_tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_tickets" ADD CONSTRAINT "work_order_tickets_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_tickets" ADD CONSTRAINT "work_order_tickets_assignedDesignerId_fkey" FOREIGN KEY ("assignedDesignerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_tickets" ADD CONSTRAINT "work_order_tickets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_ticket_events" ADD CONSTRAINT "work_order_ticket_events_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "work_order_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_ticket_events" ADD CONSTRAINT "work_order_ticket_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up_reminders" ADD CONSTRAINT "follow_up_reminders_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "activity_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_claims" ADD CONSTRAINT "sales_claims_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_approval_history" ADD CONSTRAINT "claim_approval_history_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "sales_claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_approval_history" ADD CONSTRAINT "claim_approval_history_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_attachments" ADD CONSTRAINT "claim_attachments_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "sales_claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_targets" ADD CONSTRAINT "sales_targets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fjp" ADD CONSTRAINT "fjp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fjp_routes" ADD CONSTRAINT "fjp_routes_fjpId_fkey" FOREIGN KEY ("fjpId") REFERENCES "fjp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_reports" ADD CONSTRAINT "expense_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_reports" ADD CONSTRAINT "expense_reports_fjpId_fkey" FOREIGN KEY ("fjpId") REFERENCES "fjp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expense_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_attachments" ADD CONSTRAINT "expense_attachments_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expense_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_approvals" ADD CONSTRAINT "expense_approvals_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expense_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_approvals" ADD CONSTRAINT "expense_approvals_actionById_fkey" FOREIGN KEY ("actionById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_schedules" ADD CONSTRAINT "machine_schedules_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_schedules" ADD CONSTRAINT "machine_schedules_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_schedules" ADD CONSTRAINT "machine_schedules_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_hours" ADD CONSTRAINT "machine_hours_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_maintenance" ADD CONSTRAINT "machine_maintenance_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_consumptions" ADD CONSTRAINT "material_consumptions_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_consumptions" ADD CONSTRAINT "material_consumptions_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_checkpoints" ADD CONSTRAINT "quality_checkpoints_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_checkpoints" ADD CONSTRAINT "quality_checkpoints_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_defects" ADD CONSTRAINT "quality_defects_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "quality_checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_rejections" ADD CONSTRAINT "production_rejections_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_rejections" ADD CONSTRAINT "production_rejections_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_costs" ADD CONSTRAINT "job_costs_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_cost_lines" ADD CONSTRAINT "job_cost_lines_jobCostId_fkey" FOREIGN KEY ("jobCostId") REFERENCES "job_costs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "po_lines" ADD CONSTRAINT "po_lines_poId_fkey" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_received" ADD CONSTRAINT "goods_received_poId_fkey" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_received" ADD CONSTRAINT "goods_received_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grn_items" ADD CONSTRAINT "grn_items_grnId_fkey" FOREIGN KEY ("grnId") REFERENCES "goods_received"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_trips" ADD CONSTRAINT "fleet_trips_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_trips" ADD CONSTRAINT "fleet_trips_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_maintenance" ADD CONSTRAINT "fleet_maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_approvals" ADD CONSTRAINT "digital_approvals_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amc_contracts" ADD CONSTRAINT "amc_contracts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_amcId_fkey" FOREIGN KEY ("amcId") REFERENCES "amc_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

