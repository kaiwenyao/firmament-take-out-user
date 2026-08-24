import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";

describe("Card and subcomponents", () => {
  it("renders Card with default classes", () => {
    render(<Card>Body</Card>);
    const card = screen.getByText("Body");
    expect(card.className).toContain("rounded-xl");
    expect(card.className).toContain("bg-card");
  });

  it("merges custom className", () => {
    render(<Card className="custom-card">Body</Card>);
    expect(screen.getByText("Body").className).toContain("custom-card");
  });

  it("renders all card parts", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
