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
import {
  filterTestStepTree,
  foldTestStepTree,
  listPathUpToParent,
  MergeStep,
} from "../test-step-tree";

export type TreeSummary = {
  testId: string;
  status: string;
  startTime: Date;
  duration: number;
  failPaths: string[];
};

const isFailedLeafStep = (step: TestStep) =>
  step.error !== undefined && step.steps.length === 0;

export default class PathSummaryReporter implements Reporter {
  onBegin?(config: FullConfig, suite: Suite): void;

  onEnd?(result: FullResult): void | Promise<void> {}

  onError?(error: TestError) {}

  onStepBegin?(test: TestCase, result: TestResult, step: TestStep) {}

  onStepEnd?(test: TestCase, result: TestResult, step: TestStep) {}

  onTestBegin?(test: TestCase, result: TestResult) {}

  onTestEnd?(test: TestCase, result: TestResult) {
    const potentialTestId = getTestId(test);
    const testId = potentialTestId === undefined ? "unknown" : potentialTestId;
    const failedSteps = filterTestStepTree(isFailedLeafStep, result);
    const failPaths = failedSteps
      .map(listPathUpToParent)
      .map((path) => path.reverse())
      .map((path) => path.map((step) => step.title).join(" > "));
    const treeSummary: TreeSummary = {
      testId,
      status: result.status,
      startTime: result.startTime,
      duration: result.duration,
      failPaths,
    };
    console.log(
      "Path Summary Reporter - (you could write to file, call some publishing API or whatever)"
    );
    console.log(treeSummary);
  }
}
