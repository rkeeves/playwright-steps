import { Page } from "@playwright/test";
import { StepAppendFunc } from "../core/playwright-api";

export default class LoginNightmareFuel {
  private readonly page: Page;
  private readonly step: StepAppendFunc;

  constructor(page: Page, step: StepAppendFunc) {
    this.page = page;
    this.step = step;
  }

  async navigatesToLogin() {
    await this.step("Navigates to Login", async () => {
      await this.page.goto("/");
    });
  }

  async entersCredentials(uname: string, pass: string) {
    await this.step("Enters Credentials", async () => {
      await this.step(`Enters username '${uname}'`, async () => {
        await this.page.getByTestId("username").type(uname);
      });
      await this.step(`Enters password '${pass}'`, async () => {
        await this.page.getByTestId("password").type(pass);
      });
    });
  }

  async userSubmitsTheLogin() {
    await this.step("User submit the Login", async () => {
      await this.page.getByTestId("login-button").click();
    });
  }
}
