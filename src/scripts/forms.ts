/**
 * Forms (`.w-form`): replaces Webflow's form handler.
 * The form posts to the endpoint in its `data-endpoint` attribute (set from
 * PUBLIC_FORM_ENDPOINT or config.json → forms.endpoint). Works with Formspree, Web3Forms,
 * Basin, Getform, or your own API. With no endpoint (demo mode) the success state is shown.
 */

function initForm(block: HTMLElement) {
  const form = block.querySelector<HTMLFormElement>('form');
  const done = block.querySelector<HTMLElement>('.w-form-done');
  const fail = block.querySelector<HTMLElement>('.w-form-fail');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submit = form.querySelector<HTMLInputElement | HTMLButtonElement>('[type="submit"]');
    const label = submit instanceof HTMLInputElement ? submit.value : submit?.textContent ?? '';
    const wait = submit?.getAttribute('data-wait');
    if (submit) {
      submit.disabled = true;
      if (wait) submit instanceof HTMLInputElement ? (submit.value = wait) : (submit.textContent = wait);
    }

    const data = new FormData(form);
    // Honeypot: bots fill hidden fields, humans don't.
    const spam = (data.get('_gotcha') as string | null)?.trim();
    let success = true;
    const endpoint = form.dataset.endpoint?.trim();

    if (!spam && endpoint) {
      try {
        const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        success = res.ok;
      } catch {
        success = false;
      }
    } else if (!endpoint) {
      console.info('[Vexan] No form endpoint configured: set PUBLIC_FORM_ENDPOINT to receive submissions.');
    }

    if (submit) {
      submit.disabled = false;
      submit instanceof HTMLInputElement ? (submit.value = label) : (submit.textContent = label);
    }

    // Same visual result as Webflow: hide the form, show the success or error block.
    if (success) {
      form.style.display = 'none';
      if (done) { done.style.display = 'block'; done.setAttribute('tabindex', '-1'); done.focus(); }
      if (fail) fail.style.display = 'none';
      form.reset();
    } else if (fail) {
      fail.style.display = 'block';
      fail.setAttribute('tabindex', '-1');
      fail.focus();
    }
  });

  // Custom radio/checkbox visuals (Webflow's w--redirected-checked / -focus classes).
  form.querySelectorAll<HTMLInputElement>('input[type="radio"], input[type="checkbox"]').forEach((input) => {
    const visual = input.parentElement?.querySelector<HTMLElement>('.w-radio-input, .w-checkbox-input');
    if (!visual) return;
    input.addEventListener('change', () => {
      if (input.type === 'radio') {
        form.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(input.name)}"]`).forEach((r) => {
          r.parentElement?.querySelector('.w-radio-input')?.classList.toggle('w--redirected-checked', r.checked);
        });
      } else {
        visual.classList.toggle('w--redirected-checked', input.checked);
      }
    });
    input.addEventListener('focus', () => {
      visual.classList.add('w--redirected-focus');
      if (input.matches(':focus-visible')) visual.classList.add('w--redirected-focus-visible');
    });
    input.addEventListener('blur', () => visual.classList.remove('w--redirected-focus', 'w--redirected-focus-visible'));
  });
}

export function initForms() {
  document.querySelectorAll<HTMLElement>('.w-form').forEach(initForm);
}
