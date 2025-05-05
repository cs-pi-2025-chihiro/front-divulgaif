import { redirect } from "react-router-dom";
import Button from "../button";
import "./header.css";

const Header = () => {
  return (
    <div className="header">
      <h1>Header top</h1>
      <div>
        <Button
          type="submit"
          className="primary"
          variant="secondary"
          ariaLabel="Login"
          children="Login"
          onClick={() => (window.location.href = "/login")}
        />
      </div>
    </div>
  );
};

export default Header;
