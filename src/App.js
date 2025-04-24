import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Footer from './components/footer/footer';
import Header from './components/header/header';
import Calculadora from './components/calculadora/calculadora';
import Home from './app/(unauthenticated)/home/page';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/calculadora' element={<Calculadora />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;