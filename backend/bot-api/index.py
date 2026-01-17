import json
import os
import psycopg2
from datetime import datetime, timedelta

def get_db_connection():
    """Подключение к PostgreSQL"""
    return psycopg2.connect(
        os.environ['DATABASE_URL'],
        options=f"-c search_path={os.environ['MAIN_DB_SCHEMA']}"
    )

def handler(event: dict, context) -> dict:
    """API для получения данных модерации в frontend"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        path = event.get('queryStringParameters', {}).get('action', 'stats')
        
        if path == 'stats':
            cur.execute("SELECT COUNT(*) FROM users")
            total_users = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM mod_actions WHERE action_type = 'ban' AND created_at > NOW() - INTERVAL '1 day'")
            bans_today = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM mod_actions WHERE action_type = 'mute' AND created_at > NOW() - INTERVAL '1 day'")
            mutes_today = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM mod_actions WHERE action_type = 'warn' AND created_at > NOW() - INTERVAL '1 day'")
            warns_today = cur.fetchone()[0]
            
            result = {
                'total_users': total_users,
                'bans_today': bans_today,
                'mutes_today': mutes_today,
                'warns_today': warns_today
            }
        
        elif path == 'users':
            cur.execute("""
                SELECT telegram_id, username, first_name, status, violations_count, warnings_count
                FROM users
                ORDER BY violations_count DESC, updated_at DESC
                LIMIT 50
            """)
            
            users = []
            for row in cur.fetchall():
                users.append({
                    'id': row[0],
                    'username': row[1] or row[2] or f'user_{row[0]}',
                    'status': row[3],
                    'violations': row[4],
                    'warnings': row[5]
                })
            
            result = {'users': users}
        
        elif path == 'activity':
            cur.execute("""
                SELECT 
                    DATE(created_at) as day,
                    COUNT(*) FILTER (WHERE action_type = 'ban') as bans,
                    COUNT(*) FILTER (WHERE action_type = 'mute') as mutes,
                    COUNT(*) FILTER (WHERE action_type = 'warn') as warns
                FROM mod_actions
                WHERE created_at > NOW() - INTERVAL '7 days'
                GROUP BY DATE(created_at)
                ORDER BY day DESC
            """)
            
            activity = []
            for row in cur.fetchall():
                activity.append({
                    'day': row[0].strftime('%Y-%m-%d'),
                    'bans': row[1],
                    'mutes': row[2],
                    'warns': row[3]
                })
            
            result = {'activity': activity}
        
        elif path == 'top_violators':
            cur.execute("""
                SELECT telegram_id, username, first_name, status, violations_count
                FROM users
                WHERE violations_count > 0
                ORDER BY violations_count DESC
                LIMIT 10
            """)
            
            violators = []
            for row in cur.fetchall():
                violators.append({
                    'id': row[0],
                    'username': row[1] or row[2] or f'user_{row[0]}',
                    'status': row[3],
                    'violations': row[4]
                })
            
            result = {'violators': violators}
        
        elif path == 'settings':
            cur.execute("SELECT setting_name, enabled, config FROM auto_mod_settings")
            
            settings = {}
            for row in cur.fetchall():
                settings[row[0]] = {
                    'enabled': row[1],
                    'config': row[2]
                }
            
            result = {'settings': settings}
        
        else:
            result = {'error': 'Unknown action'}
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
