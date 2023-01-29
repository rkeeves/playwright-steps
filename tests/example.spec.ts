import { test, expect } from "@playwright/test";
import { withTestId } from "../src/annotation";
import InventoryNightmareFuel from "../src/nightmare-fuel/inventory-nightmare-fuel";
import LoginNightmareFuel from "../src/nightmare-fuel/login-nightmare-fuel";

test.describe("test-describe", () => {
  test("no-steps @some-tag-a", async ({ page }) => {
    withTestId(test, "1");
    await page.goto("/");
    await page.getByTestId("username").type("foo");
    await page.getByTestId("password").type("bar");
    await page.getByTestId("login-button").click();
    await expect.soft(page).toHaveURL(/.*inventory.html/);
    await expect.soft(page.getByTestId("non-existing-test-id")).toBeVisible();
  });

  test("shallow-nested-steps @some-tag-b", async ({ page }) => {
    withTestId(test, "2");
    await test.step("Given User entered credentials at Login", async () => {
      await page.goto("/");
      await page.getByTestId("username").type("foo");
      await page.getByTestId("password").type("bar");
    });
    await test.step("When User tries to login", async () => {
      await page.getByTestId("login-button").click();
    });
    await test.step("Then User must be on Inventory", async () => {
      await expect.soft(page).toHaveURL(/.*inventory.html/);
      await expect.soft(page.getByTestId("non-existing-test-id")).toBeVisible();
    });
  });

  test("deeply-nested-steps @some-tag-c", async ({ page }) => {
    withTestId(test, "3");
    await test.step("Given User entered credentials at Login", async () => {
      await test.step("Navigated to Login", async () => {
        await page.goto("/");
      });
      await test.step("Entered Credentials", async () => {
        await test.step("Entered username", async () => {
          await page.getByTestId("username").type("foo");
        });
        await test.step("Entered Password", async () => {
          await page.getByTestId("password").type("bar");
        });
      });
    });
    await test.step("When User tries to login", async () => {
      await page.getByTestId("login-button").click();
    });
    await test.step("Then User must be on Inventory", async () => {
      await test.step("Nesting is fun", async () => {
        await test.step("Nesting is kind of okay", async () => {
          await test.step("Omg stop with Nesting already", async () => {
            await expect.soft(page).toHaveURL(/.*inventory.html/);
          });
        });
      });
      await test.step("Once again...nesting", async () => {
        await test.step("I get it, now stop nesting pls", async () => {
          await test.step("Ok, I'm calling the cops", async () => {
            await expect
              .soft(page.getByTestId("non-existing-test-id"))
              .toBeVisible();
          });
        });
      });
    });
  });

  test("oop-delegating-steps @some-tag-d", async ({ page }) => {
    withTestId(test, "4");
    const steps = {
      login: new LoginNightmareFuel(page, test.step),
      inventory: new InventoryNightmareFuel(page, test.step),
    };
    await test.step("Given User entered credentials at Login", async () => {
      await steps.login.navigatesToLogin();
      await steps.login.entersCredentials("foo", "bar");
    });
    await test.step("When User tries to login", async () => {
      await steps.login.userSubmitsTheLogin();
    });
    await test.step("Then User must be on Inventory", async () => {
      await steps.inventory.userIsSupposedToBeAtInventory();
      await steps.inventory.userIsSupposedToSeeSomeGadget();
    });
  });
});
