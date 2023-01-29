import { TestCase } from "@playwright/test/types/testReporter";
import { PwTest } from "../core/playwright-api";

export type AnnotationMaybeDescription = {
  type: string;
  description?: string;
};

export type AnnotationWithDescription = {
  type: string;
  description: string;
};

export const hasDescription = (
  annotation: AnnotationMaybeDescription
): annotation is AnnotationWithDescription => {
  return annotation.description !== undefined;
};

export const TEST_ID_ANNOTATION = "custom-id";

export const testIdAnnotation = (
  description: string
): AnnotationWithDescription => ({
  type: TEST_ID_ANNOTATION,
  description,
});

export const withTestId = (test: PwTest, value: string): void => {
  const annotations = test.info().annotations;
  annotations.push(testIdAnnotation(value));
};

export const getTestId = (test: TestCase): string | undefined => {
  const annotations = test.annotations;
  const testIds = annotations
    .filter((annotation) => annotation.type === TEST_ID_ANNOTATION)
    .filter(hasDescription);
  return testIds.length === 0 ? undefined : testIds[0].description;
};
