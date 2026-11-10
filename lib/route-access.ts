// Which pages' permissions grant each list API. These routes used to accept
// any signed-in user (requireSession), so e.g. a Designer could read every
// attendance record or leave request. Each API now requires access to at
// least one page that actually uses it (role defaults or the per-user
// override, via requireAnyPathAccess). The same keys guard the matching
// record ([id]) and bulk routes, so a list and its records always agree.
export const ROUTE_ACCESS = {
  complaints: ["/complaints"],
  tasks: ["/tasks"],
  opportunities: ["/opportunities", "/sales"],          // /sales dashboard reads it
  serviceTickets: ["/amc"],
  attendance: ["/hr"],
  leaveRequests: ["/hr"],
  workOrderTickets: ["/work-order-tickets", "/my-work", "/quotations"],
  production: ["/production"],                          // schedules, consumption, quality, rejections, machines
} as const;
