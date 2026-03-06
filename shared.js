/* ===== Shared Game State (persisted in localStorage) ===== */

function loadGameState() {
    const saved = localStorage.getItem('pixelMarketplace');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return {
                balance: parsed.balance ?? 100000,
                inventory: parsed.inventory ?? {},
                currentModal: null
            };
        } catch (e) { /* fall through */ }
    }
    return { balance: 100000, inventory: {}, currentModal: null };
}

function saveGameState(state) {
    localStorage.setItem('pixelMarketplace', JSON.stringify({
        balance: state.balance,
        inventory: state.inventory
    }));
}

const gameState = loadGameState();

/* ===== Product Modal ===== */
function showProductModal(el) {
    const product = el.dataset.product;
    const price = el.dataset.price;
    const description = el.dataset.description;
    if (!product) return;
    gameState.currentModal = { type: 'product', product, price: parseInt(price) };
    document.getElementById('modal-title').textContent = product;
    document.getElementById('modal-description').textContent = description;
    document.getElementById('modal-price').textContent = 'Price: $' + parseInt(price).toLocaleString();
    document.getElementById('modal').style.display = 'block';
}

function purchaseItem() {
    const modal = gameState.currentModal;
    if (!modal) return;
    if (gameState.balance < modal.price) {
        alert('Insufficient balance! You need $' + (modal.price - gameState.balance).toLocaleString() + ' more.');
        return;
    }
    gameState.balance -= modal.price;
    if (modal.type === 'product') {
        gameState.inventory[modal.product] = (gameState.inventory[modal.product] || 0) + 1;
        alert('Purchased ' + modal.product + ' for $' + modal.price.toLocaleString());
    }
    saveGameState(gameState);
    updateUI();
    closeModal();
}

/* ===== Staff Chat ===== */
function chatWithStaff(el) {
    const nameEl = el.querySelector('a-text');
    if (!nameEl) return;
    const staffName = nameEl.getAttribute('value');
    const msgs = [
        'Welcome! Let me know if you need help finding anything.',
        'We have new arrivals this week — take a look around!',
        'Everything you see is in stock and ready to go.',
        'Need a recommendation? I know every item here.',
        'Great choice coming in today. Happy shopping!'
    ];
    alert(staffName + ': "' + msgs[Math.floor(Math.random() * msgs.length)] + '"');
}

/* ===== UI ===== */
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    gameState.currentModal = null;
}

function updateUI() {
    document.getElementById('balance').textContent = gameState.balance.toLocaleString();
    const list = document.getElementById('inventory-list');
    const items = Object.entries(gameState.inventory);
    if (items.length === 0) {
        list.innerHTML = '<div class="inventory-item">Empty - Start shopping!</div>';
        document.getElementById('sell-price').textContent = '0';
    } else {
        let html = '', total = 0;
        items.forEach(([item, count]) => {
            html += '<div class="inventory-item">' + item + ' x' + count + '</div>';
            total += count * 50;
        });
        list.innerHTML = html;
        document.getElementById('sell-price').textContent = total.toLocaleString();
    }
}

function sellInventory() {
    let total = 0;
    Object.values(gameState.inventory).forEach(c => { total += c * 50; });
    if (total === 0) { alert('Your inventory is empty!'); return; }
    gameState.balance += total;
    gameState.inventory = {};
    alert('Sold all items for $' + total.toLocaleString());
    saveGameState(gameState);
    updateUI();
}

/* ===== Store page helpers ===== */
function initStorePage() {
    const scene = document.querySelector('a-scene');
    function setup() {
        // Wire product clicks
        document.querySelectorAll('.product').forEach(el => {
            el.addEventListener('click', function (e) {
                e.stopPropagation();
                showProductModal(this);
            });
        });
        // Wire staff clicks
        document.querySelectorAll('[id^="staff-"]').forEach(el => {
            el.addEventListener('click', function (e) {
                e.stopPropagation();
                chatWithStaff(this);
            });
        });
        // Start exit proximity check
        startExitProximityCheck();
        updateUI();
    }
    scene.addEventListener('loaded', setup);
    if (scene.hasLoaded) setup();
}

function exitToMarketplace() {
    saveGameState(gameState);
    window.location.href = 'index.html';
}

function startExitProximityCheck() {
    const EXIT_RADIUS = 3;
    const exitDoorEl = document.querySelector('.exit-door');
    if (!exitDoorEl) return;

    const worldPos = new THREE.Vector3();
    const doorWorldPos = new THREE.Vector3();

    setInterval(function () {
        const cam = document.getElementById('camera');
        if (!cam) return;
        cam.object3D.getWorldPosition(worldPos);
        exitDoorEl.object3D.getWorldPosition(doorWorldPos);
        const dx = worldPos.x - doorWorldPos.x;
        const dz = worldPos.z - doorWorldPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < EXIT_RADIUS) {
            exitToMarketplace();
        }
    }, 250);
}

/* ===== Misc ===== */
window.onclick = function (e) {
    if (e.target === document.getElementById('modal')) closeModal();
};

window.addEventListener('load', initStorePage);
