async function testClientNavigation() {
  const routerStateTree = JSON.stringify([
    "",
    {
      children: [
        "blog",
        {
          children: ["__PAGE__", {}]
        }
      ]
    },
    null,
    null,
    true
  ]);

  const res = await fetch("http://localhost:3000/blog/the-architecture-of-long-lived-software?_rsc=HEAvJdHAQJrUAe2K", {
    headers: {
      "RSC": "1",
      "Next-Router-State-Tree": encodeURIComponent(routerStateTree),
    }
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log(text.slice(0, 2000));
}

testClientNavigation().catch(console.error);
