const projectId = "a2vuctp3";
const dataset = "production";
const token = "sk5FLqfyLXMqoXkPQjssQuTjWwJwvBMiqFqZIYv8lIkwsJzbIARNL8vlmmS4wByGwzFL8YbRpSemSO0o9CNj4PrPWM8DgKoYBh8HTqMN0mPxj5gMDcKgMgPFYpSvZNxwWQKwEM045VxkNjcThVwBA8yyeU1paDCK40BRt7nkrGSIrfnVbjZt";

async function main() {
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent('*[_id == "blog-rich-text-showcase"]{ _id, title, slug, "blockCount": count(richText) }')}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log("Document in Sanity:", data.result);
}

main().catch(console.error);
