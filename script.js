document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        zoom: 1.0,
        experience: [
            {
                id: 1,
                title: 'Senior Software Engineer',
                company: 'Tech Solutions Inc.',
                date: 'Jan 2020 - Present',
                description: 'Leading a team of 5 developers building cloud-native applications.\n• optimize API response times by 40%\n• Implementing CI/CD pipelines.'
            },
            {
                id: 2,
                title: 'Software Developer',
                company: 'Web Corp',
                date: 'Jun 2017 - Dec 2019',
                description: 'Developed full-stack web applications using MERN stack.\n• Collaborated with UX designers to improve user retention.'
            }
        ],
        education: [
            {
                id: 1,
                degree: 'B.Sc. Computer Science',
                school: 'University of Technology',
                date: '2013 - 2017',
                description: 'Graduated with Honors. Member of the Coding Club.'
            }
        ],
        customSections: []
    };

    // --- DOM Elements ---
    const formInputs = {
        fullName: document.getElementById('fullName'),
        jobTitle: document.getElementById('jobTitle'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        linkedin: document.getElementById('linkedin'),
        location: document.getElementById('location'),
        summary: document.getElementById('summary'),
        skills: document.getElementById('skills'),
        skillsSectionBtn: document.getElementById('toggleSkillsBtn')
    };

    const previewElements = {
        name: document.getElementById('previewName'),
        title: document.getElementById('previewTitle'),
        email: document.getElementById('previewEmail'),
        phone: document.getElementById('previewPhone'),
        linkedin: document.getElementById('previewLinkedin'),
        location: document.getElementById('previewLocation'),
        summary: document.getElementById('previewSummary'),
        summarySection: document.getElementById('previewSummarySection'),
        experienceList: document.getElementById('previewExperienceList'),
        educationList: document.getElementById('previewEducationList'),
        skills: document.getElementById('previewSkills'),
        skillsSection: document.getElementById('previewSkillsSection'),
        resumeSheet: document.getElementById('resumePreview'),
        customSections: document.getElementById('previewCustomSections')
    };

    const containers = {
        experience: document.getElementById('experienceList'),
        education: document.getElementById('educationList'),
        customSections: document.getElementById('customSectionsContainer')
    };

    const buttons = {
        addExperience: document.getElementById('addExperienceBtn'),
        addEducation: document.getElementById('addEducationBtn'),
        addCustomSection: document.getElementById('addCustomSectionBtn'),
        download: document.getElementById('downloadBtn'),
        zoomIn: document.getElementById('zoomIn'),
        zoomOut: document.getElementById('zoomOut')
    };

    // --- Initialization ---
    function init() {
        renderExperienceForm();
        renderEducationForm();
        renderCustomSectionsForm();
        renderCustomSectionsForm();
        initSortables();
        updatePreview();
        setupEventListeners();
    }

    function initSortables() {
        // 1. Layout Reordering (Sidebar list)
        new Sortable(document.getElementById('sectionSortableList'), {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: function (evt) {
                // Reorder DOM in Preview
                const orderIds = Array.from(evt.to.children).map(li => li.getAttribute('data-id'));
                const previewContainer = document.getElementById('resumePreview');
                const header = document.querySelector('.resume-header');

                // We keep header at top always
                orderIds.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) previewContainer.appendChild(el);
                });
            }
        });

        // 2. Experience Reordering (No-op in preview logic for now, just visual in sidebar?)
        // Actually, we need to update STATE order if we drag items in sidebar.
        // Let's implement Sortable for sidebar lists BUT we need to sync with state.

        // Helper for state sync
        const setupListSortable = (elId, stateKey, renderFn) => {
            const el = document.getElementById(elId);
            if (!el) return;
            new Sortable(el, {
                animation: 150,
                handle: '.form-section', // Drag by the whole card or header? Card is better.
                ghostClass: 'sortable-ghost',
                onEnd: function (evt) {
                    const oldIndex = evt.oldIndex;
                    const newIndex = evt.newIndex;
                    // Move item in state array
                    const item = state[stateKey].splice(oldIndex, 1)[0];
                    state[stateKey].splice(newIndex, 0, item);
                    // Re-render Preview only (Updating Sidebar form would kill drag)
                    updatePreview();
                }
            });
        };

        // Note: For this to work, the sidebar lists (experienceList div) must contain 
        // the direct draggable children. currently renderForm produces a string of HTML.
        // We set innerHTML. SortableJS works on live DOM. 
        // So applied to containers.experience, it works on the .form-section divs.

        setupListSortable('experienceList', 'experience');
        setupListSortable('educationList', 'education');
        setupListSortable('customSectionsContainer', 'customSections');
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Text Input Changes
        Object.keys(formInputs).forEach(key => {
            if (formInputs[key]) formInputs[key].addEventListener('input', updatePreview);
        });

        // Add Buttons
        buttons.addExperience.addEventListener('click', addExperience);
        buttons.addEducation.addEventListener('click', addEducation);
        buttons.addCustomSection.addEventListener('click', addCustomSection);

        // Download
        buttons.download.addEventListener('click', generatePDF);

        // Zoom
        buttons.zoomIn.addEventListener('click', () => adjustZoom(0.1));
        buttons.zoomOut.addEventListener('click', () => adjustZoom(-0.1));

        // Accordion (Delegated for dynamic content)
        // Note: For static sections, we can attach initially. For dynamic, we handle in render.
        attachAccordionListeners();
    }

    function attachAccordionListeners() {
        document.querySelectorAll('.section-header').forEach(header => {
            // Remove old listener to avoid duplicates if re-attaching
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);

            newHeader.addEventListener('click', () => {
                const section = newHeader.parentElement;
                section.classList.toggle('expanded');
            });
        });
    }

    // --- Core Logic ---

    // 1. Update Preview Data
    function updatePreview() {
        // Basic Info
        previewElements.name.textContent = formInputs.fullName.value || 'Your Name';
        previewElements.title.textContent = formInputs.jobTitle.value || 'Job Title';
        previewElements.email.textContent = formInputs.email.value;
        previewElements.phone.textContent = formInputs.phone.value;
        previewElements.linkedin.textContent = formInputs.linkedin.value.replace(/^https?:\/\//, '');
        previewElements.location.textContent = formInputs.location.value;
        previewElements.summary.textContent = formInputs.summary.value;

        // Render Lists
        renderPreviewList(state.experience, previewElements.experienceList, renderExperienceItem);
        renderPreviewList(state.education, previewElements.educationList, renderEducationItem);

        // Custom Sections
        renderPreviewList(state.customSections, previewElements.customSections, renderCustomSectionItem);

        // Skills
        const skillsArray = formInputs.skills.value.split(',').map(s => s.trim()).filter(s => s);

        if (skillsArray.length > 0) {
            previewElements.skillsSection.style.display = 'block';
            previewElements.skills.innerHTML = skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
        } else {
            previewElements.skillsSection.style.display = 'none';
        }

    }

    // 2. Render Form Lists
    function renderExperienceForm() {
        containers.experience.innerHTML = state.experience.map(item => `
            <div class="form-section mb-3" style="border: 1px solid var(--border-color); padding: 10px; margin-bottom: 10px; background: rgba(0,0,0,0.2);">
                <div class="input-group">
                    <input type="text" placeholder="Title" value="${item.title}" oninput="updateItem('experience', ${item.id}, 'title', this.value)">
                </div>
                <div class="input-group">
                    <input type="text" placeholder="Company" value="${item.company}" oninput="updateItem('experience', ${item.id}, 'company', this.value)">
                </div>
                <div class="input-group">
                    <input type="text" placeholder="Date (e.g. 2020-Present)" value="${item.date}" oninput="updateItem('experience', ${item.id}, 'date', this.value)">
                </div>
                <div class="input-group">
                    <textarea rows="3" placeholder="Description" oninput="updateItem('experience', ${item.id}, 'description', this.value)">${item.description}</textarea>
                </div>
                <button class="add-btn" style="color: #ef4444; border-color: #ef4444;" onclick="removeItem('experience', ${item.id})"><i class="fa-solid fa-trash"></i> Remove</button>
            </div>
        `).join('');
    }

    function renderEducationForm() {
        containers.education.innerHTML = state.education.map(item => `
            <div class="form-section mb-3" style="border: 1px solid var(--border-color); padding: 10px; margin-bottom: 10px; background: rgba(0,0,0,0.2);">
                <div class="input-group">
                    <input type="text" placeholder="Degree" value="${item.degree}" oninput="updateItem('education', ${item.id}, 'degree', this.value)">
                </div>
                <div class="input-group">
                    <input type="text" placeholder="School" value="${item.school}" oninput="updateItem('education', ${item.id}, 'school', this.value)">
                </div>
                <div class="input-group">
                    <input type="text" placeholder="Date" value="${item.date}" oninput="updateItem('education', ${item.id}, 'date', this.value)">
                </div>
                <div class="input-group">
                    <textarea rows="2" placeholder="Description (Optional)" oninput="updateItem('education', ${item.id}, 'description', this.value)">${item.description}</textarea>
                </div>
                <button class="add-btn" style="color: #ef4444; border-color: #ef4444;" onclick="removeItem('education', ${item.id})"><i class="fa-solid fa-trash"></i> Remove</button>
            </div>
        `).join('');
    }

    function renderCustomSectionsForm() {
        const existingFocusId = document.activeElement ? document.activeElement.id : null;

        containers.customSections.innerHTML = state.customSections.map(item => `
             <div class="form-section expanded mb-3" style="margin-bottom: 15px;">
                <div class="section-header">
                    <h3><i class="${item.icon || 'fa-solid fa-layer-group'}"></i> ${item.title || 'Custom Section'}</h3>
                    <button class="add-btn" style="width: auto; padding: 5px 10px; color: #ef4444; border-color: #ef4444;" onclick="removeItem('customSections', ${item.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="section-content" style="display: block;">
                    <div class="input-row">
                        <div class="input-group" style="flex: 2;">
                            <label>Section Title</label>
                            <input type="text" id="custom-title-${item.id}" placeholder="e.g. Languages" value="${item.title}" oninput="updateItem('customSections', ${item.id}, 'title', this.value)">
                        </div>
                        <div class="input-group" style="flex: 1;">
                            <label>Icon</label>
                            <select onchange="updateItem('customSections', ${item.id}, 'icon', this.value)" style="width: 100%; padding: 10px; background: var(--bg-dark); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px;">
                                <option value="fa-solid fa-layer-group" ${item.icon === 'fa-solid fa-layer-group' ? 'selected' : ''}>Default</option>
                                <option value="fa-solid fa-language" ${item.icon === 'fa-solid fa-language' ? 'selected' : ''}>Language</option>
                                <option value="fa-solid fa-certificate" ${item.icon === 'fa-solid fa-certificate' ? 'selected' : ''}>Certificate</option>
                                <option value="fa-solid fa-award" ${item.icon === 'fa-solid fa-award' ? 'selected' : ''}>Award</option>
                                <option value="fa-solid fa-diagram-project" ${item.icon === 'fa-solid fa-diagram-project' ? 'selected' : ''}>Project</option>
                                <option value="fa-solid fa-code" ${item.icon === 'fa-solid fa-code' ? 'selected' : ''}>Code</option>
                            </select>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Details / Items</label>
                        <textarea rows="2" id="custom-items-${item.id}" placeholder="e.g. English (Fluent), French (Basic)" oninput="updateItem('customSections', ${item.id}, 'items', this.value)">${item.items}</textarea>
                    </div>
                </div>
            </div>
        `).join('');

        // Restore focus if possible (though difficult with innerHTML replacement)
        // With the fix in updateItem, we rarely re-render this form while typing.
    }

    // 3. Helper Functions
    window.updateItem = (type, id, field, value) => {
        const item = state[type].find(i => i.id === id);
        if (item) {
            item[field] = value;

            // CRITICAL FIX: Do NOT re-render the form that the user is typing in.
            // Only re-render if we really have to (e.g. adding/removing items). 
            // For simple text updates, state is enough.
            // If the title changes, we might want to update the header of the card, 
            // but re-rendering the whole form breaks focus. 
            // We will choose NOT to re-render form on text input.

            if (type === 'customSections' && field === 'icon') {
                // For icon change, we DO need to re-render to see the new icon in header
                renderCustomSectionsForm();
            }

            updatePreview();
        }
    };


    window.removeItem = (type, id) => {
        state[type] = state[type].filter(i => i.id !== id);
        if (type === 'experience') renderExperienceForm();
        else if (type === 'education') renderEducationForm();
        else renderCustomSectionsForm();
        updatePreview();
    };

    function addExperience() {
        const newId = state.experience.length ? Math.max(...state.experience.map(i => i.id)) + 1 : 1;
        state.experience.push({
            id: newId,
            title: '',
            company: '',
            date: '',
            description: ''
        });
        renderExperienceForm();
    }

    function addEducation() {
        const newId = state.education.length ? Math.max(...state.education.map(i => i.id)) + 1 : 1;
        state.education.push({
            id: newId,
            degree: '',
            school: '',
            date: '',
            description: ''
        });
        renderEducationForm();
    }

    function addCustomSection() {
        const newId = state.customSections.length ? Math.max(...state.customSections.map(i => i.id)) + 1 : 1;
        state.customSections.push({
            id: newId,
            title: 'New Section',
            items: '',
            icon: 'fa-solid fa-layer-group'
        });
        renderCustomSectionsForm();
    }


    function renderPreviewList(list, container, renderFn) {
        container.innerHTML = list.map(renderFn).join('');
    }

    function renderExperienceItem(item) {
        if (!item.title && !item.company) return '';
        // Handle Bullet Points
        const formattedDesc = item.description.split('\n').map(line => {
            if (line.trim().startsWith('•')) {
                return `<li>${line.trim().substring(1).trim()}</li>`;
            } else if (line.trim().length > 0) {
                return `<p>${line}</p>`;
            }
            return '';
        }).join('');

        const descContent = formattedDesc.includes('<li>') ? `<ul>${formattedDesc}</ul>` : formattedDesc;

        return `
            <div class="resume-item">
                <div class="item-header">
                    <div class="item-title">${item.title} at ${item.company}</div>
                    <div class="item-date">${item.date}</div>
                </div>
                <div class="item-description">${descContent}</div>
            </div>
        `;
    }

    function renderEducationItem(item) {
        if (!item.degree && !item.school) return '';
        return `
            <div class="resume-item">
                <div class="item-header">
                    <div class="item-title">${item.school}</div>
                    <div class="item-date">${item.date}</div>
                </div>
                <div class="item-subtitle">${item.degree}</div>
                <div class="item-description"><p>${item.description}</p></div>
            </div>
        `;
    }

    function renderCustomSectionItem(item) {
        if (!item.title && !item.items) return '';

        return `
            <section class="resume-section">
                <h2 class="section-title">${item.title}</h2>
                <hr>
                <div class="item-description">
                    <p>${item.items}</p>
                </div>
            </section>
        `;
    }

    function adjustZoom(delta) {
        state.zoom += delta;
        if (state.zoom < 0.5) state.zoom = 0.5;
        if (state.zoom > 1.5) state.zoom = 1.5;
        previewElements.resumeSheet.style.transform = `scale(${state.zoom})`;
        document.getElementById('zoomLevel').textContent = `${Math.round(state.zoom * 100)}%`;
    }

    function generatePDF() {
        // Trigger browser print - handled by @media print in CSS
        window.print();
    }

    // Run init
    init();

    // Set Footer Year
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});
