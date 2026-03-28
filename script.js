// Clean up URL to find product names
function cleanQuery(input) {
  try {
    const url = new URL(input);
    // Remove domain, slashes, and common URL junk
    let path = url.pathname.split('/').pop().replaceAll("-", " ").replaceAll("_", " ");
    return path || input;
  } catch {
    return input;
  }
}

async function searchProduct() {
  const inputField = document.getElementById("product");
  const resultsDiv = document.getElementById("results");
  const query = cleanQuery(inputField.value.trim());

  if (!query) return;

  resultsDiv.innerHTML = "<div class='card'>Searching for best deals... 🔍</div>";

  const API_KEY = "YOUR_SERPAPI_KEY_HERE"; // Replace this!
  const targetUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&location=India&api_key=${API_KEY}`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();

    resultsDiv.innerHTML = ""; // Clear loading state

    if (!data.shopping_results || data.shopping_results.length === 0) {
      resultsDiv.innerHTML = "<div class='card'>No results found. Try a different name!</div>";
      return;
    }

    // Show top 6 results
    data.shopping_results.slice(0, 6).forEach(item => {
      const card = document.createElement("div");
      card.className = "card";
      
      card.innerHTML = `
        <b>${item.title.substring(0, 60)}${item.title.length > 60 ? '...' : ''}</b>
        <span class="price-tag">${item.price}</span>
        <span class="source-tag">🌐 ${item.source}</span>
        <a href="${item.link}" target="_blank" class="buy-btn">View on Store</a>
      `;
      resultsDiv.appendChild(card);
    });

  } catch (error) {
    resultsDiv.innerHTML = "<div class='card'>Error fetching data. Check your API key or connection.</div>";
    console.error(error);
  }
}

// Event Listeners
document.getElementById("searchBtn").addEventListener("click", searchProduct);

// Allow pressing 'Enter' to search
document.getElementById("product").addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchProduct();
});
let savedItems = [];

// Initialize data from Chrome Storage
chrome.storage.local.get(["bachatKarSaved"], (res) => {
  savedItems = res.bachatKarSaved || [];
  updateSavedCount();
});

// UI Switching Logic
document.getElementById("tabSearch").onclick = () => switchTab('search');
document.getElementById("tabSaved").onclick = () => {
  switchTab('saved');
  renderSaved();
};

function switchTab(type) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-link').forEach(el => el.classList.remove('active'));
  
  if(type === 'search') {
    document.getElementById('searchSection').style.display = 'block';
    document.getElementById('tabSearch').classList.add('active');
  } else {
    document.getElementById('savedSection').style.display = 'block';
    document.getElementById('tabSaved').classList.add('active');
  }
}

// Save Function
function toggleSave(item) {
  const index = savedItems.findIndex(s => s.link === item.link);
  if (index > -1) {
    savedItems.splice(index, 1);
  } else {
    savedItems.push(item);
  }
  chrome.storage.local.set({ bachatKarSaved: savedItems });
  updateSavedCount();
  renderSaved();
}

function updateSavedCount() {
  document.getElementById("tabSaved").innerText = `Saved (${savedItems.length})`;
}

// Modified Search Display to include Save Button
async function searchProduct() {
  // ... (use previous search fetch logic) ...
  // Inside your forEach loop where you create cards:
  
  const isSaved = savedItems.some(s => s.link === item.link);
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <b>${item.title.substring(0, 50)}...</b>
    <div class="price">${item.price}</div>
    <div class="actions">
      <a href="${item.link}" target="_blank" class="btn-buy">Buy Now</a>
      <button class="btn-save ${isSaved ? 'saved' : ''}" data-id="${item.link}">
        ${isSaved ? '❤️' : '🤍 Save'}
      </button>
    </div>
  `;
  
  card.querySelector('.btn-save').onclick = () => toggleSave(item);
}