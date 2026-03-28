// 1. Link our HTML elements to JavaScript variables
const searchBtn = document.getElementById('searchBtn');
const resultsList = document.getElementById('resultsList');
const savedList = document.getElementById('savedList');

// 2. The Main Function: What happens when you click "Search"
searchBtn.onclick = async function() {
    const query = document.getElementById('userInput').value;
    const apiKey = "PASTE_YOUR_SERPAPI_KEY_HERE"; // Put your key here

    if (!query) {
        alert("Please enter a product name!");
        return;
    }

    // Show a loading state to the user
    resultsList.innerHTML = `
        <div class="loading">
            <p>Searching the web for the best ${query} prices... 🔎</p>
        </div>
    `;

    // 3. The API Fetch: Going to the internet to get data
    // We use a "Proxy" (cors-anywhere) because browsers block direct API calls for security
    const proxyUrl = "https://cors-anywhere.herokuapp.com/"; 
    const targetUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&api_key=${apiKey}`;

    try {
        const response = await fetch(proxyUrl + targetUrl);
        const data = await response.json();

        // 4. Handle the results
        if (data.shopping_results) {
            displayResults(data.shopping_results.slice(0, 5)); // Show top 5 items
        } else {
            resultsList.innerHTML = "<p>No products found. Try another search!</p>";
        }
    } catch (error) {
        resultsList.innerHTML = "<p>Error: Please enable the Demo Proxy at 'https://cors-anywhere.herokuapp.com/corsdemo' then try again!</p>";
    }
};

// 5. Function to build the UI cards
function displayResults(items) {
    resultsList.innerHTML = ""; // Clear loading text

    items.forEach(product => {
        const card = document.createElement('div');
        card.className = "product-card";
        
        // We use innerHTML to "inject" the product data into our CSS-styled cards
        card.innerHTML = `
            <img src="${product.thumbnail}" style="width:80px; float:right; border-radius:5px;">
            <strong>${product.title.substring(0, 50)}...</strong>
            <div class="price">${product.price}</div>
            <p>Store: ${product.source}</p>
            <div class="btn-group">
                <a href="${product.link}" target="_blank" class="buy-link">Visit Store</a>
                <button class="save-btn" onclick="saveForLater('${product.title}', '${product.price}')">⭐ Save</button>
            </div>
        `;
        resultsList.appendChild(card);
    });
}

// 6. Save for Later logic (using an Array)
let savedItems = JSON.parse(localStorage.getItem('mySavedDeals')) || [];

function saveForLater(name, price) {
    savedItems.push({ name, price });
    localStorage.setItem('mySavedDeals', JSON.stringify(savedItems)); // Save to browser memory
    renderSavedSection();
}

function renderSavedSection() {
    savedList.innerHTML = "";
    savedItems.forEach(item => {
        const p = document.createElement('p');
        p.className = "saved-item";
        p.innerText = `✅ ${item.name} - ${item.price}`;
        savedList.appendChild(p);
    });
}

// Show saved items when page loads
renderSavedSection();