// 観点シート（content/perspectives.md）から、問題の perspective に書ける名前を取り出す。
// 節 1〜7 では表の「観点」の欄、節 8 では「式」の欄の、最初の空白までの式の名前を取り出す。
export function parsePerspectives(markdown: string): Set<string> {
  const names = new Set<string>();
  let section: number | null = null;
  for (const line of markdown.split("\n")) {
    const heading = line.match(/^## (\d+)\./);
    if (heading) {
      section = Number(heading[1]);
      continue;
    }
    if (section === null || !line.startsWith("|")) {
      continue;
    }
    const first = splitRow(line)[0];
    if (
      first === undefined ||
      first === "観点" ||
      first === "式" ||
      /^-+$/.test(first)
    ) {
      continue;
    }
    if (section === 8) {
      const name = first.split(/\s/)[0];
      if (name) {
        names.add(name);
      }
    } else {
      names.add(first);
    }
  }
  return names;
}

// 表の1行を欄に分ける。`\|` は欄の区切りではなく、文字の | として扱う。
function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll("\\|", "|"));
}
