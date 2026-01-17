import json
import os
import psycopg2
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

def get_db_connection():
    """Подключение к PostgreSQL"""
    return psycopg2.connect(
        os.environ['DATABASE_URL'],
        options=f"-c search_path={os.environ['MAIN_DB_SCHEMA']}"
    )

def send_telegram_message(chat_id: int, text: str, reply_to: Optional[int] = None) -> bool:
    """Отправка сообщения через Telegram Bot API"""
    import urllib.request
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        print("TELEGRAM_BOT_TOKEN not set")
        return False
    
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    
    data = {
        'chat_id': chat_id,
        'text': text
    }
    if reply_to:
        data['reply_to_message_id'] = reply_to
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        response = urllib.request.urlopen(req)
        result = json.loads(response.read().decode('utf-8'))
        return result.get('ok', False)
    except Exception as e:
        print(f"Error sending message: {e}")
        return False

def get_or_create_user(conn, telegram_id: int, username: str = None, first_name: str = None, last_name: str = None) -> Dict:
    """Получить или создать пользователя"""
    cur = conn.cursor()
    
    cur.execute(
        "SELECT telegram_id, username, status, violations_count, warnings_count FROM users WHERE telegram_id = %s",
        (telegram_id,)
    )
    row = cur.fetchone()
    
    if row:
        return {
            'telegram_id': row[0],
            'username': row[1],
            'status': row[2],
            'violations_count': row[3],
            'warnings_count': row[4]
        }
    
    cur.execute(
        "INSERT INTO users (telegram_id, username, first_name, last_name) VALUES (%s, %s, %s, %s) RETURNING telegram_id, username, status, violations_count, warnings_count",
        (telegram_id, username, first_name, last_name)
    )
    row = cur.fetchone()
    conn.commit()
    
    return {
        'telegram_id': row[0],
        'username': row[1],
        'status': row[2],
        'violations_count': row[3],
        'warnings_count': row[4]
    }

