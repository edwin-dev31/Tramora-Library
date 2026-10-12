import { Route, Routes } from 'react-router';
import AppLayout from '@/components/layout/AppLayout';
import GuestRoute from '@/components/auth/GuestRoute';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BookDetail from '@/pages/BookDetail';
import { Home } from '@/pages/home';
import { Login, Register } from '@/pages/auth';
import { LoansPage, LoanDetail, ReadingList } from '@/pages/loans';
import { WishlistPage } from '@/pages/wishlist';
import { ReservationsPage } from '@/pages/reservations';
import { NotFound } from '@/pages/errors';

const App = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
        <Route path="books/:id" element={<BookDetail />} />
        <Route path="loans" element={<LoansPage key="active" initialStatus="active" title="Active Loans" />} />
        <Route path="loans/returned" element={<LoansPage key="history" initialStatus="returned" title="Loan History" />} />
        <Route path="loans/reading" element={<ReadingList />} />
        <Route path="loans/:id" element={<LoanDetail />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
