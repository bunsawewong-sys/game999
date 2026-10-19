// HTML overlay for typing a nickname. A real <input> is used so the phone's
// keyboard (including Thai) works normally.

import { t } from '../i18n.js';
import { validateName, NAME_MAX } from '../../shared/validate.js';

export function askName(current = '', { allowCancel = true } = {}) {
  return new Promise((resolve) => {
    const root = document.createElement('div');
    root.className = 'fd-dialog';
    root.innerHTML = `
      <form class="fd-dialog__box" novalidate>
        <p class="fd-dialog__title"></p>
        <p class="fd-dialog__hint"></p>
        <input class="fd-dialog__input" type="text" autocomplete="off" autocapitalize="off"
          spellcheck="false" enterkeyhint="done" maxlength="${NAME_MAX * 2}" />
        <div class="fd-dialog__error" role="alert"></div>
        <div class="fd-dialog__actions">
          <button type="button" class="fd-dialog__btn fd-dialog__btn--ghost" data-cancel></button>
          <button type="submit" class="fd-dialog__btn"></button>
        </div>
      </form>`;

    const form = root.querySelector('form');
    const input = root.querySelector('input');
    const error = root.querySelector('.fd-dialog__error');
    const cancelBtn = root.querySelector('[data-cancel]');
    root.querySelector('.fd-dialog__title').textContent = t('nameTitle');
    root.querySelector('.fd-dialog__hint').textContent = t('nameHint');
    root.querySelector('[type=submit]').textContent = t('ok');
    cancelBtn.textContent = t('cancel');
    input.placeholder = t('namePlaceholder');
    input.value = current;
    if (!allowCancel) cancelBtn.remove();

    // Keep game input handlers from seeing touches on the dialog.
    for (const type of ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup']) {
      root.addEventListener(type, (e) => e.stopPropagation());
    }

    const close = (value) => {
      root.remove();
      resolve(value);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = validateName(input.value);
      if (!result.ok) {
        error.textContent = t(result.error === 'length' ? 'nameErrLength' : 'nameErrChars');
        input.focus();
        return;
      }
      input.blur();
      close(result.name);
    });
    cancelBtn.addEventListener('click', () => close(null));

    document.body.appendChild(root);
    setTimeout(() => input.focus(), 50);
  });
}
