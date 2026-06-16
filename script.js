document.addEventListener('DOMContentLoaded', () => {
    const categoryNav = document.getElementById('category-nav');
    const catalogContainer = document.getElementById('catalog-container');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let flatProducts = []; // Flat list of all products for lightbox navigation
    let currentProductIndex = -1;

    // Initialize Catalog
    function initCatalog() {
        if (!CATALOG_DATA || CATALOG_DATA.length === 0) {
            catalogContainer.innerHTML = '<p class="subtitle">No se encontraron productos en el catálogo.</p>';
            return;
        }

        // 1. Create "Ver Todo" button in navigation
        const allBtn = document.createElement('button');
        allBtn.className = 'category-btn active';
        allBtn.textContent = 'Ver Todo';
        allBtn.dataset.target = 'header';
        allBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        categoryNav.appendChild(allBtn);

        // Populate sections and flatten product list
        CATALOG_DATA.forEach((catData, catIndex) => {
            const sectionId = `section-${catIndex}`;

            // 2. Add Category to Navigation
            const navBtn = document.createElement('button');
            navBtn.className = 'category-btn';
            navBtn.textContent = catData.category;
            navBtn.dataset.target = sectionId;
            
            navBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetEl = document.getElementById(sectionId);
                if (targetEl) {
                    const headerOffset = 100;
                    const elementPosition = targetEl.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
            categoryNav.appendChild(navBtn);

            // 3. Create Section Container
            const section = document.createElement('section');
            section.className = 'catalog-section';
            section.id = sectionId;

            // Section Title
            const title = document.createElement('h2');
            title.className = 'section-title';
            title.innerHTML = `${catData.category} <span class="section-count">(${catData.products.length})</span>`;
            section.appendChild(title);

            // Products Grid
            const grid = document.createElement('div');
            grid.className = 'products-grid';

            // Populate Products
            catData.products.forEach((prod) => {
                // Keep track in flat array for lightbox
                const productItem = {
                    name: prod.name,
                    path: prod.path,
                    category: catData.category
                };
                flatProducts.push(productItem);
                const globalIndex = flatProducts.length - 1;

                // Create Card
                const card = document.createElement('div');
                card.className = 'product-card';
                card.addEventListener('click', () => openLightbox(globalIndex));

                // Image Wrapper
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'product-img-wrapper';

                const img = document.createElement('img');
                img.className = 'product-img';
                img.src = prod.path;
                img.alt = prod.name;
                img.loading = 'lazy'; // Performance boost for large catalogs
                
                imgWrapper.appendChild(img);

                // Info Area
                const info = document.createElement('div');
                info.className = 'product-info';

                const name = document.createElement('h3');
                name.className = 'product-name';
                name.textContent = prod.name;

                info.appendChild(name);

                card.appendChild(imgWrapper);
                card.appendChild(info);
                grid.appendChild(card);
            });

            section.appendChild(grid);
            catalogContainer.appendChild(section);
        });

        // Setup Scroll Spy
        setupScrollSpy();
    }

    // Scroll Spy: Update active navigation item on scroll
    function setupScrollSpy() {
        const sections = document.querySelectorAll('.catalog-section');
        const navButtons = document.querySelectorAll('.category-btn');

        window.addEventListener('scroll', () => {
            let currentActiveSectionId = 'header';
            const scrollPos = window.scrollY + 150; // offset for nav

            sections.forEach(section => {
                if (scrollPos >= section.offsetTop) {
                    currentActiveSectionId = section.id;
                }
            });

            navButtons.forEach(btn => {
                if (btn.dataset.target === currentActiveSectionId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        });
    }

    // Lightbox Control
    function openLightbox(index) {
        if (index < 0 || index >= flatProducts.length) return;
        currentProductIndex = index;
        
        const prod = flatProducts[currentProductIndex];
        lightboxImg.src = prod.path;
        lightboxImg.alt = prod.name;
        lightboxCaption.textContent = prod.name;
        lightboxCategory.textContent = prod.category;

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300); // Wait for transition animation
    }

    function navigateLightbox(direction) {
        let newIndex = currentProductIndex + direction;
        if (newIndex < 0) {
            newIndex = flatProducts.length - 1; // Loop to end
        } else if (newIndex >= flatProducts.length) {
            newIndex = 0; // Loop to start
        }
        openLightbox(newIndex);
    }

    // Event Listeners for Lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
            navigateLightbox(1);
        }
    });

    // Run Initialization
    initCatalog();
});
