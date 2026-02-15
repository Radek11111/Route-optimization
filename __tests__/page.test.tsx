// __tests__/page.test.tsx (lub app/page.test.tsx)
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../src/app/page";

describe("Strona główna", () => {
  it("wyświetla paragraf z tekstem hello", () => {
    render(<Home />);

    const paragraph = screen.getByText("hello");

    expect(paragraph).toBeDefined();

    expect(paragraph.tagName).toBe("P");
  });
});
