# playwright-steps

Examples about Playwright `custom reporters`, `step trees` and `test annotations`.

## Overview

Short examples about:
- working with `step trees` in your `custom reporter`
- working with `test annotations` in your `custom reporter`
- delegating the ability of `appending steps` towards `page object`-like oop nightmare fuels


## Running the tests

There are 4 tests. The total runtime for running all 4 tests is around 30 seconds.

All tests will do the following:

```text
Go to SauceDemo LoginPage
Enter username "foo"
Enter password "bar"
Expect to be taken to Inventory Page
(Which will never happen, therefore all tests will fail)
```

The tests use different `trees of steps` to communicate intent/context.

> **'OMG It is just pushing a dumb login page! Why do you even need steps for that?'**
>
> You are right, steps are unnecessary in this simple example. My intention was to keep the actual workflow as simple as possible to be able to focus on the trees themselves and the Playwright technicalities.

Run it in **headed**

```shell
npx playwright test --headed
```

Run it in **headless**

```shell
npx playwright test
```

> If it is throwing a tantrum at any point, then be sure to [install browsers](https://playwright.dev/docs/browsers#installing-google-chrome--microsoft-edge) and also restart IDE (if you use one) because caches are tricky.

> If it is throwing a tantrum at any point, **unplug**ging all reporters except for the `html` might help you in pinpointing the issue.
>
> You can **unplug** my abhorrent `custom-reporters` and other garbage by opening `playwright.config.ts` and simply removing them from the `reporter` array.
>
> Example: `reporter: ["html"]`
>
> stands for `Just do the html report, okay?! No json, no junit xml, no custom reports. Gosh...`

When EACH test is finished, then two different `custom reporters` will print - pretty ungraciously - custom json objects to stdout.

When ALL tests are finished, then a builtin html reporter will generate an html report, which will be served from `http://localhost:9323` (If you terminate it, then you can always restart it by `npx playwright show-report`).

## Custom Reporter and Step Trees

Imagine a `test` with insanely deeply nested `steps`.

```typescript
test("deeply-nested-steps @some-tag-c", async ({ page }) => {
  // ... more
  await test.step("Then User must be on Inventory", async () => {
    await test.step("Nesting is fun", async () => {
      await test.step("Nesting is kind of okay", async () => {
        await test.step("Omg stop with Nesting already", async () => {
          // Notice the expect.soft in the source code below?
          // I'll refer to this, so keep it in mind.
          await expect.soft(page).toHaveURL(/.*inventory.html/);
        });
      });
      // ... more sub steps
    });
  });
});
```

Just to further complicate the example, I added `expect.soft`.

When the `expect.soft` fails, execution will carry on, but the `test` will be ultimately be flagged as a `failure`.

> I made two `expect.soft`s to generate a `result tree` which has multiple `leafs` which `failed`.

Aka there is more than just 1 path from the root of the tree which ends at a leaf with error/failure.

*(due to the fact that `expect.soft` is not terminating the test immediately)*

```
    Err
  /  |  \
Ok  Err  Err
     |    | \
    Soft Ok  Soft
```

Now comes the entire goal of this example: `custom reporters`.

You can write your own  `custom reporters`.
In your `custom reporter` you have access to the `tree of steps` generated during the execution.

In this dumb example I made two `custom reporters`:

- FlatSummaryReporter
- PathSummaryReporter

> **OMG the fold over the tree! Push, mutate, loop?! It burns my eyes!**
>
> Where we're going, we won't need eyes to see.

### FlatSummaryReporter

Lists the titles of all failed `steps`.

Example (hint: look at the array of strings `failedSteps`):

```javascript
{
  testId: '3',
  status: 'failed',
  startTime: 2023-01-29T12:12:16.593Z,
  duration: 10840,
  failedSteps: [
    'Then User must be on Inventory',
    'Nesting is fun',
    'Nesting is kind of okay',
    'Omg stop with Nesting already',
    'expect.soft.toHaveURL',
    'Once again...nesting',
    'I get it, now stop nesting pls',
    "Ok, I'm calling the cops",
    'expect.soft.toBeVisible'
  ]
}
```

### PathSummaryReporter

Lists all the paths leading to failed `steps`.

I joined the `step titles` with literal ` > `.

Aka `GradParentTitle > ParentTitle > ChildTitle`.

Example (hint: look at the array of suspiciously `joined` strings `failPaths`):

```javascript
{
  testId: '3',
  status: 'failed',
  startTime: 2023-01-29T12:12:16.593Z,
  duration: 10840,
  failPaths: [
    'Then User must be on Inventory > Nesting is fun > Nesting is kind of okay > Omg stop with Nesting already > expect.soft.toHaveURL',
    "Then User must be on Inventory > Once again...nesting > I get it, now stop nesting pls > Ok, I'm calling the cops > expect.soft.toBeVisible"
  ]
}
```

The `FlatSummaryReporter` and `PathSummaryReporter` are just dumb examples.

You can `map` or `fold` the `tree of steps` however you want.

The `FlatSummaryReporter` and `PathSummaryReporter` simply use `console.log`.

You could instead:
- write to file (xml, json, text, whatever)
- call a publishing API (`POST` the test results)
- do whatever

## Custom Reporters and Test Annotations

Another thing is that you can add metadata to `tests` by `annotations`.

```typescript
test("foo", async ({ page }) => {
    test.info().annotations.push({
      type: "whatever",
      description: "does not matter"
    })
    // ... more
```

In this example I added a bogus annotation, which has `type = "custom-id"`.

The `custom reporters` fish out this bogus annotation, get the `description` string out of it,
and assign it to the `testId` property of their results.

```javascript
{
  testId: '3',
  // ... more
}
```

This is a totally made-up use case. It is just a demonstration of how you can fish out annotations (predefined within the `test body`) with `custom reporters`.

## Delegating Step Append to Page/Whatever Objects

You can `append steps` to a `test` like:

```typescript
test("Made up test", async ({ page }) => {
  test.step("Given Customer has conflicting orders", async () => {
    // whatever
  })
})
```

The `inventory-nightmare-fuel.ts` defines the following class:

```typescript
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
```

Where:

```typescript
export type StepAppendFunc = typeof test.step;
```

So instances of this class are able to add `append steps` to the `test`.

Calling `test.step` is **sort of like** calling a method on a `builder`.

You don't need that `StepAppendFunc`.
I only added that as a member (passed via ctor), to be able to to add my own implementation (logging, proxy etc.) instead of the default playwright one.

Just beware: all of this magic oop nonsense (and pw's own `test.step` not accepting args) is a hack. We're storing references and reusing them in essentially lambdas.

We must store at least a ref to a `Page` so things are already dirty even if you don't use steps.

All of these `class` shenanigans are about partially applying functions so we don't have to repeat ourselves and carry around explicitly the `Page` or some other useful thing.

If we were being totally pedantic (don't rely on weird lexical scoping rules or oop nonsense), then things would quickly spiral into the territory of higher order functions with possibly 5+ args, some known at compile time, some known at test start time, while some only known later (aka you have a lot of things flying around, like the WebSocket magic and the message parser working under the hood of neatly simplified Playwright API, configs from you, env vars etc.).
