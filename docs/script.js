(function () {
	'use strict';

	/* ------------------------------------------------------------------
	 * CONFIGURACIÓN DEL FORMULARIO DE CONTACTO
	 *
	 * Sustituye el valor de CONTACT_FORM_ENDPOINT por la URL del servicio
	 * que procesará el formulario (por ejemplo un endpoint propio, o un
	 * servicio de terceros que reenvíe el correo). Mientras esté vacío,
	 * el formulario validará los datos correctamente pero NO enviará
	 * ningún correo real: solo mostrará un mensaje de confirmación local.
	 * ------------------------------------------------------------------ */
	var CONTACT_FORM_ENDPOINT = '';

	document.addEventListener('DOMContentLoaded', function () {
		initMobileNav();
		initPhasesGrid();
		initContactForm();
	});

	function initMobileNav() {
		var toggle = document.querySelector('.nav-toggle');
		var nav = document.getElementById('site-nav');

		if (!toggle || !nav) {
			return;
		}

		toggle.addEventListener('click', function () {
			var isOpen = nav.classList.toggle('is-open');
			toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
		});

		nav.querySelectorAll('a').forEach(function (link) {
			link.addEventListener('click', function () {
				nav.classList.remove('is-open');
				toggle.setAttribute('aria-expanded', 'false');
			});
		});
	}

	function initPhasesGrid() {
		var grid = document.getElementById('phasesGrid');
		if (!grid) {
			return;
		}

		var items = grid.children;

		Array.prototype.forEach.call(items, function (item, index) {
			item.addEventListener('mouseenter', function () {
				if (window.innerWidth < 1025) {
					return;
				}
				var template = Array.from({ length: items.length }, function (_, idx) {
					return idx === index ? '1.15fr' : '1fr';
				});
				grid.style.gridTemplateColumns = template.join(' ');
			});
		});

		grid.addEventListener('mouseleave', function () {
			if (window.innerWidth < 1025) {
				return;
			}
			grid.style.gridTemplateColumns = '';
		});
	}

	function initContactForm() {
		var form = document.getElementById('contactForm');
		if (!form) {
			return;
		}

		var status = document.getElementById('formStatus');

		var validators = {
			email: function (value) {
				var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return pattern.test(value.trim()) ? '' : 'Introduce un correo electrónico válido.';
			},
			phone: function (value) {
				var pattern = /^[0-9+\s()-]{6,}$/;
				return pattern.test(value.trim()) ? '' : 'Introduce un número de teléfono válido.';
			}
		};

		form.addEventListener('submit', function (event) {
			event.preventDefault();
			status.textContent = '';
			status.className = 'contact-form__status';

			var isValid = true;

			Object.keys(validators).forEach(function (fieldName) {
				var field = form.elements[fieldName];
				var errorMessage = validators[fieldName](field.value);
				setFieldError(field, errorMessage);
				if (errorMessage) {
					isValid = false;
				}
			});

			var acceptance = form.elements.acceptance;
			var acceptanceError = acceptance.checked ? '' : 'Debes aceptar el aviso legal para continuar.';
			setFieldError(acceptance, acceptanceError);
			if (acceptanceError) {
				isValid = false;
			}

			if (!isValid) {
				status.textContent = 'Revisa los campos marcados antes de enviar el formulario.';
				status.classList.add('is-error');
				var firstInvalid = form.querySelector('[aria-invalid="true"]');
				if (firstInvalid) {
					firstInvalid.focus();
				}
				return;
			}

			if (!CONTACT_FORM_ENDPOINT) {
				status.textContent = 'Formulario validado correctamente. El envío aún no está conectado a ningún servicio.';
				status.classList.add('is-error');
				return;
			}

			submitForm(form, status);
		});
	}

	function setFieldError(field, message) {
		var errorEl = document.getElementById(field.getAttribute('aria-describedby'));

		if (message) {
			field.setAttribute('aria-invalid', 'true');
		} else {
			field.removeAttribute('aria-invalid');
		}

		if (!errorEl) {
			return;
		}

		if (message) {
			errorEl.textContent = message;
			errorEl.hidden = false;
		} else {
			errorEl.textContent = '';
			errorEl.hidden = true;
		}
	}

	function submitForm(form, status) {
		var submitButton = form.querySelector('button[type="submit"]');
		submitButton.disabled = true;

		var formData = new FormData(form);

		fetch(CONTACT_FORM_ENDPOINT, {
			method: 'POST',
			body: formData,
			headers: { Accept: 'application/json' }
		})
			.then(function (response) {
				if (!response.ok) {
					throw new Error('Respuesta no válida del servidor.');
				}
				status.textContent = 'Gracias, hemos recibido tu solicitud. Te contactaremos en breve.';
				status.classList.add('is-success');
				form.reset();
			})
			.catch(function () {
				status.textContent = 'No se ha podido enviar el formulario. Inténtalo de nuevo o contacta por teléfono.';
				status.classList.add('is-error');
			})
			.finally(function () {
				submitButton.disabled = false;
			});
	}
})();
