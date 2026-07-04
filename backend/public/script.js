document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const allLinks = navLinks ? navLinks.querySelectorAll('a') : [];

    // 1. Toggle Menu when clicking the hamburger
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            // Adds or removes the 'active' class on both elements
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // 2. Auto-Close menu when a link is clicked
    allLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // 3. Go to catalog button (Vanilla JS fallback)
    const goToCatalogBtn = document.getElementById('go-to-catalog-btn');
    if (goToCatalogBtn) {
        goToCatalogBtn.addEventListener('click', () => {
            window.location.href = '/products';
        });
    }

    // 4. Newsletter Subscription AJAX Handler
    document.querySelectorAll('.subscribe-btn').forEach(btn => {
        const formContainer = btn.closest('.newsletter-form') || btn.parentElement;
        if (!formContainer) return;
        const input = formContainer.querySelector('.email-input');
        if (!input) return;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = input.value;
            if (!email || email.trim() === '') {
                alert('Please enter a valid email address.');
                return;
            }

            btn.disabled = true;
            const originalText = btn.textContent;
            btn.textContent = 'SUBSCRIBING...';

            fetch('/api/v1/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({ email: email })
            })
            .then(res => res.json())
            .then(data => {
                btn.disabled = false;
                btn.textContent = originalText;
                if (data.success) {
                    alert(data.message);
                    input.value = '';
                } else {
                    alert(data.message || 'Error subscribing to newsletter.');
                }
            })
            .catch(err => {
                console.error("Newsletter submission error:", err);
                btn.disabled = false;
                btn.textContent = originalText;
                alert('An error occurred. Please try again.');
            });
        });
    });

    // 5. Favorites Toggle AJAX Handler
    document.querySelectorAll('.like-icon').forEach(heartBtn => {
        heartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = heartBtn.getAttribute('data-product-id');
            if (!productId) return;

            // Optimistic UI update
            const isLiked = heartBtn.classList.contains('liked');
            if (isLiked) {
                heartBtn.classList.remove('liked');
                heartBtn.innerHTML = '&#9825;'; // ♡
            } else {
                heartBtn.classList.add('liked');
                heartBtn.innerHTML = '&#9829;'; // ♥
            }

            fetch('/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({ productId })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Update header favorites count badge
                    document.querySelectorAll('.fav-badge').forEach(badge => {
                        badge.textContent = data.favoritesCount;
                    });
                    // Sync state with server response
                    if (data.added) {
                        heartBtn.classList.add('liked');
                        heartBtn.innerHTML = '&#9829;'; // ♥
                    } else {
                        heartBtn.classList.remove('liked');
                        heartBtn.innerHTML = '&#9825;'; // ♡
                        
                        // If we are on the /favorites page, remove the card from the UI
                        if (window.location.pathname === '/favorites') {
                            const card = document.getElementById(`fav-card-${productId}`);
                            if (card) {
                                card.remove();
                                // Check if there are no cards left, if so, reload to show empty state
                                const remainingCards = document.querySelectorAll('.kiko-product-card');
                                if (remainingCards.length === 0) {
                                    window.location.reload();
                                }
                            }
                        }
                    }
                } else {
                    // Revert on failure
                    if (isLiked) {
                        heartBtn.classList.add('liked');
                        heartBtn.innerHTML = '&#9829;';
                    } else {
                        heartBtn.classList.remove('liked');
                        heartBtn.innerHTML = '&#9825;';
                    }
                    alert(data.message || 'Error updating favorites.');
                }
            })
            .catch(err => {
                console.error("Favorites toggle error:", err);
                // Revert
                if (isLiked) {
                    heartBtn.classList.add('liked');
                    heartBtn.innerHTML = '&#9829;';
                } else {
                    heartBtn.classList.remove('liked');
                    heartBtn.innerHTML = '&#9825;';
                }
            });
        });
    });
});