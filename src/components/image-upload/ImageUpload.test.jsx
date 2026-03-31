import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImageUpload from "./ImageUpload";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "pt" },
  }),
}));

describe("ImageUpload", () => {
  let mockOnImageChange;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnImageChange = jest.fn();
  });

  test("renders upload placeholder when no image", () => {
    render(<ImageUpload onImageChange={mockOnImageChange} />);

    expect(screen.getByText("new-work.uploadimage")).toBeInTheDocument();
    expect(screen.getByText("new-work.dragdropimage")).toBeInTheDocument();
  });

  test("shows preview when initialImageUrl provided", () => {
    const testUrl = "http://example.com/image.jpg";
    render(
      <ImageUpload onImageChange={mockOnImageChange} initialImageUrl={testUrl} />
    );

    const img = screen.getByAltText("Preview");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", testUrl);
  });

  test("remove button calls onImageChange(null)", () => {
    const testUrl = "http://example.com/image.jpg";
    render(
      <ImageUpload onImageChange={mockOnImageChange} initialImageUrl={testUrl} />
    );

    const removeBtn = screen.getByText("×");
    fireEvent.click(removeBtn);

    expect(mockOnImageChange).toHaveBeenCalledWith(null);
  });

  test("file input accept attribute is image/*", () => {
    render(<ImageUpload onImageChange={mockOnImageChange} />);

    const input = document.getElementById("image-input");
    expect(input).toHaveAttribute("accept", "image/*");
  });

  test("file input is disabled when disabled=true", () => {
    render(<ImageUpload onImageChange={mockOnImageChange} disabled={true} />);

    const input = document.getElementById("image-input");
    expect(input).toBeDisabled();
  });

  test("handleFileSelect with valid image file calls onImageChange", async () => {
    const mockResult = "data:image/png;base64,abc123";
    const mockReadAsDataURL = jest.fn();
    const mockFileReader = {
      readAsDataURL: mockReadAsDataURL,
      onload: null,
      result: mockResult,
    };

    mockReadAsDataURL.mockImplementation(function () {
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: mockResult } });
        }
      }, 0);
    });

    global.FileReader = jest.fn(() => mockFileReader);

    render(<ImageUpload onImageChange={mockOnImageChange} />);

    const file = new File(["image content"], "test.png", { type: "image/png" });
    const input = document.getElementById("image-input");

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnImageChange).toHaveBeenCalledWith(file);

    await waitFor(() => {
      const img = screen.queryByAltText("Preview");
      expect(img).toBeInTheDocument();
    });
  });

  test("drag and drop events work", () => {
    const mockResult = "data:image/png;base64,xyz";
    const mockReadAsDataURL = jest.fn();
    const mockFileReader = {
      readAsDataURL: mockReadAsDataURL,
      onload: null,
      result: mockResult,
    };

    mockReadAsDataURL.mockImplementation(function () {
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: mockResult } });
        }
      }, 0);
    });

    global.FileReader = jest.fn(() => mockFileReader);

    render(<ImageUpload onImageChange={mockOnImageChange} />);

    const uploadArea = document.querySelector(".image-upload-area");

    fireEvent.dragEnter(uploadArea, {
      dataTransfer: { files: [] },
    });
    expect(uploadArea).toHaveClass("drag-active");

    fireEvent.dragLeave(uploadArea, {
      dataTransfer: { files: [] },
    });
    expect(uploadArea).not.toHaveClass("drag-active");

    const file = new File(["image content"], "dropped.png", {
      type: "image/png",
    });

    fireEvent.drop(uploadArea, {
      dataTransfer: { files: [file] },
    });

    expect(mockOnImageChange).toHaveBeenCalledWith(file);
  });
});
