export type WorkflowStatus = "Draft" | "Review" | "Ready" | "Open" | "Paid" | "Overdue" | "Queued" | "Embedding" | "Indexed";

export type Contract = {
  id: string;
  name: string;
  status: WorkflowStatus;
  confidence: number;
  owner: string;
  updated: string;
};

export type Invoice = {
  id: string;
  customer: string;
  amount: number;
  status: WorkflowStatus;
  due: string;
};
