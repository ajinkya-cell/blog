import fs from "fs";

const projectId = "a2vuctp3";
const dataset = "production";
const token = "sk5FLqfyLXMqoXkPQjssQuTjWwJwvBMiqFqZIYv8lIkwsJzbIARNL8vlmmS4wByGwzFL8YbRpSemSO0o9CNj4PrPWM8DgKoYBh8HTqMN0mPxj5gMDcKgMgPFYpSvZNxwWQKwEM045VxkNjcThVwBA8yyeU1paDCK40BRt7nkrGSIrfnVbjZt";

const slugs = [
  "the-architecture-of-long-lived-software",
  "nextjs-16-cache-components",
  "writing-as-a-compounding-superpower"
];

async function checkBlog(slug) {
  const url = `http://localhost:3000/blog/${slug}`;
  const res = await fetch(url);
  const text = await res.text();
  const is404 = text.includes("The page you are looking for does not exist");
  console.log(`URL ${url} -> status: ${res.status}, is404: ${is404}`);
}

async function main() {
  for (const slug of slugs) {
    await checkBlog(slug);
  }
}

main().catch(console.error);
