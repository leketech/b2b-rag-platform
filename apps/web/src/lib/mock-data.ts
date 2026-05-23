export const kpis = {
  revenue: 0,
  activeContracts: 0,
  overdueInvoices: 0,
  upcomingMeetings: 0,
  notificationActivity: 0,
};

export const revenueTrend = [
  { label: "Jan", paid: 0, unpaid: 0 },
  { label: "Feb", paid: 0, unpaid: 0 },
  { label: "Mar", paid: 0, unpaid: 0 },
  { label: "Apr", paid: 0, unpaid: 0 },
  { label: "May", paid: 0, unpaid: 0 },
  { label: "Jun", paid: 0, unpaid: 0 },
];

export const contracts: Array<{ id: string; name: string; status: string; confidence: number; owner: string; updated: string }> = [];

export const invoices: Array<{ id: string; customer: string; amount: number; status: string; due: string }> = [];

export const meetings: Array<{ title: string; time: string; attendees: number }> = [];

export const documents: Array<{ name: string; type: string; chunks: number; status: string }> = [];
