// Auth Check immediately
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

// Display Name
const userName = localStorage.getItem('userName');
if (userName) {
    document.getElementById('display-name').innerText = userName;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date');
    if(dateInput) dateInput.value = today;
}

setDefaultDate();

// Store local metrics
let metrics = {
    balance: 0,
    income: 0,
    expenses: 0
};

// DOM Elements
const elements = {
    modal: document.getElementById('transaction-modal'),
    form: document.getElementById('transaction-form'),
    list: document.getElementById('transaction-list'),
    balance: document.getElementById('total-balance'),
    income: document.getElementById('total-income'),
    expenses: document.getElementById('total-expenses'),
    aiBtn: document.getElementById('get-advice-btn'),
    aiContainer: document.getElementById('ai-response-container')
};

function openModal() {
    elements.modal.classList.remove('hidden');
}

function closeModal() {
    elements.modal.classList.add('hidden');
    elements.form.reset();
    setDefaultDate();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Fetch all transactions with Auth Token
async function fetchTransactions() {
    try {
        const res = await fetch('/api/transactions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (res.status === 401) {
            logout(); // Token expired
            return;
        }

        const data = await res.json();
        renderTransactions(data);
        calculateMetrics(data);
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
    }
}

function calculateMetrics(transactions) {
    if (!transactions.length) return;
    
    metrics.income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    metrics.expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    metrics.balance = metrics.income - metrics.expenses;
    
    elements.balance.innerText = formatCurrency(metrics.balance);
    elements.income.innerText = "+" + formatCurrency(metrics.income);
    elements.expenses.innerText = "-" + formatCurrency(metrics.expenses);
}

function renderTransactions(transactions) {
    if (transactions.length === 0) {
        elements.list.innerHTML = `<p class="empty-state">No transactions yet. Add some!</p>`;
        return;
    }

    const sorted = transactions.sort((a,b) => new Date(b.date) - new Date(a.date));

    elements.list.innerHTML = sorted.map(t => {
        const isIncome = t.type === 'income';
        return `
            <div class="transaction-item">
                <div class="t-info">
                    <h4>${t.category} ${t.description ? `<span style="font-size:0.8rem; font-weight:normal; color:#8b92a5">(${t.description})</span>` : ''}</h4>
                    <span class="t-date">${new Date(t.date).toLocaleDateString()}</span>
                </div>
                <div class="t-amount ${isIncome ? 'text-success' : 'text-danger'}">
                    ${isIncome ? '+' : '-'}${formatCurrency(t.amount)}
                </div>
            </div>
        `;
    }).join('');
}

async function addTransaction(e) {
    e.preventDefault();
    
    const type = document.getElementById('type').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    const newTx = { type, amount, category, description, date };

    try {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newTx)
        });

        if (res.ok) {
            closeModal();
            fetchTransactions();
        } else if (res.status === 401) {
            logout();
        }
    } catch (error) {
        console.error("Failed to add transaction", error);
    }
}

async function getAIAdvice() {
    elements.aiBtn.innerHTML = '<span class="spinner"></span> Generating...';
    elements.aiBtn.disabled = true;
    
    try {
        const res = await fetch('/api/ai-advisor', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                income: metrics.income,
                expenses: metrics.expenses
            })
        });

        const data = await res.json();
        
        elements.aiContainer.classList.remove('hidden');
        if (res.ok) {
            elements.aiContainer.innerHTML = data.advice;
        } else if (res.status === 401) {
            logout();
        } else {
            elements.aiContainer.innerHTML = `<p class="text-danger">Error: ${data.message || data.error}</p>`;
        }
        
    } catch (error) {
        elements.aiContainer.classList.remove('hidden');
        elements.aiContainer.innerHTML = `<p class="text-danger">Failed to connect to AI service.</p>`;
    } finally {
        elements.aiBtn.innerHTML = 'Generate Insights';
        elements.aiBtn.disabled = false;
    }
}

// Init
fetchTransactions();
