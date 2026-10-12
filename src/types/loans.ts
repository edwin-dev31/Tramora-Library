import type { SavedBook } from './library';

export type LoanStatus = 'active' | 'returned' | 'overdue';
export interface Loan {
  id: string;
  user_id: string;
  book_id: string;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  renewal_count: number;
  status: LoanStatus;
  fine_amount: number | string;
  book: SavedBook;
}

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  active: 'Active', returned: 'Returned', overdue: 'Overdue',
};
