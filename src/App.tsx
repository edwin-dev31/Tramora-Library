import { Route, Routes } from 'react-router';
import AppLayout from '@/components/layout/AppLayout';
import GuestRoute from '@/components/auth/GuestRoute';
import { Home } from '@/pages/home';
import { Login, Register } from '@/pages/auth';
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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
