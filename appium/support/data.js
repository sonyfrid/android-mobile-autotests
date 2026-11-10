// Тестовые данные. Пользователи и пароль приложение само показывает на экране входа.
module.exports = {
  users: {
    standard: { username: 'bod@example.com', password: '10203040' },
    locked: { username: 'alice@example.com', password: '10203040' },
  },
  address: { fullName: 'Rebecca Winter', address1: 'Mandorley 112', city: 'Truro', zip: '89750', country: 'United Kingdom' },
  // тестовый номер карты, не настоящий
  payment: { name: 'Rebecca Winter', card: '3258125675687891', expiry: '0325', cvv: '123' },
};
