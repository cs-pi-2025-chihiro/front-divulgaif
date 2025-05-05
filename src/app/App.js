import { BrowserRouter } from 'react-router-dom';
import './App.css';
import Footer from '../components/footer/footer';
import Header from '../components/header/header';
import AppRoutes from '../routes/Routes';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <AppRoutes />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;