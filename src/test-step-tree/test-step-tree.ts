import { TestResult, TestStep } from "@playwright/test/types/testReporter";

export type MergeStep<T> = (accumulator: T, testStep: TestStep) => T;

export const foldTestStepTree = <T>(
  mergeStep: MergeStep<T>,
  initial: T,
  testResult: TestResult
): T => {
  for (const step of testResult.steps) {
    initial = foldTestStep(mergeStep, initial, step);
  }
  return initial;
};

const foldTestStep = <T>(
  mergeStep: MergeStep<T>,
  initial: T,
  step: TestStep
): T => {
  initial = mergeStep(initial, step);
  for (const childStep of step.steps) {
    initial = foldTestStep(mergeStep, initial, childStep);
  }
  return initial;
};

export type PredicateForStep = (testStep: TestStep) => boolean;

export const filterTestStepTree = (
  pred: PredicateForStep,
  testResult: TestResult
): TestStep[] => {
  const init: TestStep[] = [];
  return foldTestStepTree(
    (accu, step) => {
      if (pred(step)) {
        accu.push(step);
      }
      return accu;
    },
    init,
    testResult
  );
};

export const listPathUpToParent = (step: TestStep) => {
  let current: TestStep | undefined = step;
  const pathToParent: TestStep[] = [];
  while (current !== undefined) {
    pathToParent.push(current);
    current = current.parent;
  }
  return pathToParent;
};
