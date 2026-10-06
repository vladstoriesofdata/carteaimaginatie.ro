const gallery = document.querySelector<HTMLElement>('#gallery');
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
const items = [...document.querySelectorAll<HTMLElement>('.gallery-item')];

function layoutGallery() {
  if (!gallery) return;
  const columns = window.matchMedia('(max-width: 767px)').matches ? 1 : 2;
  const width = gallery.clientWidth / columns;
  const heights = Array(columns).fill(0);
  for (const [index, item] of items.filter(item => !item.hidden).entries()) {
    const image = item.querySelector<HTMLImageElement>('img')!;
    const column = index % columns;
    item.style.width = `${width}px`;
    item.style.left = `${column * width}px`;
    item.style.top = `${heights[column]}px`;
    heights[column] += (width - 20) * Number(image.getAttribute('height')) / Number(image.getAttribute('width')) + 20;
  }
  gallery.style.height = `${Math.max(...heights)}px`;
  gallery.classList.add('is-masonry');
}
for (const button of buttons) button.addEventListener('click', () => {
  for (const control of buttons) control.setAttribute('aria-pressed', String(control === button));
  for (const item of items) item.hidden = item.dataset.category !== button.dataset.filter;
  layoutGallery();
  window.scrollTo({ top: 0, behavior: 'instant' });
});
if (gallery) {
  new ResizeObserver(layoutGallery).observe(gallery);
  layoutGallery();
}
