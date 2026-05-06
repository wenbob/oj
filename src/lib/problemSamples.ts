export type DisplaySample = {
  id?: number;
  input: string;
  output: string;
};

export function getDisplaySamples({
  sampleInput,
  sampleOutput,
  testCases,
}: {
  sampleInput: string;
  sampleOutput: string;
  testCases: DisplaySample[];
}) {
  if (testCases.length > 0) {
    return testCases;
  }

  if (sampleInput.trim() || sampleOutput.trim()) {
    return [{ input: sampleInput, output: sampleOutput }];
  }

  return [];
}
