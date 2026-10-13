import { Link, useParams } from 'react-router';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useAuth } from '@/context/auth/useAuth';
import { loansService } from '@/services/loans.service';
import { LOAN_STATUS_LABELS, type Loan } from '@/types/loans';
import { LoanActions } from './components/LoanActions';

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const requestKey = id && accessToken ? `loan:${id}:${accessToken}` : null;
  const { data: loan, error, isLoading, refetch } = useAsyncResource<Loan>(
    requestKey,
    signal => loansService.getById(id!, accessToken!, signal),
  );
  return <div className="loan-detail-page">
    <Link to="/loans" className="library-text-link">Back to loans</Link>
    <h1 className="page-title">Loan Details</h1>
    {isLoading && <p role="status">Loading loan…</p>}
    {error && <p role="alert">{error}</p>}
    {loan && <article className="library-card">
      <h2 className="text-xl font-semibold">{loan.book.title}</h2>
      <p>{loan.book.author}</p>
      <p>{LOAN_STATUS_LABELS[loan.status]}</p>
      <dl className="library-facts">
        <dt>Borrowed</dt><dd>{new Date(loan.loan_date).toLocaleDateString()}</dd>
        <dt>Due date</dt><dd>{new Date(loan.due_date).toLocaleDateString()}</dd>
        <dt>Renewals used</dt><dd>{loan.renewal_count} / 2</dd>
        {loan.return_date && <><dt>Returned</dt><dd>{new Date(loan.return_date).toLocaleDateString()}</dd></>}
        {Number(loan.fine_amount) > 0 && <><dt>Late fee</dt><dd>${Number(loan.fine_amount).toFixed(2)}</dd></>}
      </dl>
      {loan.status !== 'returned' && <LoanActions loan={loan} onUpdated={refetch} />}
      <Link to={`/books/${encodeURIComponent(loan.book.id)}`} className="library-text-link">Book details</Link>
    </article>}
  </div>;
}

