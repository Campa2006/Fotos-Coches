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
    initContactForm();
    initCopyrightYear();
  });

  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('primaryNav');

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

  function initCopyrightYear() {
    var el = document.getElementById('copyYear');
    if (el) {
      el.textContent = new Date().getFullYear();
    }
  }

  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) {
      return;
    }

    var status = document.getElementById('formStatus');

    var validators = {
      nombre: function (value) {
        return value.trim().length >= 2 ? '' : 'Introduce tu nombre completo.';
      },
      email: function (value) {
        var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value.trim()) ? '' : 'Introduce un email válido.';
      },
      telefono: function (value) {
        var pattern = /^[0-9+\s()-]{6,}$/;
        return pattern.test(value.trim()) ? '' : 'Introduce un teléfono válido.';
      },
      pais: function (value) {
        return value.trim().length >= 2 ? '' : 'Indica el país de procedencia del vehículo.';
      },
      'marca-modelo': function (value) {
        return value.trim().length >= 2 ? '' : 'Indica la marca y el modelo del vehículo.';
      },
      mensaje: function (value) {
        return value.trim().length >= 10 ? '' : 'Cuéntanos brevemente qué necesitas (mínimo 10 caracteres).';
      }
    };

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      status.textContent = '';
      status.className = 'form-status';

      var isValid = true;

      Object.keys(validators).forEach(function (fieldName) {
        var field = form.elements[fieldName];
        var errorMessage = validators[fieldName](field.value);
        setFieldError(form, fieldName, errorMessage);
        if (errorMessage) {
          isValid = false;
        }
      });

      var privacidad = form.elements['privacidad'];
      var privacidadError = privacidad.checked ? '' : 'Debes aceptar la política de privacidad para continuar.';
      setFieldError(form, 'privacidad', privacidadError);
      if (privacidadError) {
        isValid = false;
      }

      if (!isValid) {
        status.textContent = 'Revisa los campos marcados en rojo antes de enviar el formulario.';
        status.classList.add('is-error');
        var firstInvalid = form.querySelector('.is-invalid input, .is-invalid textarea');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      if (!CONTACT_FORM_ENDPOINT) {
        status.textContent = 'Formulario validado correctamente. El envío de correo aún no está conectado a ningún servicio (ver README.md).';
        status.classList.add('is-error');
        return;
      }

      submitForm(form, status);
    });
  }

  function setFieldError(form, fieldName, message) {
    var field = form.elements[fieldName];
    var fieldWrapper = field.closest('.form-field');
    var errorEl = document.getElementById('error-' + fieldName);

    if (!fieldWrapper || !errorEl) {
      return;
    }

    if (message) {
      fieldWrapper.classList.add('is-invalid');
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      fieldWrapper.classList.remove('is-invalid');
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
  }

  function submitForm(form, status) {
    var submitButton = form.querySelector('.contact-form__submit');
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
