import { Route, Routes } from 'react-router-dom';
import Home from '../app/(unauthenticated)/home/page';
import LoginPage from '../app/(unauthenticated)/login/page';
import RegisterPage from '../app/(unauthenticated)/register/page';
import Single from '../app/(unauthenticated)/home/[id]/page';

function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/trabalho/:id' element={<Single />} />
    </Routes>
  );
}

export default AppRoutes;