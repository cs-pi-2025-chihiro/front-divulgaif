import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders IF Xplore link", () => {
  render(<App />);
  const linkElement = screen.getByText(/IF Xplore/i);
  expect(linkElement).toBeInTheDocument();
});
