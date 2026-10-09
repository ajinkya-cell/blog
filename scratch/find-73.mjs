import fs from "fs";

const html = fs.readFileSync("scratch/rendered.html", "utf-8");
const matches = [...html.matchAll(/"\$73"/g)];
for (const m of matches) {
  console.log("Match at:", m.index);
  console.log(html.slice(m.index - 200, m.index + 200));
}
