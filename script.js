const header = document.getElementById("header");
const nav = document.getElementById("nav");
const menuBtn = document.querySelector(".menu-btn");

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
});

menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", String(open));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

const modal = document.createElement("dialog");
modal.className = "modal";
modal.id = "book-modal";
modal.setAttribute("aria-labelledby", "book-title");
modal.innerHTML = `
  <div class="modal__box">
    <div class="modal__top">
      <div>
        <p class="eyebrow">Запись</p>
        <h2 id="book-title">Записаться</h2>
      </div>
      <button class="modal__close" type="button" data-close-book aria-label="Закрыть">×</button>
    </div>
    <form class="book" id="book-form" name="book" novalidate>
      <label>
        Имя
        <input type="text" name="name" placeholder="Как к вам обращаться" autocomplete="name" />
      </label>
      <label>
        Телефон
        <input type="tel" name="phone" id="book-phone" value="+7" inputmode="numeric" autocomplete="tel" maxlength="18" />
      </label>
      <label>
        Услуга
        <select name="service">
          <option>Отец + сын</option>
          <option>Стрижка + борода</option>
          <option selected>Стрижка</option>
          <option>Оформление бороды</option>
          <option>Стрижка машинкой (до 2 насадок)</option>
          <option>Горячий воск</option>
          <option>Спа головы</option>
          <option>Тонирование головы</option>
          <option>Тонирование бороды</option>
          <option>Пилинг головы</option>
          <option>Биозавивка</option>
        </select>
      </label>
      <label class="check">
        <input type="checkbox" name="firstVisit" value="1" />
        <span>Первое посещение</span>
      </label>
      <label>
        Барбер
        <select name="barber">
          <option value="">Без предпочтений</option>
          <option>Михаил</option>
          <option>Илья</option>
        </select>
      </label>
      <label>
        Комментарий
        <textarea name="note" rows="3" placeholder="Мастер, время, пожелания"></textarea>
      </label>
      <button class="btn btn--solid" type="submit">Отправить заявку</button>
    </form>
  </div>
`;
document.body.append(modal);

const phoneInput = modal.querySelector("#book-phone");
const PHONE_PREFIX = "+7";

function localDigits(value) {
  let digits = String(value).replace(/\D/g, "");
  if (digits.startsWith("7")) digits = digits.slice(1);
  else if (digits.startsWith("8")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

function formatPhone(value) {
  const d = localDigits(value);
  let out = PHONE_PREFIX;
  if (!d.length) return out;

  out += " (" + d.slice(0, 3);
  if (d.length < 3) return out;

  out += ")";
  if (d.length === 3) return out;

  out += " " + d.slice(3, 6);
  if (d.length < 6) return out;

  out += "-" + d.slice(6, 8);
  if (d.length < 8) return out;

  out += "-" + d.slice(8, 10);
  return out;
}

function minPhoneCaret(value) {
  return value.startsWith("+7 (") ? 4 : PHONE_PREFIX.length;
}

function localDigitsBefore(value, caret) {
  const before = value.slice(0, caret).replace(/\D/g, "");
  const all = value.replace(/\D/g, "");
  let count = before.length;
  if ((all.startsWith("7") || all.startsWith("8")) && count > 0) count -= 1;
  return Math.max(0, Math.min(count, 10));
}

function caretAfterLocalDigits(formatted, count) {
  if (count <= 0) return minPhoneCaret(formatted);

  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (!/\d/.test(formatted[i])) continue;
    if (i === 1 && formatted.startsWith("+7")) continue;
    seen += 1;
    if (seen >= count) return i + 1;
  }
  return formatted.length;
}

function syncPhone() {
  const prev = phoneInput.value;
  const start = phoneInput.selectionStart ?? prev.length;
  const digitsBefore = localDigitsBefore(prev, start);
  const next = formatPhone(prev);
  phoneInput.value = next;

  if (document.activeElement === phoneInput) {
    const pos = caretAfterLocalDigits(next, digitsBefore);
    phoneInput.setSelectionRange(pos, pos);
  }
}

phoneInput.addEventListener("input", syncPhone);

phoneInput.addEventListener("keydown", (event) => {
  const start = phoneInput.selectionStart ?? 0;
  const end = phoneInput.selectionEnd ?? 0;
  const min = minPhoneCaret(phoneInput.value);

  if (event.key === "Backspace" && start === end) {
    if (start <= min) {
      event.preventDefault();
      phoneInput.setSelectionRange(min, min);
      return;
    }

    const prevChar = phoneInput.value[start - 1];
    if (prevChar && /\D/.test(prevChar)) {
      event.preventDefault();
      const digits = localDigits(phoneInput.value);
      const before = localDigitsBefore(phoneInput.value, start);
      if (before > 0) {
        const nextDigits = digits.slice(0, before - 1) + digits.slice(before);
        const next = formatPhone(nextDigits);
        phoneInput.value = next;
        const pos = caretAfterLocalDigits(next, before - 1);
        phoneInput.setSelectionRange(pos, pos);
      } else {
        phoneInput.setSelectionRange(min, min);
      }
    }
    return;
  }

  if (event.key === "Delete" && start < min) {
    event.preventDefault();
    phoneInput.setSelectionRange(min, min);
  }
});

phoneInput.addEventListener("focus", () => {
  if (!phoneInput.value.startsWith(PHONE_PREFIX)) syncPhone();
  const min = minPhoneCaret(phoneInput.value);
  if ((phoneInput.selectionStart ?? 0) < min) {
    phoneInput.setSelectionRange(min, min);
  }
});

function openBook() {
  nav.classList.remove("is-open");
  menuBtn.setAttribute("aria-expanded", "false");
  phoneInput.value = PHONE_PREFIX;
  modal.showModal();
}

document.querySelectorAll("[data-open-book]").forEach((btn) => {
  btn.addEventListener("click", openBook);
});

modal.querySelector("[data-close-book]").addEventListener("click", () => {
  modal.close();
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

document.querySelectorAll("[data-contact-pick]").forEach((btn) => {
  const root = btn.closest(".contact-pick");
  const menu = root?.querySelector(".contact-pick__menu");
  if (!root || !menu) return;

  const close = () => {
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  };

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (menu.hidden) open();
    else close();
  });

  menu.addEventListener("click", (event) => event.stopPropagation());

  document.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
});
