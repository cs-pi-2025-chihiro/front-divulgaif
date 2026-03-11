import React from "react";
import { render, screen } from "@testing-library/react";
import Loader from "./index";

describe("Loader", () => {
  test("renderiza o container do loader", () => {
    const { container } = render(<Loader />);
    expect(container.querySelector(".loader-container")).toBeInTheDocument();
  });

  test("renderiza o spinner interno", () => {
    const { container } = render(<Loader />);
    expect(container.querySelector(".loader-spinner")).toBeInTheDocument();
  });
});
