# MikroTik DNS Forward - Расширение для браузера

Добавление DNS forward правил на MikroTik роутер одним кликом с любого сайта.

## Возможности

- DNS forward одним кликом из панели браузера
- Автоматическое извлечение домена из текущей вкладки
- Поддержка Chrome (MV3) и Firefox (MV2)

## Установка

### Chrome
1. `chrome://extensions/` → Включить "Режим разработчика"
2. "Загрузить распакованное" → выбрать папку расширения

### Firefox
1. `about:debugging#/runtime/this-firefox`
2. "Загрузить временное дополнение" → выбрать `manifest.firefox.json`

## Настройка

1. Клик на иконку расширения → "Open Settings"
2. Заполнить:
   - **Router URL:** `http://192.168.88.1`
   - **Username/Password:** учётные данные MikroTik
   - **Forward To:** целевой DNS (например, [`MihomoProxyRoS`](https://github.com/Medium1992/mihomo-proxy-ros/blob/main/README_RU.md))
   - **Comment:** опциональный идентификатор
3. "Test Connection" → "Save Settings"

## Настройка MikroTik

Включить REST API:
```routeros
/ip service set www disabled=no port=80
```

Создать отдельного пользователя (рекомендуется):
```routeros
/user add name=dns-api password=SECURE_PASSWORD group=write
```

## Использование

1. Открыть любой сайт
2. Клик на иконку расширения
3. Клик "Add to MikroTik"

## Сборка

```bash
./build.sh
```
Создаёт `dist/mikrotik-dns-forward-chrome.zip` и `dist/mikrotik-dns-forward-firefox.xpi`

## Лицензия

MIT
