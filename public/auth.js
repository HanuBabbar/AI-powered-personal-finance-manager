// Check if already logged in
if (localStorage.getItem('token')) {
    window.location.href = 'index.html';
}

const loginPanel = document.getElementById('login-panel');
const registerPanel = document.getElementById('register-panel');

function toggleAuthMode() {
    loginPanel.classList.toggle('hidden');
    registerPanel.classList.toggle('hidden');
}

// Handle Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    try {
        const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.name);
            window.location.href = 'index.html';
        } else {
            errorEl.innerText = data.message || 'Login failed';
        }
    } catch (error) {
        errorEl.innerText = 'Server error to connect';
    }
});

// Handle Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('reg-error');
    
    try {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.name);
            window.location.href = 'index.html';
        } else {
            errorEl.innerText = data.message || 'Registration failed';
        }
    } catch (error) {
        errorEl.innerText = 'Server error to connect';
    }
});
