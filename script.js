/**
 * Accessible University - JavaScript
 * WCAG 2.2 AAA Compliant Interactive Features
 */

(function() {
    'use strict';

    // ============================================
    // MOBILE NAVIGATION
    // ============================================
    
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle aria-expanded
            this.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle aria-hidden on nav
            mainNav.setAttribute('aria-hidden', isExpanded);
            
            // Toggle body scroll
            if (!isExpanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenuToggle.getAttribute('aria-expanded') === 'true') {
                mobileMenuToggle.click();
                mobileMenuToggle.focus();
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mainNav.contains(e.target) && 
                !mobileMenuToggle.contains(e.target) && 
                mobileMenuToggle.getAttribute('aria-expanded') === 'true') {
                mobileMenuToggle.click();
            }
        });
    }

    // ============================================
    // SMOOTH SCROLLING WITH FOCUS MANAGEMENT
    // ============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Close mobile menu if open
                if (mobileMenuToggle && mobileMenuToggle.getAttribute('aria-expanded') === 'true') {
                    mobileMenuToggle.click();
                }
                
                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Set focus to target for screen readers
                // Add tabindex if not already focusable
                if (!targetElement.hasAttribute('tabindex')) {
                    targetElement.setAttribute('tabindex', '-1');
                }
                
                // Focus the element
                targetElement.focus();
                
                // Update URL without jumping
                history.pushState(null, null, href);
            }
        });
    });

    // ============================================
    // HIGH CONTRAST MODE TOGGLE
    // ============================================
    
    const contrastToggle = document.getElementById('contrast-toggle');
    
    if (contrastToggle) {
        // Check for saved preference
        const highContrastEnabled = localStorage.getItem('highContrast') === 'true';
        
        if (highContrastEnabled) {
            document.body.classList.add('high-contrast');
            contrastToggle.setAttribute('aria-pressed', 'true');
        }
        
        contrastToggle.addEventListener('click', function() {
            const isPressed = this.getAttribute('aria-pressed') === 'true';
            
            // Toggle high contrast class
            document.body.classList.toggle('high-contrast');
            
            // Update aria-pressed
            this.setAttribute('aria-pressed', !isPressed);
            
            // Save preference
            localStorage.setItem('highContrast', !isPressed);
            
            // Announce change to screen readers
            announceToScreenReader(
                !isPressed ? 'High contrast mode enabled' : 'High contrast mode disabled'
            );
        });
    }

    // ============================================
    // FONT SIZE CONTROLS
    // ============================================
    
    const fontSizeIncrease = document.getElementById('font-size-increase');
    const fontSizeDecrease = document.getElementById('font-size-decrease');
    
    let currentFontScale = parseFloat(localStorage.getItem('fontScale')) || 1;
    const minScale = 0.8;
    const maxScale = 1.5;
    const scaleStep = 0.1;
    
    // Apply saved font scale
    document.documentElement.style.setProperty('--font-size-scale', currentFontScale);
    
    if (fontSizeIncrease) {
        fontSizeIncrease.addEventListener('click', function() {
            if (currentFontScale < maxScale) {
                currentFontScale = Math.min(currentFontScale + scaleStep, maxScale);
                updateFontSize();
                announceToScreenReader('Font size increased');
            } else {
                announceToScreenReader('Maximum font size reached');
            }
        });
    }
    
    if (fontSizeDecrease) {
        fontSizeDecrease.addEventListener('click', function() {
            if (currentFontScale > minScale) {
                currentFontScale = Math.max(currentFontScale - scaleStep, minScale);
                updateFontSize();
                announceToScreenReader('Font size decreased');
            } else {
                announceToScreenReader('Minimum font size reached');
            }
        });
    }
    
    function updateFontSize() {
        document.documentElement.style.setProperty('--font-size-scale', currentFontScale);
        localStorage.setItem('fontScale', currentFontScale);
    }

    // ============================================
    // BACK TO TOP BUTTON
    // ============================================
    
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.removeAttribute('hidden');
            } else {
                backToTopButton.setAttribute('hidden', '');
            }
        });
        
        // Scroll to top on click
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Focus on skip link after scrolling
            setTimeout(function() {
                const skipLink = document.querySelector('.skip-link');
                if (skipLink) {
                    skipLink.focus();
                }
            }, 500);
        });
    }

    // ============================================
    // FORM VALIDATION & ACCESSIBILITY
    // ============================================
    
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        // Add real-time validation feedback
        const formInputs = contactForm.querySelectorAll('input, select, textarea');
        
        formInputs.forEach(input => {
            // Add placeholder for better UX (but not relying on it for labels)
            if (input.type === 'text' || input.type === 'email') {
                const label = contactForm.querySelector(`label[for="${input.id}"]`);
                if (label) {
                    input.setAttribute('placeholder', label.textContent.replace('*', '').trim());
                }
            }
            
            // Live validation feedback
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                // Clear error state when user starts typing
                if (this.hasAttribute('aria-invalid')) {
                    validateField(this);
                }
            });
        });
        
        // Form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const firstInvalidField = null;
            
            // Validate all fields
            formInputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                    if (!firstInvalidField) {
                        firstInvalidField = input;
                    }
                }
            });
            
            if (isValid) {
                // Show success message
                showFormMessage('success', 'Thank you! Your message has been sent successfully.');
                contactForm.reset();
                
                // Announce to screen readers
                announceToScreenReader('Form submitted successfully');
            } else {
                // Focus first invalid field
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
                
                // Announce error to screen readers
                announceToScreenReader('Form has errors. Please correct them and try again.');
            }
        });
    }
    
    function validateField(field) {
        const errorId = field.id + '-error';
        let errorMessage = '';
        let isValid = true;
        
        // Remove existing error message
        const existingError = document.getElementById(errorId);
        if (existingError) {
            existingError.remove();
        }
        
        // Check validity
        if (field.hasAttribute('required') && !field.value.trim()) {
            errorMessage = 'This field is required.';
            isValid = false;
        } else if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                errorMessage = 'Please enter a valid email address.';
                isValid = false;
            }
        }
        
        // Update ARIA attributes
        if (!isValid) {
            field.setAttribute('aria-invalid', 'true');
            field.setAttribute('aria-describedby', errorId);
            
            // Create and insert error message
            const errorElement = document.createElement('span');
            errorElement.id = errorId;
            errorElement.className = 'error-message';
            errorElement.setAttribute('role', 'alert');
            errorElement.style.color = 'var(--color-error)';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '0.25rem';
            errorElement.style.display = 'block';
            errorElement.textContent = errorMessage;
            
            field.parentNode.appendChild(errorElement);
        } else {
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');
        }
        
        return isValid;
    }
    
    function showFormMessage(type, message) {
        const formWrapper = document.querySelector('.contact-form-wrapper');
        
        // Remove existing messages
        const existingMessage = formWrapper.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'form-message';
        messageElement.setAttribute('role', 'alert');
        messageElement.style.padding = 'var(--spacing-md)';
        messageElement.style.marginBottom = 'var(--spacing-md)';
        messageElement.style.borderRadius = 'var(--border-radius)';
        messageElement.style.fontWeight = '600';
        
        if (type === 'success') {
            messageElement.style.backgroundColor = '#d1fae5';
            messageElement.style.color = '#065f46';
            messageElement.style.border = '2px solid #10b981';
        } else {
            messageElement.style.backgroundColor = '#fee2e2';
            messageElement.style.color = '#991b1b';
            messageElement.style.border = '2px solid #dc2626';
        }
        
        messageElement.textContent = message;
        
        // Insert before form
        contactForm.parentNode.insertBefore(messageElement, contactForm);
        
        // Focus the message for screen readers
        messageElement.setAttribute('tabindex', '-1');
        messageElement.focus();
    }

    // ============================================
    // KEYBOARD NAVIGATION ENHANCEMENTS
    // ============================================
    
    // Trap focus in modal (if any modals are added in the future)
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        });
    }

    // ============================================
    // SCREEN READER ANNOUNCEMENTS
    // ============================================
    
    function announceToScreenReader(message) {
        // Create or get live region
        let liveRegion = document.getElementById('aria-live-region');
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'aria-live-region';
            liveRegion.setAttribute('role', 'status');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
        
        // Clear and set message
        liveRegion.textContent = '';
        setTimeout(function() {
            liveRegion.textContent = message;
        }, 100);
        
        // Clear after announcement
        setTimeout(function() {
            liveRegion.textContent = '';
        }, 3000);
    }

    // ============================================
    // LAZY LOADING IMAGES
    // ============================================
    
    // Native lazy loading is supported, but add fallback for older browsers
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.src;
        });
    } else {
        // Fallback for older browsers
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }

    // ============================================
    // REDUCED MOTION PREFERENCES
    // ============================================
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function handleReducedMotion() {
        if (prefersReducedMotion.matches) {
            // Disable animations
            document.documentElement.style.setProperty('--transition-speed', '0.01ms');
            
            // Update scroll behavior
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href !== '#') {
                        const targetElement = document.getElementById(href.substring(1));
                        if (targetElement) {
                            e.preventDefault();
                            targetElement.scrollIntoView({
                                behavior: 'auto'
                            });
                        }
                    }
                });
            });
        }
    }
    
    // Check on load and when preference changes
    handleReducedMotion();
    prefersReducedMotion.addEventListener('change', handleReducedMotion);

    // ============================================
    // DETECT AND ANNOUNCE PAGE LOAD
    // ============================================
    
    window.addEventListener('load', function() {
        announceToScreenReader('Page loaded successfully. Use tab key to navigate.');
    });

    // ============================================
    // KEYBOARD SHORTCUTS (Optional Enhancement)
    // ============================================
    
    document.addEventListener('keydown', function(e) {
        // Alt + H: Go to home/top
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.querySelector('.skip-link')?.focus();
        }
        
        // Alt + M: Focus on main content
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.focus();
                announceToScreenReader('Jumped to main content');
            }
        }
        
        // Alt + N: Focus on navigation
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            const navigation = document.getElementById('navigation');
            if (navigation) {
                const firstLink = navigation.querySelector('a');
                if (firstLink) {
                    firstLink.focus();
                    announceToScreenReader('Jumped to navigation');
                }
            }
        }
        
        // Alt + C: Focus on contact section
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.focus();
                contactSection.scrollIntoView({ behavior: 'smooth' });
                announceToScreenReader('Jumped to contact section');
            }
        }
    });

    // ============================================
    // FOCUS VISIBLE POLYFILL
    // ============================================
    
    // Add keyboard navigation indicator
    let isUsingKeyboard = false;
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            isUsingKeyboard = true;
            document.body.classList.add('using-keyboard');
        }
    });
    
    document.addEventListener('mousedown', function() {
        isUsingKeyboard = false;
        document.body.classList.remove('using-keyboard');
    });

    // ============================================
    // EXTERNAL LINK INDICATION
    // ============================================
    
    // Add visual and screen reader indication for external links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (link.hostname !== window.location.hostname) {
            // Add external link indicator
            const externalIndicator = document.createElement('span');
            externalIndicator.className = 'sr-only';
            externalIndicator.textContent = ' (opens in new window)';
            link.appendChild(externalIndicator);
            
            // Set target and rel attributes
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // ============================================
    // PRINT OPTIMIZATION
    // ============================================
    
    window.addEventListener('beforeprint', function() {
        // Expand all collapsed sections for printing
        const collapsibleElements = document.querySelectorAll('[aria-expanded="false"]');
        collapsibleElements.forEach(el => {
            el.setAttribute('data-was-collapsed', 'true');
            el.setAttribute('aria-expanded', 'true');
        });
    });
    
    window.addEventListener('afterprint', function() {
        // Restore collapsed state after printing
        const collapsibleElements = document.querySelectorAll('[data-was-collapsed="true"]');
        collapsibleElements.forEach(el => {
            el.setAttribute('aria-expanded', 'false');
            el.removeAttribute('data-was-collapsed');
        });
    });

    console.log('Accessible University website loaded successfully');
    console.log('Keyboard shortcuts:');
    console.log('  Alt + H: Go to top');
    console.log('  Alt + M: Jump to main content');
    console.log('  Alt + N: Jump to navigation');
    console.log('  Alt + C: Jump to contact section');
    
})();
