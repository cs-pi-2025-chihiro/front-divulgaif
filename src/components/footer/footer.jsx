import Image from '../image/image';
import './footer.css'


const Footer = () => {
    return (
        <div>
                  <footer className="login-footer">
        <div className="footer-logo">
          <Image 
            src="/ifpr_logo.png" 
            alt="IFPR Logo" 
            className="ifpr-logo-small" 
          />
          <span className="footer-title">DivulgaIF</span>
        </div>
        <div className="footer-links">
          <p>SIGAA | Cronos | SUAP | Moodle</p>
          <p>Acessibilidade e Ajuda | Sobre Nós</p>
          <p>© DivulgaIF | Todos os Direitos Reservados</p>
        </div>
      </footer>
        </div>
    )
}

export default Footer;