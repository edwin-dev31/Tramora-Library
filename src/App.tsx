import { Route, Routes } from 'react-router';
import AppLayout from '@/shared/components/layout/AppLayout';
import GuestRoute from '@/features/auth/components/GuestRoute';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import BookDetail from '@/features/books/pages/BookDetail';
import { Home } from '@/features/books/pages/home';
import { Login, Register } from '@/features/auth/pages';
import { LoansPage, LoanDetail, ReadingList } from '@/features/loans/pages';
import { WishlistPage } from '@/features/wishlist/pages';
import { ReservationsPage } from '@/features/reservations/pages';
import { NotFound } from '@/features/errors/pages';

const App = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={<Home />}
        />
        <Route element={<GuestRoute />}>
          <Route
            path="login"
            element={<Login />}
          />
          <Route
            path="register"
            element={<Register />}
          />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route
            path="books/:id"
            element={<BookDetail />}
          />
          <Route
            path="loans"
            element={
              <LoansPage
                key="active"
                initialStatus="active"
                title="Active Loans"
              />
            }
          />
          <Route
            path="loans/returned"
            element={
              <LoansPage
                key="history"
                initialStatus="returned"
                title="Loan History"
              />
            }
          />
          <Route
            path="loans/reading"
            element={<ReadingList />}
          />
          <Route
            path="loans/:id"
            element={<LoanDetail />}
          />
          <Route
            path="wishlist"
            element={<WishlistPage />}
          />
          <Route
            path="reservations"
            element={<ReservationsPage />}
          />
        </Route>
        <Route
          path="*"
          element={<NotFound />}
        />
      </Route>
    </Routes>
  );
};

export default App;
