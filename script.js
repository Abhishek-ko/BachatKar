/**
 * BACHATKAR - SMART PRICE TRACKER
 * This script handles searching products via an API and saving them locally.
 */

// --- SECTION 1: CONNECTING TO HTML ---
// We "grab" the elements from our HTML file so JavaScript can talk to them.
const searchBtn = document.getElementById('searchBtn');    // The 'Find Best Price' button
const resultsList = document.getElementById('resultsList'); // The area where search results appear
const savedList = document.getElementById('savedList');     // The area where saved items appear

// --- SECTION 2: THE SEARCH FUNCTION ---
// This function runs when the user clicks the "Find Best Price" button.
searchBtn.onclick = async function() {
    // Get whatever the user typed in the input box
    const query = document.getElementById('userInput').value;
    
    // Your unique key to access the SerpApi data
    const apiKey = "3900543e68e992e123c362a15fd0ab1fbc9fc79072f9289256fee1d00cded059"; 

    // Validation: Don't do anything if the search box is empty
    if (!query) {
        alert("Please enter a product name!");
        return;
    }

    // Tell the user we are working on it
    resultsList.innerHTML = `<div class="loading"><p>Searching for ${query} in India... 🔎</p></div>`;

    /**
     * API FETCHING:
     * proxyUrl: Bypasses browser security (CORS) that blocks direct API calls.
     * targetUrl: The actual request sent to SerpApi with Indian location settings.
     */
    const proxyUrl = "https://cors-anywhere.herokuapp.com/"; 
    const targetUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&location=India&hl=en&gl=in&api_key=${apiKey}`;

    try {
        // We 'await' the fetch so the code waits for the internet to respond
        const response = await fetch(proxyUrl + targetUrl);
        const data = await response.json(); // Convert the raw data into a readable JS Object

        // If the API found products, send the top 5 to the 'displayResults' function
        if (data.shopping_results && data.shopping_results.length > 0) {
            displayResults(data.shopping_results.slice(0, 5)); 
        } else {
            resultsList.innerHTML = "<p>No products found. Try a different name!</p>";
        }
    } catch (error) {
        // If the internet fails or the proxy isn't activated
        resultsList.innerHTML = `<p style="color:red;">Error! Make sure you clicked 'Request access' at the CORS Anywhere demo site.</p>`;
    }
};

// --- SECTION 3: SHOWING RESULTS ON SCREEN ---
// This function takes the data from the API and creates HTML "cards" for each product.
function displayResults(items) {
    resultsList.innerHTML = ""; // Clear the "Searching..." message
    
    items.forEach(product => {
        const card = document.createElement('div');
        card.className = "product-card";
        
        // Ensure we have a valid link, price, and image. Use defaults if missing.
        const productLink = product.link || product.product_link || "#";
        const productTitle = product.title || "Product";
        const productPrice = product.price || "Check Store";
        const productImg = product.thumbnail || "https://via.placeholder.com/80";

        // Injecting the product data into our HTML structure
        card.innerHTML = `
            <img src="${productImg}" style="width:80px; float:right; border-radius:5px;">
            <div style="margin-right: 90px;">
                <strong>${productTitle.substring(0, 60)}...</strong>
                <div class="price" style="color: #e67e22; font-weight: bold; font-size: 1.1em;">${productPrice}</div>
                <p style="font-size: 0.8em; color: #666;">Store: ${product.source}</p>
                <div class="btn-group" style="margin-top: 10px; display: flex; gap: 8px;">
                    <a href="${productLink}" target="_blank" class="buy-link" style="background: #3498db; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 12px;">Visit Store</a>
                    
                    <button class="save-btn" onclick="saveForLater('${productTitle.replace(/'/g, "\\'")}', '${productPrice}', '${productLink}')" style="cursor:pointer; padding: 6px 12px; border-radius: 4px; border: 1px solid #ddd;">⭐ Save</button>
                </div>
            </div>
            <div style="clear: both;"></div>
        `;
        resultsList.appendChild(card);
    });
}

// --- SECTION 4: SAVING DATA (LOCAL STORAGE) ---
// We pull any previously saved items from the browser's memory, or start an empty list [].
let savedItems = JSON.parse(localStorage.getItem('mySavedDeals')) || [];

function saveForLater(name, price, link) {
    // Don't save the same item twice (check by link)
    if (savedItems.some(item => item.link === link)) {
        alert("Already in your list!");
        return;
    }
    
    // Add the new item to our array
    savedItems.push({ name, price, link });
    
    // Save the updated array back to the browser's permanent memory (LocalStorage)
    localStorage.setItem('mySavedDeals', JSON.stringify(savedItems));
    
    // Refresh the "Saved" section on the screen
    renderSavedSection();
}

// This function draws our "Saved for Later" list
function renderSavedSection() {
    savedList.innerHTML = "";
    
    if (savedItems.length === 0) {
        savedList.innerHTML = "<p style='color:#999; font-size: 12px;'>No saved items yet.</p>";
        return;
    }
    
    savedItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.style = "background: #f9f9f9; padding: 10px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #27ae60;";
        
        // FIX: The name is now a clickable link that opens the store
        div.innerHTML = `
            <div style="flex: 1;">
                <a href="${item.link}" target="_blank" style="text-decoration: none; color: #2c3e50; font-weight: bold; font-size: 0.85em; display: block;">
                    ${item.name.substring(0, 35)}...
                </a>
                <span style="color: #e67e22; font-weight: bold; font-size: 0.9em;">${item.price}</span>
            </div>
            <button onclick="removeItem(${index})" style="background: #ff7675; border: none; color: white; cursor: pointer; padding: 4px 8px; border-radius: 4px; font-size: 10px;">Remove</button>
        `;
        savedList.appendChild(div);
    });
}

// Function to delete a saved item
window.removeItem = function(index) {
    savedItems.splice(index, 1); // Remove from array
    localStorage.setItem('mySavedDeals', JSON.stringify(savedItems)); // Update memory
    renderSavedSection(); // Refresh UI
}

// Run this when the page first opens so the user sees their old saved items
renderSavedSection();