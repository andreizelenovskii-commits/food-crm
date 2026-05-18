import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PhoneInput } from "@/components/ui/phone-input";

describe("PhoneInput", () => {
  it("formats the visible value and updates the hidden submitted value", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<PhoneInput name="phone" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "9991234567");

    expect(input).toHaveValue("+7 999 123 45 67");
    expect(document.querySelector('input[type="hidden"][name="phone"]')).toHaveValue(
      "+7 999 123 45 67",
    );
    expect(handleChange).toHaveBeenLastCalledWith("+7 999 123 45 67");
  });
});
