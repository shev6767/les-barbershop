// Обработка формы записи (окно «Записаться»)

const form = document.forms.book;
const dialog = document.getElementById("book-modal");

function checkForm(data) {
  const errors = [];
  const name = data.get("name").trim();
  const phoneDigits = data.get("phone").replace(/\D/g, "");

  if (name.length < 2) {
    errors.push("Введите имя (не меньше 2 букв)");
  } else if (/\d/.test(name)) {
    errors.push("В имени не должно быть цифр");
  }

  if (phoneDigits.length !== 11) {
    errors.push("Введите телефон полностью: +7 и 10 цифр");
  }

  if (data.get("firstVisit") && data.get("service") !== "Стрижка") {
    errors.push("Цена первого посещения 999 ₽ действует только на стрижку");
  }

  return errors;
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const data = new FormData(form);
  for (const [key, value] of data) {
    console.log(key + ":", value);
  }

  const errors = checkForm(data);
  if (errors.length > 0) {
    Swal.fire({
      target: dialog,
      icon: "error",
      title: "Проверьте данные",
      html: errors.join("<br>"),
      confirmButtonText: "Исправить",
      confirmButtonColor: "#686840",
      background: "#10110c",
      color: "#f0e8d0",
    });
    return;
  }

  const barber = data.get("barber") || "любой свободный барбер";
  dialog.close();
  form.reset();

  Swal.fire({
    icon: "success",
    title: "Заявка принята",
    html: data.get("name").trim() + ", мы перезвоним по номеру " + data.get("phone") +
      "<br>Услуга: " + data.get("service") + "<br>Мастер: " + barber,
    confirmButtonText: "Хорошо",
    confirmButtonColor: "#686840",
    background: "#10110c",
    color: "#f0e8d0",
  });
});
