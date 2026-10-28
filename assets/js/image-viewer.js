(() => {
  const figures = [...document.querySelectorAll('.case-figure')]
    .filter(figure => figure.querySelector('img'));
  if (!figures.length || typeof HTMLDialogElement === 'undefined') return;

  const dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.id = 'image-viewer';
  dialog.setAttribute('aria-labelledby', 'image-viewer-title');
  dialog.innerHTML = `
    <div class="image-viewer__panel">
      <header class="image-viewer__header">
        <h2 id="image-viewer-title">Image detail</h2>
        <button class="image-viewer__close" type="button" autofocus>Close <span aria-hidden="true">×</span></button>
      </header>
      <div class="image-viewer__tools">
        <button class="image-viewer__zoom" type="button" aria-pressed="false">Actual size</button>
        <a class="image-viewer__original" target="_blank" rel="noopener">Open image in a new tab <span aria-hidden="true">↗</span></a>
      </div>
      <div class="image-viewer__stage" tabindex="0" role="region" aria-label="Image detail; scroll to explore at actual size"><img class="image-viewer__image" alt=""></div>
      <p class="image-viewer__caption"></p>
    </div>`;
  document.body.append(dialog);

  const image = dialog.querySelector('.image-viewer__image');
  const stage = dialog.querySelector('.image-viewer__stage');
  const zoom = dialog.querySelector('.image-viewer__zoom');
  const original = dialog.querySelector('.image-viewer__original');
  const caption = dialog.querySelector('.image-viewer__caption');
  const close = dialog.querySelector('.image-viewer__close');
  let opener;
  let previousOverflow = '';

  function fitImage() {
    dialog.classList.remove('image-viewer--actual');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = 'Actual size';
    image.style.width = '';
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  }

  function updateZoom() {
    if (!dialog.open) return;
    zoom.disabled = image.naturalWidth <= image.getBoundingClientRect().width + 1
      && zoom.getAttribute('aria-pressed') === 'false';
  }

  image.addEventListener('load', updateZoom);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    fitImage();
    opener?.focus({ preventScroll: true });
  });
  zoom.addEventListener('click', () => {
    if (zoom.getAttribute('aria-pressed') === 'true') {
      fitImage();
    } else {
      dialog.classList.add('image-viewer--actual');
      image.style.width = `${image.naturalWidth}px`;
      zoom.setAttribute('aria-pressed', 'true');
      zoom.textContent = 'Fit image';
    }
    updateZoom();
  });

  for (const figure of figures) {
    const source = figure.querySelector('img');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'image-enlarge';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 3H3v5M3 3l7 7M16 3h5v5m0-5-7 7M3 16v5h5m-5 0 7-7m11 2v5h-5m5 0-7-7"/></svg>';
    button.title = 'Enlarge image';
    button.setAttribute('aria-label', `Enlarge image: ${source.alt || 'Project image'}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'image-viewer');
    figure.classList.add('case-figure--enlargeable');
    figure.append(button);

    button.addEventListener('click', () => {
      opener = button;
      fitImage();
      image.alt = source.alt;
      image.src = source.currentSrc || source.src;
      original.href = source.currentSrc || source.src;
      caption.textContent = figure.querySelector('figcaption')?.textContent || '';
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      updateZoom();
    });
  }
})();
