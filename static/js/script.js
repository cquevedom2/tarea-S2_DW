document.addEventListener('DOMContentLoaded', () => {

    const expandableCards = document.querySelectorAll('[data-expandable]');

    expandableCards.forEach((card) => {
        const toggleBtn = card.querySelector('.btn-toggle');
        const details = card.querySelector('.feature-details');

        if (!toggleBtn || !details) return;

        toggleBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleDetails(details, toggleBtn);
        });

        card.addEventListener('click', () => {
            toggleDetails(details, toggleBtn);
        });
    });

    function toggleDetails(details, toggleBtn) {
        const isHidden = details.hasAttribute('hidden');

        if (isHidden) {
            details.removeAttribute('hidden');
            toggleBtn.textContent = 'Ver menos';
            toggleBtn.setAttribute('aria-expanded', 'true');
        } else {
            details.setAttribute('hidden', '');
            toggleBtn.textContent = 'Ver más';
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    }

    const form = document.getElementById('signup-form');
    const successMessage = document.getElementById('success-message');

    if (!form) return;

    const validators = {
        fullname: (value) => {
            if (value.trim().length < 3) {
                return { valid: false, message: 'El nombre debe tener al menos 3 caracteres.' };
            }
            return { valid: true, message: '✓ Correcto' };
        },
        email: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value.trim())) {
                return { valid: false, message: 'Introduce un correo electrónico válido.' };
            }
            return { valid: true, message: '✓ Correo válido' };
        },
        password: (value) => {
            const missing = [];
            if (value.length < 8)            missing.push('al menos 8 caracteres');
            if (!/[A-Z]/.test(value))        missing.push('una mayúscula');
            if (!/\d/.test(value))           missing.push('un número');
            if (!/[^A-Za-z0-9]/.test(value)) missing.push('un símbolo');

            if (missing.length > 0) {
                return { valid: false, message: 'Falta: ' + missing.join(', ') + '.' };
            }
            return { valid: true, message: '✓ Contraseña segura' };
        },
        phone: (value) => {
            const digits = value.replace(/\D/g, '');
            if (digits.length < 7 || digits.length > 15) {
                return { valid: false, message: 'Introduce un teléfono válido (7 a 15 dígitos).' };
            }
            return { valid: true, message: '✓ Teléfono válido' };
        },
        source: (value) => {
            if (!value) {
                return { valid: false, message: 'Selecciona una opción.' };
            }
            return { valid: true, message: '✓ Opción seleccionada' };
        },
        terms: (checked) => {
            if (!checked) {
                return { valid: false, message: 'Debes aceptar los términos y condiciones.' };
            }
            return { valid: true, message: '✓ Términos aceptados' };
        }
    };

    const touchedFields = new Set();

    function getFieldValue(fieldName) {
        if (fieldName === 'terms') return form.terms.checked;
        if (fieldName === 'source') return form.source.value;
        return form.elements[fieldName].value;
    }

    function validateField(fieldName) {
        const value = getFieldValue(fieldName);
        const result = validators[fieldName](value);
        renderFieldState(fieldName, result);
        return result.valid;
    }

    function renderFieldState(fieldName, result) {
        const messageEl = form.querySelector(`[data-error-for="${fieldName}"]`);
        if (messageEl) {
            messageEl.textContent = result.message;
            messageEl.classList.toggle('success-text', result.valid);
        }

        if (fieldName === 'source' || fieldName === 'terms') {
            const control = fieldName === 'terms' ? form.terms : form.querySelector('input[name="source"]');
            if (control) control.setAttribute('aria-invalid', String(!result.valid));
            return;
        }

        const input = form.elements[fieldName];
        if (!input) return;

        input.classList.toggle('input-error', !result.valid);
        input.classList.toggle('input-success', result.valid);
        input.setAttribute('aria-invalid', String(!result.valid));
    }

    const textFields = ['fullname', 'email', 'password', 'phone'];

    textFields.forEach((fieldName) => {
        const input = form.elements[fieldName];
        if (!input) return;

        input.addEventListener('blur', () => {
            touchedFields.add(fieldName);
            validateField(fieldName);
        });

        input.addEventListener('input', () => {
            if (touchedFields.has(fieldName)) {
                validateField(fieldName);
            }
        });
    });

    const phoneInput = form.elements.phone;
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            const original = phoneInput.value;
            const cleaned = original
                .replace(/[^\d+\s]/g, '')
                .replace(/(?!^)\+/g, '');
            if (cleaned !== original) {
                const cursor = phoneInput.selectionStart - (original.length - cleaned.length);
                phoneInput.value = cleaned;
                phoneInput.setSelectionRange(cursor, cursor);
            }
        });
    }

    const sourceRadios = form.querySelectorAll('input[name="source"]');
    sourceRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
            touchedFields.add('source');
            validateField('source');
        });
    });

    form.terms.addEventListener('change', () => {
        touchedFields.add('terms');
        validateField('terms');
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const allFields = ['fullname', 'email', 'password', 'phone', 'source', 'terms'];
        let allValid = true;

        allFields.forEach((fieldName) => {
            touchedFields.add(fieldName);
            const isFieldValid = validateField(fieldName);
            if (!isFieldValid) allValid = false;
        });

        if (allValid) {
            const formData = {
                fullname: getFieldValue('fullname'),
                email: getFieldValue('email'),
                password: getFieldValue('password'),
                phone: getFieldValue('phone'),
                source: getFieldValue('source')
            };

            const submitBtn = form.querySelector('.btn-submit');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    form.hidden = true;
                    successMessage.hidden = false;
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    alert(data.error || 'Ocurrió un error en el registro.');
                }
            } catch (error) {
                console.error('Error al enviar formulario:', error);
                alert('Ocurrió un error inesperado de conexión.');
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        }
    });

});