def handle_ban_command(conn, chat_id: int, moderator_id: int, target_user_id: int, reason: str = None):
    """Бан пользователя"""
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE users SET status = 'banned', banned_at = %s, updated_at = %s WHERE telegram_id = %s",
        (datetime.now(), datetime.now(), target_user_id)
    )
    
    cur.execute(
        "INSERT INTO mod_actions (user_id, moderator_id, action_type, reason) VALUES (%s, %s, 'ban', %s)",
        (target_user_id, moderator_id, reason or 'Нарушение правил группы')
    )
    
    cur.execute(
        "INSERT INTO violations (user_id, violation_type, action_type, moderator_id, reason) VALUES (%s, 'manual', 'ban', %s, %s)",
        (target_user_id, moderator_id, reason or 'Нарушение правил')
    )
    
    conn.commit()
    
    import urllib.request
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    url = f'https://api.telegram.org/bot{bot_token}/banChatMember'
    req = urllib.request.Request(
        url,
        data=json.dumps({'chat_id': chat_id, 'user_id': target_user_id}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        urllib.request.urlopen(req)
    except Exception:
        pass

def handle_mute_command(conn, chat_id: int, moderator_id: int, target_user_id: int, duration_minutes: int = 60, reason: str = None):
    """Мут пользователя"""
    cur = conn.cursor()
    
    muted_until = datetime.now() + timedelta(minutes=duration_minutes)
    
    cur.execute(
        "UPDATE users SET status = 'muted', muted_until = %s, updated_at = %s WHERE telegram_id = %s",
        (muted_until, datetime.now(), target_user_id)
    )
    
    cur.execute(
        "INSERT INTO mod_actions (user_id, moderator_id, action_type, reason, duration_minutes) VALUES (%s, %s, 'mute', %s, %s)",
        (target_user_id, moderator_id, reason or 'Нарушение правил', duration_minutes)
    )
    
    cur.execute(
        "INSERT INTO violations (user_id, violation_type, action_type, moderator_id, reason) VALUES (%s, 'manual', 'mute', %s, %s)",
        (target_user_id, moderator_id, reason or 'Нарушение правил')
    )
    
    conn.commit()
    
    import urllib.request
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    until_timestamp = int(muted_until.timestamp())
    url = f'https://api.telegram.org/bot{bot_token}/restrictChatMember'
    req = urllib.request.Request(
        url,
        data=json.dumps({
            'chat_id': chat_id,
            'user_id': target_user_id,
            'until_date': until_timestamp,
            'permissions': {'can_send_messages': False}
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        urllib.request.urlopen(req)
    except Exception:
        pass

def handle_warn_command(conn, chat_id: int, moderator_id: int, target_user_id: int, reason: str = None):
    """Предупреждение пользователю"""
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE users SET warnings_count = warnings_count + 1, violations_count = violations_count + 1, status = 'warned', updated_at = %s WHERE telegram_id = %s RETURNING warnings_count",
        (datetime.now(), target_user_id)
    )
    warnings = cur.fetchone()[0]
    
    cur.execute(
        "INSERT INTO mod_actions (user_id, moderator_id, action_type, reason) VALUES (%s, %s, 'warn', %s)",
        (target_user_id, moderator_id, reason or 'Предупреждение')
    )
    
    cur.execute(
        "INSERT INTO violations (user_id, violation_type, action_type, moderator_id, reason) VALUES (%s, 'manual', 'warn', %s, %s)",
        (target_user_id, moderator_id, reason or 'Предупреждение')
    )
    
    conn.commit()
    
    cur.execute("SELECT config->>'max_warnings' FROM auto_mod_settings WHERE setting_name = 'warn_limit'")
    max_warnings = int(cur.fetchone()[0])
    
    if warnings >= max_warnings:
        handle_ban_command(conn, chat_id, moderator_id, target_user_id, f"Превышен лимит предупреждений ({warnings}/{max_warnings})")
        return f"⛔️ Пользователь забанен автоматически за {warnings} предупреждений!"
    
    return f"⚠️ Предупреждение {warnings}/{max_warnings}"

def handler(event: dict, context) -> dict:
    """Обработчик webhook от Telegram"""
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        if 'message' not in body:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        message = body['message']
        chat_id = message['chat']['id']
        from_user = message.get('from', {})
        moderator_id = from_user.get('id')
        text = message.get('text', '')
        
        conn = get_db_connection()
        
        get_or_create_user(
            conn,
            moderator_id,
            from_user.get('username'),
            from_user.get('first_name'),
            from_user.get('last_name')
        )
        
        if text.startswith('/ban'):
            if 'reply_to_message' in message:
                target_user = message['reply_to_message']['from']
                target_user_id = target_user['id']
                
                get_or_create_user(conn, target_user_id, target_user.get('username'))
                
                parts = text.split(' ', 1)
                reason = parts[1] if len(parts) > 1 else None
                
                handle_ban_command(conn, chat_id, moderator_id, target_user_id, reason)
                
                username = target_user.get('username', target_user.get('first_name', 'Пользователь'))
                if username and not username.startswith('@'):
                    username = f"@{username}"
                send_telegram_message(chat_id, f"🚫 {username} забанен!")
        
        elif text.startswith('/mute'):
            if 'reply_to_message' in message:
                target_user = message['reply_to_message']['from']
                target_user_id = target_user['id']
                
                get_or_create_user(conn, target_user_id, target_user.get('username'))
                
                parts = text.split()
                duration = 60
                reason = None
                
                if len(parts) > 1:
                    try:
                        duration = int(parts[1])
                    except:
                        pass
                
                if len(parts) > 2:
                    reason = ' '.join(parts[2:])
                
                handle_mute_command(conn, chat_id, moderator_id, target_user_id, duration, reason)
                
                username = target_user.get('username', target_user.get('first_name', 'Пользователь'))
                if username and not username.startswith('@'):
                    username = f"@{username}"
                send_telegram_message(chat_id, f"🔇 {username} получил мут на {duration} минут!")
        
        elif text.startswith('/warn'):
            if 'reply_to_message' in message:
                target_user = message['reply_to_message']['from']
                target_user_id = target_user['id']
                
                get_or_create_user(conn, target_user_id, target_user.get('username'))
                
                parts = text.split(' ', 1)
                reason = parts[1] if len(parts) > 1 else None
                
                result = handle_warn_command(conn, chat_id, moderator_id, target_user_id, reason)
                
                username = target_user.get('username', target_user.get('first_name', 'Пользователь'))
                if username and not username.startswith('@'):
                    username = f"@{username}"
                send_telegram_message(chat_id, f"{result}\nПользователь: {username}")
        
        elif text == '/stats':
            cur = conn.cursor()
            
            cur.execute("SELECT COUNT(*) FROM users")
            total_users = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM users WHERE status = 'banned'")
            banned = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM users WHERE status = 'muted'")
            muted = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM mod_actions WHERE created_at > NOW() - INTERVAL '1 day'")
            today_actions = cur.fetchone()[0]
            
            stats_text = f"📊 Статистика Барсика\n\n👥 Всего пользователей: {total_users}\n🚫 Забанено: {banned}\n🔇 В муте: {muted}\n⚡️ Действий за сегодня: {today_actions}"
            
            send_telegram_message(chat_id, stats_text)
        
        elif text == '/help':
            help_text = "🐱 Команды бота Барсик\n\nМодерация:\n/ban - забанить пользователя (ответ на сообщение)\n/mute [минуты] - мут (по умолчанию 60 мин)\n/warn - предупреждение (3 = автобан)\n\nИнформация:\n/stats - статистика группы\n/help - это сообщение\n\nВсе команды работают через ответ на сообщение нарушителя"
            
            send_telegram_message(chat_id, help_text)
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': False, 'error': str(e)}),
            'isBase64Encoded': False
        }