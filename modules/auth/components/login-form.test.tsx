import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/modules/auth/components/login-form";

vi.mock("@/modules/auth/auth.actions", () => ({
  loginAction: vi.fn(async () => ({ errorMessage: null })),
}));

describe("LoginForm phone input", () => {
  it("pastes formatted Russian phones into display mask and backend digits", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    const input = screen.getByLabelText("Телефон", { selector: 'input[name="phoneDisplay"]' });
    await user.click(input);
    await user.paste("+7 (924) 186-87-41");

    expect(input).toHaveValue("+7-(924)-186-87-41");
    expect(document.querySelector('input[type="hidden"][name="phone"]')).toHaveValue("79241868741");
  });

  it("accepts an 8-prefixed phone and keeps submit value backend-compatible", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    const input = screen.getByLabelText("Телефон", { selector: 'input[name="phoneDisplay"]' });
    await user.type(input, "89241868741");

    expect(input).toHaveValue("+7-(924)-186-87-41");
    expect(document.querySelector('input[type="hidden"][name="phone"]')).toHaveValue("79241868741");
  });
});
