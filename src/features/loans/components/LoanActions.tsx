import { Button } from '@/shared/components/ui/button';
import { useLibraryAction } from '@/shared/hooks/useLibraryAction';
import { loansService } from '@/features/loans/api/loans.service';
import type { Loan } from '@/features/loans/types';

const MAX_RENEWALS = 2;

interface LoanActionsProps {
  loan: Pick<Loan, 'id' | 'renewal_count'>;
  onUpdated: () => void | Promise<void>;
  showRemaining?: boolean;
}

export function LoanActions({ loan, onUpdated, showRemaining = false }: LoanActionsProps) {
  const action = useLibraryAction();
  const renewalsRemaining = Math.max(0, MAX_RENEWALS - loan.renewal_count);

  const renew = async () => {
    const updated = await action.runOperation(loan.id, (token, signal) =>
      loansService.renew(loan.id, token, signal),
    );
    if (updated) await onUpdated();
  };

  const returnBook = async () => {
    const updated = await action.runOperation(loan.id, (token, signal) =>
      loansService.returnLoan(loan.id, token, signal),
    );
    if (updated) await onUpdated();
  };

  return (
    <>
      {action.error && (
        <p
          role="alert"
          className="text-destructive"
        >
          {action.error}
        </p>
      )}
      <div className="library-actions">
        <Button
          variant="outline"
          disabled={action.busy || renewalsRemaining === 0}
          onClick={() => void renew()}
        >
          {showRemaining ? `Renew (${renewalsRemaining} left)` : 'Renew loan'}
        </Button>
        <Button
          disabled={action.busy}
          onClick={() => void returnBook()}
        >
          Return book
        </Button>
      </div>
    </>
  );
}
