const dialog = document.querySelector<HTMLDialogElement>('#story-dialog');
const form = document.querySelector<HTMLFormElement>('#story-form');
const trigger = document.querySelector<HTMLButtonElement>('[data-open-story]');
if (dialog && form && trigger) {
  trigger.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('[data-close-story]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => trigger.focus({ preventScroll: true }));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'));
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const endpoint = form.dataset.endpoint;
    if (!endpoint || sending || !form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const story = String(data.get('story') || '').trim();
    if (!name || !story) {
      status.textContent = 'Completează numele și trăznaia înainte de a trimite.';
      return;
    }
    sending = true;
    submit.disabled = true;
    fields.forEach(field => { field.disabled = true; });
    status.textContent = 'Se trimite…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: String(data.get('email')).trim(), story, illustration: data.has('illustration'), publicationConsent: data.has('publicationConsent') }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error('Submission failed');
      status.textContent = 'Am primit trăznaia ta. Mulțumim!';
      form.reset();
    } catch {
      status.textContent = 'Mesajul nu a putut fi trimis. Trăznaia ta este păstrată în formular; încearcă din nou.';
    } finally {
      sending = false;
      submit.disabled = false;
      fields.forEach(field => { field.disabled = false; });
    }
  });
}
