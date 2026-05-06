type ProblemSample = {
  id?: number;
  input: string;
  output: string;
};

export function ProblemSamples({
  samples,
}: {
  samples: ProblemSample[];
}) {
  if (samples.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-black">样例</h2>
      <div className="mt-4 grid gap-6">
        {samples.map((sample, index) => (
          <div className="grid gap-4 md:grid-cols-2" key={sample.id ?? index}>
            <SampleBlock title={`样例输入 ${index + 1}`} value={sample.input} />
            <SampleBlock title={`样例输出 ${index + 1}`} value={sample.output} />
          </div>
        ))}
      </div>
    </section>
  );
}

function SampleBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <h3 className="text-sm font-black text-ink-800">{title}</h3>
      <pre className="mt-2 overflow-x-auto border border-ink-950/10 bg-white/70 p-4 text-sm leading-6 text-ink-950">
        {value}
      </pre>
    </div>
  );
}
