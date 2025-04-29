import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Footer from '../components/footer/footer';
import Header from '../components/header/header';
import Home from './(unauthenticated)/home/page';
import LoginPage from './(unauthenticated)/login/page';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<LoginPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;