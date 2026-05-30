document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       SCROLL EFFECTS & NAVIGATION
       ========================================================================== */
    const header = document.querySelector('.header');
    
    // Add box shadow and glassmorphism to header on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close mobile menu on nav link click
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });


    /* ==========================================================================
       SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.15, // Trigger when 15% of element is visible
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });


    /* ==========================================================================
       TIMELINE / MODULE TABS LOGIC
       ========================================================================== */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const moduleContents = document.querySelectorAll('.module-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetMonth = button.getAttribute('data-month');

            // 1. Update Active Class on Buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 2. Crossfade Active Module Content
            moduleContents.forEach(content => {
                content.classList.remove('active');
                if (content.getAttribute('id') === `module-${targetMonth}`) {
                    content.classList.add('active');
                }
            });
        });
    });



    /* ==========================================================================
       CUSTOM CANVAS-BASED CONFETTI PARTICLE SYSTEM
       ========================================================================== */
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId = null;

    // Resize canvas to full screen
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class ConfettiParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 6;
            this.color = getRandomColor();
            this.speedX = Math.random() * 12 - 6;
            this.speedY = Math.random() * -15 - 5; // Launch upward
            this.gravity = 0.4;
            this.drag = 0.98;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
            this.opacity = 1;
            this.fadeSpeed = Math.random() * 0.01 + 0.005;
        }

        update() {
            this.speedX *= this.drag;
            this.speedY += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            this.opacity -= this.fadeSpeed;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    function getRandomColor() {
        const colors = [
            '#ff8a5c', // Secondary orange
            '#0b6a47', // Primary Green
            '#1fa8a4', // Teal
            '#468faf', // Sky blue
            '#ffbe0b', // Yellow
            '#ff5252', // Red
            '#9c27b0'  // Purple
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function createConfettiBurst(originX, originY, count = 60) {
        for (let i = 0; i < count; i++) {
            particles.push(new ConfettiParticle(originX, originY));
        }
        
        // Start animation loop if not running
        if (!animationFrameId) {
            animateConfetti();
        }
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update & Draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();

            // Remove particles that are invisible or off-screen
            if (p.opacity <= 0 || p.y > canvas.height) {
                particles.splice(i, 1);
            }
        }

        if (particles.length > 0) {
            animationFrameId = requestAnimationFrame(animateConfetti);
        } else {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Expose triggerConfetti function to the window object so it can be called inline in HTML
    window.triggerConfetti = function(badgeName) {
        // Trigger a burst from center-bottom of screen (like standard launcher) and card center
        const screenX = window.innerWidth / 2;
        const screenY = window.innerHeight * 0.85;

        // Sound or log context for the user
        console.log(`Unlocked Badge: ${badgeName}`);
        
        // Double burst: bottom center and a random side burst
        createConfettiBurst(screenX, screenY, 80);
        createConfettiBurst(screenX - 200, screenY - 50, 40);
        createConfettiBurst(screenX + 200, screenY - 50, 40);
    };

    /* ==========================================================================
       3D STACKED CARD DECK CAROUSEL WITH DRAG & GESTURE SWIPES
       ========================================================================== */
    const cards = document.querySelectorAll('.deck-card');
    const dotsContainer = document.querySelector('.deck-dots');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    
    let activeIndex = 0;
    const totalCards = cards.length;

    if (totalCards > 0) {
        // Create pagination dots dynamically
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalCards; i++) {
                const dot = document.createElement('div');
                dot.classList.add('deck-dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    if (i !== activeIndex) {
                        goToCard(i);
                    }
                });
                dotsContainer.appendChild(dot);
            }
        }

        // Layout the cards in a 3D perspective stack
        function updateDeck() {
            const dots = document.querySelectorAll('.deck-dot');
            
            cards.forEach((card, index) => {
                // Calculate circular index distance from activeIndex
                let offset = index - activeIndex;
                if (offset < 0) {
                    offset += totalCards;
                }
                
                // Clear state classes and transition overrides
                card.classList.remove('active-card', 'swipe-left', 'swipe-right');
                card.style.transition = '';
                
                if (offset === 0) {
                    // Top Card (Fully visible and interactive)
                    card.classList.add('active-card');
                    card.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
                    card.style.opacity = '1';
                    card.style.zIndex = '15';
                } else if (offset === 1) {
                    // First Card Behind Top
                    card.style.transform = 'translate3d(0, -20px, -60px) rotate(2deg) scale(0.95)';
                    card.style.opacity = '0.9';
                    card.style.zIndex = '14';
                } else if (offset === 2) {
                    // Second Card Behind Top
                    card.style.transform = 'translate3d(0, -40px, -120px) rotate(-2deg) scale(0.9)';
                    card.style.opacity = '0.7';
                    card.style.zIndex = '13';
                } else if (offset === 3) {
                    // Third Card Behind Top
                    card.style.transform = 'translate3d(0, -60px, -180px) rotate(1.5deg) scale(0.85)';
                    card.style.opacity = '0.45';
                    card.style.zIndex = '12';
                } else {
                    // Stack tail (hidden cards)
                    card.style.transform = 'translate3d(0, -80px, -240px) scale(0.8)';
                    card.style.opacity = '0';
                    card.style.zIndex = '1';
                }
            });

            // Update dots
            if (dots.length > 0) {
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === activeIndex);
                });
            }
        }

        // Swipe top card to the left and advance
        function nextCard() {
            const currentCard = cards[activeIndex];
            currentCard.classList.add('swipe-left');
            
            setTimeout(() => {
                activeIndex = (activeIndex + 1) % totalCards;
                updateDeck();
            }, 300);
        }

        // Pull the back-most card into the front from the left side
        function prevCard() {
            activeIndex = (activeIndex - 1 + totalCards) % totalCards;
            const incomingCard = cards[activeIndex];
            
            // Render it far left instantly with high z-index before transition
            incomingCard.style.transition = 'none';
            incomingCard.style.transform = 'translate3d(-400px, 80px, 150px) rotate(-28deg)';
            incomingCard.style.opacity = '0';
            incomingCard.style.zIndex = '20';
            
            // Force browser layout repaint
            incomingCard.offsetHeight;
            
            // Animate it onto the front of the stack
            incomingCard.style.transition = '';
            updateDeck();
        }

        function goToCard(targetIndex) {
            if (targetIndex > activeIndex) {
                const currentCard = cards[activeIndex];
                currentCard.classList.add('swipe-left');
                setTimeout(() => {
                    activeIndex = targetIndex;
                    updateDeck();
                }, 300);
            } else {
                activeIndex = targetIndex;
                updateDeck();
            }
        }

        // Click listeners for arrows
        if (nextBtn) nextBtn.addEventListener('click', nextCard);
        if (prevBtn) prevBtn.addEventListener('click', prevCard);

        // --- Drag-to-Swipe Mechanics ---
        let isDragging = false;
        let startX = 0;
        let currentX = 0;

        function handleDragStart(e) {
            if (!e.currentTarget.classList.contains('active-card')) return;
            isDragging = true;
            startX = e.clientX || e.touches[0].clientX;
            e.currentTarget.style.transition = 'none';
        }

        function handleDragMove(e) {
            if (!isDragging) return;
            const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
            currentX = clientX - startX;
            
            const activeCard = cards[activeIndex];
            if (activeCard) {
                const rotate = currentX * 0.06;
                const translateY = Math.abs(currentX) * 0.15;
                // Add translation offset inside the stack coordinate space
                activeCard.style.transform = `translate3d(${currentX}px, ${translateY}px, 50px) rotate(${rotate}deg)`;
            }
        }

        function handleDragEnd() {
            if (!isDragging) return;
            isDragging = false;
            
            const activeCard = cards[activeIndex];
            if (!activeCard) return;
            
            activeCard.style.transition = '';
            
            // Trigger swipe out if drag exceeds threshold (120px)
            if (Math.abs(currentX) > 120) {
                if (currentX > 0) {
                    activeCard.classList.add('swipe-right');
                    setTimeout(() => {
                        activeIndex = (activeIndex + 1) % totalCards;
                        updateDeck();
                    }, 300);
                } else {
                    activeCard.classList.add('swipe-left');
                    setTimeout(() => {
                        activeIndex = (activeIndex + 1) % totalCards;
                        updateDeck();
                    }, 300);
                }
            } else {
                // Return card to original resting state
                activeCard.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
            }
            
            currentX = 0;
        }

        // Bind events to each card
        cards.forEach(card => {
            // Mouse
            card.addEventListener('mousedown', handleDragStart);
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            
            // Touch (Mobile)
            card.addEventListener('touchstart', handleDragStart, { passive: true });
            window.addEventListener('touchmove', handleDragMove, { passive: true });
            window.addEventListener('touchend', handleDragEnd);
        });

        // Initialize the presentation
        updateDeck();
    }

});
