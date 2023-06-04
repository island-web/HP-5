const packager = require('electron-packager');
const packageJson = require('./package.json');
const path = require('path');

packager({
  dir: './', // путь к корневой папке вашего проекта
  out: './dist', // путь к папке, куда будут сохранены собранные файлы
  name: packageJson.name, // название вашего приложения из package.json
  platform: 'win32', // целевая платформа: win32, darwin, linux и т.д.
  arch: 'ia32', // архитектура: x64, ia32, armv7l и т.д.
  electronVersion: '21.3.5', // версия Electron, которую вы используете
  overwrite: true, // перезаписывать существующие файлы, если они есть
  extraResource: [
    path.join(__dirname, 'build/node-v12.22.12-x86.msi'), 
  ],
})
.then((appPaths) => {
  console.log('Приложение успешно упаковано в:', appPaths);
})
.catch((err) => {
  console.error('Ошибка при упаковке приложения:', err);
});