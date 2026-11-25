// Обработка формы записи на странице контактов

const form = document.forms.booking;

// время работы по дням недели (0 - воскресенье)
const workHours = {
  0: ["11:00", "18:00"],
  6: ["10:00", "20:00"],
};
const weekdayHours = ["10:00", "21:00"];

function checkForm(data) {
  const errors = [];
  const name = data.get("name").trim();
  const phone = data.get("phone").replace(/[\s()-]/g, "");
  const date = data.get("date");
  const time = data.get("time");

  if (name.length < 2) {
    errors.push("Введите имя (не меньше 2 букв)");
  }
  if (!/^(\+7|8)\d{10}$/.test(phone)) {
    errors.push("Телефон должен быть в формате +7XXXXXXXXXX");
  }
  if (!date) {
    errors.push("Выберите дату");
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = new Date(date + "T00:00");
    if (day < today) {
      errors.push("Нельзя записаться на прошедшую дату");
    } else if (time) {
      const [open, close] = workHours[day.getDay()] || weekdayHours;
      if (time < open || time >= close) {
        errors.push("В этот день мы работаем с " + open + " до " + close);
      }
    }
  }
  if (!time) {
    errors.push("Выберите время");
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
      icon: "error",
      title: "Проверьте данные",
      html: errors.join("<br>"),
      confirmButtonColor: "#2e4a34",
    });
    return;
  }

  Swal.fire({
    icon: "success",
    title: "Вы записаны!",
    text: data.get("name").trim() + ", ждём вас " +
      new Date(data.get("date") + "T00:00").toLocaleDateString("ru-RU") +
      " в " + data.get("time") + ". Услуга: " + data.get("service") + ".",
    confirmButtonColor: "#2e4a34",
  });
  form.reset();
});
