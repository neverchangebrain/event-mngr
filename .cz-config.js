module.exports = {
  types: [
    { value: 'feat', name: 'feat:     Новая функциональность (фича)' },
    { value: 'fix', name: 'fix:      Исправление ошибки' },
    { value: 'docs', name: 'docs:     Изменения в документации' },
    {
      value: 'style',
      name: 'style:    Изменения, не влияющие на код (пробелы, форматирование)'
    },
    {
      value: 'refactor',
      name: 'refactor: Рефакторинг кода без исправления ошибок и добавления новых функций'
    },
    { value: 'test', name: 'test:     Добавление или изменение тестов' },
    {
      value: 'chore',
      name: 'chore:    Обслуживание проекта, задачи не связанные с исходным кодом'
    }
  ]
};
