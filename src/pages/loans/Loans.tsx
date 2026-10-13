import { Link } from 'react-router';
import { SavedBookCard } from '@/components/book/SavedBookCard';
import { ListFeedback, ListMore } from '@/components/layout/ListFeedback';
import { useLibraryList } from '@/hooks/useLibraryList';
import { loansService } from '@/services/loans.service';
import { LOAN_STATUS_LABELS, type Loan, type LoanStatus } from '@/types/loans';
import { LoanActions } from './components/LoanActions';

export default function LoansPage({ initialStatus = 'active', title }: { initialStatus?: LoanStatus; title: string }) {
  const history = initialStatus === 'returned';
  const list = useLibraryList<Loan>(
    `loans:${history ? 'history' : 'active'}`,
    history ? loansService.getHistory : loansService.getActive,
  );
  return <div className="loans-page">
    <header className="page-header"><h1 className="page-title">{title}</h1><p className="page-description">{history ? 'Your returned books.' : 'Your active and overdue loans.'}</p></header>
    <nav className="status-tabs" aria-label="Loan filters">
      <Link to="/loans" aria-current={!history ? 'page' : undefined} className={`status-tab ${!history ? 'active' : ''}`}>Active</Link>
      <Link to="/loans/returned" aria-current={history ? 'page' : undefined} className={`status-tab ${history ? 'active' : ''}`}>History</Link>
    </nav>
    <ListFeedback {...list} empty={!list.items.length} emptyText={history ? 'Your loan history is empty.' : 'You have no active loans. Browse books to find your next read.'} retry={list.refetch} />
    <div className="loans-grid" role="list">{list.items.map(loan => <SavedBookCard key={loan.id} book={loan.book} to={`/loans/${loan.id}`}>
      <p className={loan.status === 'overdue' ? 'text-destructive font-medium' : 'font-medium'}>{LOAN_STATUS_LABELS[loan.status]}</p>
      <p className="text-sm">Borrowed: {new Date(loan.loan_date).toLocaleDateString()}</p>
      <p className="text-sm">Due: {new Date(loan.due_date).toLocaleDateString()}</p>
      {loan.return_date && <p className="text-sm">Returned: {new Date(loan.return_date).toLocaleDateString()}</p>}
      {loan.status !== 'returned' && <LoanActions loan={loan} onUpdated={list.refetch} showRemaining />}
    </SavedBookCard>)}</div>
    <ListMore {...list} />
    <Link to="/" className="library-text-link">Browse books</Link>
  </div>;
}

