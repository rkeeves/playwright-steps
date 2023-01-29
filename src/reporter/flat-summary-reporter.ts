import {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult,
  TestStep,
} from "@playwright/test/types/testReporter";
import { getTestId } from "../annotation";
import { foldTestStepTree, MergeStep } from "../test-step-tree";

export type FlatSummary = {
  testId: string;
  status: string;
  startTime: Date;
  duration: number;
  failedSteps: string[];
};

const stepMerger: MergeStep<string[]> = (
  failedSteps: string[],
  testStep: TestStep
) => {
  if (testStep.error !== undefined) {
    failedSteps.push(testStep.title);
  }
  return failedSteps;
};

export default class FlatSummaryReporter implements Reporter {
  onBegin?(config: FullConfig, suite: Suite): void;

  onEnd?(result: FullResult): void | Promise<void> {}

  onError?(error: TestError) {}

  onStepBegin?(test: TestCase, result: TestResult, step: TestStep) {}

  onStepEnd?(test: TestCase, result: TestResult, step: TestStep) {}

  onTestBegin?(test: TestCase, result: TestResult) {}

  onTestEnd?(test: TestCase, result: TestResult) {
    const potentialTestId = getTestId(test);
    const testId = potentialTestId === undefined ? "unknown" : potentialTestId;
    const failedSteps = foldTestStepTree(stepMerger, [], result);
    const flatSummary: FlatSummary = {
      testId,
      status: result.status,
      startTime: result.startTime,
      duration: result.duration,
      failedSteps,
    };
    console.log(
      "Flat Summary Reporter - (you could write to file, call some publishing API or whatever)"
    );
    console.log(flatSummary);
  }
}
