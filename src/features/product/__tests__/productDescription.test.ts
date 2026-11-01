import { parseProductDescription } from "../utils/productDescription";

describe("parseProductDescription", () => {
  it("keeps bold text inside a paragraph and drops the tags", () => {
    expect(
      parseProductDescription("<p><strong>Dolo 650 Tablet</strong> is used for fever.</p>"),
    ).toEqual([
      {
        spans: [
          { text: "Dolo 650 Tablet", bold: true },
          { text: " is used for fever.", bold: false },
        ],
      },
    ]);
  });

  it("leaves plain text unchanged", () => {
    expect(parseProductDescription("Pain and fever relief")).toEqual([
      { spans: [{ text: "Pain and fever relief", bold: false }] },
    ]);
  });

  it("turns paragraphs and line breaks into separate readable lines", () => {
    expect(parseProductDescription("<p>First line<br>second line</p><p>Next paragraph</p>")).toEqual([
      {
        spans: [{ text: "First line\nsecond line", bold: false }],
      },
      {
        spans: [{ text: "Next paragraph", bold: false }],
      },
    ]);
  });

  it("decodes common entities and removes other tags", () => {
    expect(parseProductDescription("<p>Fever &amp; pain <em>relief</em></p>")).toEqual([
      { spans: [{ text: "Fever & pain relief", bold: false }] },
    ]);
  });
});
