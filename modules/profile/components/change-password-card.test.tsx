import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ChangePasswordCard } from "@/modules/profile/components/change-password-card";

describe("ChangePasswordCard", () => {
  it("renders password fields and toggles password visibility", async () => {
    const user = userEvent.setup();

    render(<ChangePasswordCard />);

    const currentPassword = screen.getByLabelText("Текущий пароль");
    const newPassword = screen.getByLabelText("Новый пароль");
    const confirmation = screen.getByLabelText("Повтори новый пароль");

    expect(currentPassword).toHaveAttribute("type", "password");
    expect(newPassword).toHaveAttribute("type", "password");
    expect(confirmation).toHaveAttribute("type", "password");

    await user.click(screen.getAllByRole("button", { name: "Показать" })[1]);

    expect(newPassword).toHaveAttribute("type", "text");
    expect(confirmation).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Обновить пароль" })).toBeEnabled();
  });
});
