import { data } from "./data.js";

// State Management
let state = {
    currentFilter: "all",
    currentSearch: "",
    filteredData: [...data]
};

// DOM Elements
const toolsGrid = document.getElementById("toolsGrid");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const totalToolsEl = document.getElementById("totalTools");
const visibleToolsEl = document.getElementById("visibleTools");
const uniqueCategoriesEl = document.getElementById("uniqueCategories");
const backToTopBtn = document.getElementById("backToTop");

/**
 * Initialize the application
 */
function init() {
    renderCategoryFilters();
    renderTools();
    updateStats();

    // Event Listeners
    searchInput.addEventListener("input", handleSearch);

    // Scroll handling for Back to Top and Header
    window.addEventListener('scroll', () => {
        const controls = document.querySelector('.controls-container');

        // Sticky Header Shadow
        if (window.scrollY > 100) {
            controls.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.5)';
        } else {
            controls.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
        }

        // Back to Top Visibility
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    initDraggableFilter();
}

/**
 * Enable drag-to-scroll for category filter
 */
function initDraggableFilter() {
    const slider = categoryFilter;
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        slider.scrollLeft = scrollLeft - walk;
    });
}

/**
 * Update global statistics
 */
function updateStats() {
    const categories = [...new Set(data.map(item => item.category))];

    // Animate numbers
    animateNumber(totalToolsEl, data.length);
    animateNumber(visibleToolsEl, state.filteredData.length);
    animateNumber(uniqueCategoriesEl, categories.length);
}

function animateNumber(element, target) {
    const duration = 800;
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;

    const update = () => {
        current += increment;
        if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
            element.textContent = target;
        } else {
            element.textContent = Math.round(current);
            requestAnimationFrame(update);
        }
    };
    requestAnimationFrame(update);
}

/**
 * Render category buttons
 */
function renderCategoryFilters() {
    const categories = ["all", ...new Set(data.map(item => item.category))];
    categoryFilter.innerHTML = "";

    categories.forEach(category => {
        const btn = document.createElement("button");
        btn.className = `category-btn ${category === state.currentFilter ? 'active' : ''}`;
        btn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        btn.onclick = () => filterByCategory(category, btn);
        categoryFilter.appendChild(btn);
    });
}

/**
 * Handle category selection
 */
function filterByCategory(category, btn) {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    state.currentFilter = category;
    applyFilters();
}

/**
 * Handle search input
 */
function handleSearch(e) {
    state.currentSearch = e.target.value.toLowerCase();
    applyFilters();
}

/**
 * Filter logic
 */
function applyFilters() {
    state.filteredData = data.filter(tool => {
        const matchesCategory = state.currentFilter === "all" || tool.category === state.currentFilter;
        const matchesSearch = !state.currentSearch ||
            tool.name.toLowerCase().includes(state.currentSearch) ||
            tool.category.toLowerCase().includes(state.currentSearch) ||
            tool.description.toLowerCase().includes(state.currentSearch);

        return matchesCategory && matchesSearch;
    });

    renderTools();
    updateStats();
}

/**
 * Copy URL to clipboard
 */
window.copyToClipboard = (url, btnId) => {
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById(btnId);
        const icon = btn.querySelector('i');

        btn.classList.add('copied');
        icon.className = 'fas fa-check';

        setTimeout(() => {
            btn.classList.remove('copied');
            icon.className = 'far fa-copy';
        }, 2000);
    });
};

/**
 * Render tool cards
 */
function renderTools() {
    toolsGrid.innerHTML = "";

    if (state.filteredData.length === 0) {
        toolsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>We couldn't find any tools matching "${state.currentSearch}"</p>
            </div>
        `;
        return;
    }

    state.filteredData.forEach((tool, index) => {
        const card = document.createElement("div");
        card.className = "tool-card";
        card.style.animation = `fadeInDown 0.5s ease-out forwards ${index * 0.05}s`;
        card.style.opacity = "0";

        const description = tool.description || "Cutting-edge AI tool for professional workflows.";
        const btnId = `copy-btn-${tool.id}`;

        card.innerHTML = `
            <div class="card-top">
                <button class="copy-link-btn" id="${btnId}" onclick="copyToClipboard('${tool.url}', '${btnId}')" title="Copy URL">
                    <i class="far fa-copy"></i>
                </button>
                <span class="badge">${tool.category}</span>
                <h3 class="tool-name">${tool.name}</h3>
            </div>
            <p class="tool-desc">${description}</p>
            <div class="card-actions">
                <a href="${tool.url}" target="_blank" class="tool-link">
                    Visit Website <i class="fas fa-external-link-alt"></i>
                </a>
                <span class="tool-id">#${tool.id}</span>
            </div>
        `;
        toolsGrid.appendChild(card);
    });
}

// Start the app
document.addEventListener("DOMContentLoaded", init);
