import { expect, Page } from "@playwright/test";
import { StepAppendFunc } from "../core/playwright-api";

export default class InventoryNightmareFuel {
  private readonly page: Page;
  private readonly step: StepAppendFunc;

  constructor(page: Page, step: StepAppendFunc) {
    this.page = page;
    this.step = step;
  }

  async userIsSupposedToBeAtInventory() {
    await this.step(
      "User is supposed to be at inventory (judging by url)",
      async () => {
        await expect.soft(this.page).toHaveURL(/.*inventory.html/);
      }
    );
  }

  async userIsSupposedToSeeSomeGadget() {
    await this.step("User is supposed to see some gadget", async () => {
      await expect
        .soft(this.page.getByTestId("non-existing-test-id"))
        .toBeVisible();
    });
  }
}
