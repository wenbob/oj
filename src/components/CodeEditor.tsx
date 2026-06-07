"use client";

import Editor from "@monaco-editor/react";

export type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
};

export default function CodeEditor({
  value,
  onChange,
  language = "cpp",
  height = "460px",
}: CodeEditorProps) {
  return (
    <div className="overflow-hidden border border-ink-950/15 bg-[#1e1e1e]">
      <Editor
        height={height}
        language={language}
        loading={
          <div className="flex h-full min-h-80 items-center justify-center bg-[#1e1e1e] text-sm font-semibold text-stone-300">
            编辑器加载中...
          </div>
        }
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={{
          fontSize: 14,
          fontFamily: "Consolas, Monaco, 'Courier New', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          detectIndentation: false,
          autoIndent: "advanced",
          formatOnType: true,
          formatOnPaste: true,
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          acceptSuggestionOnCommitCharacter: false,
          acceptSuggestionOnEnter: "off",
          tabCompletion: "off",
          wordBasedSuggestions: "off",
          inlineSuggest: { enabled: false },
          parameterHints: { enabled: false },
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          lineNumbers: "on",
          roundedSelection: false,
          cursorStyle: "line",
          wordWrap: "on",
          folding: true,
        }}
        theme="vs-dark"
        value={value}
      />
    </div>
  );
}
