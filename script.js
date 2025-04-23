// Vérification de l'état de connexion admin
function checkAdminStatus() {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
}

// Fonction de déconnexion
function logout() {
    localStorage.removeItem('isAdminLoggedIn');
    window.location.reload();
}

// Ajout du bouton de connexion/déconnexion dans le header
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    if (header) {
        const adminButton = document.createElement('button');
        adminButton.className = 'admin-button';
        if (checkAdminStatus()) {
            adminButton.textContent = 'Déconnexion';
            adminButton.onclick = logout;
            // Ajouter la classe admin-mode au body
            document.body.classList.add('admin-mode');
        } else {
            adminButton.textContent = 'Admin';
            adminButton.onclick = () => window.location.href = 'admin.html';
        }
        header.appendChild(adminButton);
    }
});

// Données des projets
const projectsData = {
    // Projets personnels
    perso1: {
        title: 'Projet Personnel 1',
        description: 'Description détaillée du projet personnel 1.',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        images: ['images/BAT1_noir.png'],
        link: '#'
    },
    perso2: {
        title: 'Projet Personnel 2',
        description: 'Description détaillée du projet personnel 2.',
        technologies: ['React', 'Node.js'],
        images: ['images/BAT1_noir.png'],
        link: '#'
    },
    perso3: {
        title: 'Projet Personnel 3',
        description: 'Description détaillée du projet personnel 3.',
        technologies: ['Vue.js', 'Firebase'],
        images: ['images/BAT1_noir.png'],
        link: '#'
    },
    perso4: {
        title: 'Projet Personnel 4',
        description: 'Description détaillée du projet personnel 4.',
        technologies: ['Angular', 'TypeScript'],
        images: ['images/BAT1_noir.png'],
        link: '#'
    },
    // Projets professionnels
    pro1: {
        title: 'Projet Pro 1',
        description: 'Description détaillée du projet professionnel 1.',
        technologies: ['React', 'AWS'],
        images: ['images/MULTI_HALFTONE_BLANC.png'],
        link: '#'
    },
    pro2: {
        title: 'Projet Pro 2',
        description: 'Description détaillée du projet professionnel 2.',
        technologies: ['Vue.js', 'Node.js'],
        images: ['images/MULTI_HALFTONE_BLANC.png'],
        link: '#'
    },
    pro3: {
        title: 'Projet Pro 3',
        description: 'Description détaillée du projet professionnel 3.',
        technologies: ['Angular', 'Django'],
        images: ['images/MULTI_HALFTONE_BLANC.png'],
        link: '#'
    },
    // Expérimentations
    exp1: {
        title: 'Expérimentation 1',
        description: 'Description détaillée de l\'expérimentation 1.',
        technologies: ['Three.js', 'WebGL'],
        images: ['images/Ombre_4K.png'],
        link: '#'
    },
    exp2: {
        title: 'Expérimentation 2',
        description: 'Description détaillée de l\'expérimentation 2.',
        technologies: ['Canvas', 'GSAP'],
        images: ['images/Ombre_4K.png'],
        link: '#'
    }
};

// Fonction pour gérer les animations au scroll
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Arrête d'observer une fois animé
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px'
    });

    elements.forEach(element => observer.observe(element));
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des animations au scroll
    handleScrollAnimations();

    // Gestion du slider si présent
    const sliderTrack = document.querySelector('.slider-track');
    if (sliderTrack) {
        const slides = document.querySelectorAll('.slide');
        const prevButton = document.querySelector('.slider-nav.prev');
        const nextButton = document.querySelector('.slider-nav.next');
        const dotsContainer = document.querySelector('.slider-dots');
        let currentSlide = 0;
        let isAnimating = false;
        let autoPlayInterval;

        // Créer les points de navigation
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('slider-dot');
            dot.setAttribute('aria-label', `Aller au projet ${index + 1}`);
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        function updateSlider(animate = true) {
            if (isAnimating) return;
            isAnimating = true;

            // Mettre à jour la position du slider
            sliderTrack.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

            // Mettre à jour les points de navigation
            document.querySelectorAll('.slider-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });

            // Mettre à jour les classes d'animation des slides
            slides.forEach((slide, index) => {
                if (index === currentSlide) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            // Réinitialiser le flag d'animation après la transition
            setTimeout(() => {
                isAnimating = false;
            }, 500);
        }

        function nextSlide() {
            if (isAnimating) return;
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlider();
        }

        function prevSlide() {
            if (isAnimating) return;
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateSlider();
        }

        function goToSlide(index) {
            if (isAnimating || index === currentSlide) return;
            currentSlide = index;
            updateSlider();
        }

        // Gestionnaires d'événements
        prevButton.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });

        nextButton.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });

        // Gestion du swipe sur mobile
        let touchStartX = 0;
        let touchEndX = 0;

        sliderTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        sliderTrack.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
        }, { passive: true });

        sliderTrack.addEventListener('touchend', () => {
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) > 50) {
                if (swipeDistance > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
                resetAutoPlay();
            }
        });

        // Auto-advance slides
        function startAutoPlay() {
            autoPlayInterval = setInterval(nextSlide, 5000);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        // Initialisation
        updateSlider(false);
        startAutoPlay();
    }

    // Gestion des modales de projet
    const modal = document.getElementById('projectModal');
    if (modal) {
        const modalBody = modal.querySelector('.modal-body');
        const closeBtn = modal.querySelector('.close-modal');

        // Ouvrir la modal
        document.querySelectorAll('.view-project').forEach(button => {
            button.addEventListener('click', (e) => {
                const projectCard = e.target.closest('.project-card');
                const projectId = projectCard.dataset.project;
                const project = projectsData[projectId];

                if (project) {
                    const content = `
                        <h2>${project.title}</h2>
                        <div class="project-images">
                            ${project.images.map(img => `<img src="${img}" alt="${project.title}">`).join('')}
                        </div>
                        <div class="project-details">
                            <p>${project.description}</p>
                            <div class="project-technologies">
                                <h3>Technologies utilisées:</h3>
                                <ul>
                                    ${project.technologies.map(tech => `<li>${tech}</li>`).join('')}
                                </ul>
                            </div>
                            ${project.link ? `<a href="${project.link}" class="project-link" target="_blank">Voir le projet</a>` : ''}
                        </div>
                    `;
                    modalBody.innerHTML = content;
                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Fermer la modal
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Fermer la modal en cliquant en dehors
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});
