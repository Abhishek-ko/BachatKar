function extractProduct(input) {
  try {
    const url = new URL(input);

    // Try to extract product words from URL
    let text = url.pathname.replaceAll("-", " ");
    return text;
  } catch {
    return input; // normal search
  }
}

async function searchProduct() {
  let input = document.getElementById("product").value;

  if (!input) return;

  const query = extractProduct(input);

  const apiKey = "PASTE_YOUR_API_KEY";

  const url = `https://serpapi.com/search.json?q=${query}&engine=google_shopping&api_key=${apiKey}`;

  const resultsDiv = document.getElementById("results");

  resultsDiv.innerHTML = "Loading... ⏳";

  const res = await fetch(url);
  const data = await res.json();

  resultsDiv.innerHTML = "";

  if (!data.shopping_results) {
    resultsDiv.innerHTML = "No results found 😢";
    return;
  }

  data.shopping_results.slice(0, 5).forEach(item => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>${item.title.substring(0, 50)}...</b><br>
      💰 ${item.price}<br>
      🏪 ${item.source}<br>
      <a href="${item.link}" target="_blank">Open</a>
    `;

    resultsDiv.appendChild(div);
  });
}