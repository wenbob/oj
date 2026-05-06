export async function copyToClipboard(text: string) {
  if (!navigator.clipboard) {
    throw new Error("当前浏览器不支持剪贴板复制");
  }

  await navigator.clipboard.writeText(text);
}
