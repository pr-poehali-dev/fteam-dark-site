import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление пользователями (получение, обновление, админ действия)
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            user_id = params.get('user_id')
            search = params.get('search')
            
            if user_id:
                cur.execute(
                    "SELECT id, username, display_name, avatar_url, balance, role, is_verified, is_banned, hours_online FROM users WHERE id = %s",
                    (user_id,)
                )
                user = cur.fetchone()
                if user:
                    user_data = {
                        'id': user[0],
                        'username': user[1],
                        'display_name': user[2],
                        'avatar_url': user[3],
                        'balance': float(user[4]),
                        'role': user[5],
                        'is_verified': user[6],
                        'is_banned': user[7],
                        'hours_online': user[8]
                    }
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'user': user_data})
                    }
            
            elif search:
                cur.execute(
                    "SELECT id, username, display_name, avatar_url, role, is_verified, is_banned FROM users WHERE username LIKE %s ORDER BY is_verified DESC, id DESC",
                    (f'%{search}%',)
                )
            else:
                cur.execute(
                    "SELECT id, email, username, display_name, avatar_url, balance, role, is_verified, is_banned FROM users ORDER BY is_verified DESC, id DESC"
                )
            
            users = []
            for user in cur.fetchall():
                if search:
                    users.append({
                        'id': user[0],
                        'username': user[1],
                        'display_name': user[2],
                        'avatar_url': user[3],
                        'role': user[4],
                        'is_verified': user[5],
                        'is_banned': user[6]
                    })
                else:
                    users.append({
                        'id': user[0],
                        'email': user[1],
                        'username': user[2],
                        'display_name': user[3],
                        'avatar_url': user[4],
                        'balance': float(user[5]),
                        'role': user[6],
                        'is_verified': user[7],
                        'is_banned': user[8]
                    })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'users': users})
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            action = body_data.get('action')
            
            if action == 'update_profile':
                display_name = body_data.get('display_name')
                username = body_data.get('username')
                avatar_url = body_data.get('avatar_url')
                
                cur.execute(
                    "UPDATE users SET display_name = %s, username = %s, avatar_url = %s WHERE id = %s RETURNING id, email, username, display_name, avatar_url, balance, role, is_verified, is_banned",
                    (display_name, username, avatar_url, user_id)
                )
                user = cur.fetchone()
                conn.commit()
                
                user_data = {
                    'id': user[0],
                    'email': user[1],
                    'username': user[2],
                    'display_name': user[3],
                    'avatar_url': user[4],
                    'balance': float(user[5]),
                    'role': user[6],
                    'is_verified': user[7],
                    'is_banned': user[8]
                }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'user': user_data})
                }
            
            elif action == 'admin_verify':
                cur.execute("UPDATE users SET is_verified = %s WHERE id = %s", (True, user_id))
                conn.commit()
            elif action == 'admin_unverify':
                cur.execute("UPDATE users SET is_verified = %s WHERE id = %s", (False, user_id))
                conn.commit()
            elif action == 'admin_ban':
                cur.execute("UPDATE users SET is_banned = %s WHERE id = %s", (True, user_id))
                conn.commit()
            elif action == 'admin_unban':
                cur.execute("UPDATE users SET is_banned = %s WHERE id = %s", (False, user_id))
                conn.commit()
            elif action == 'update_balance':
                balance = body_data.get('balance')
                cur.execute("UPDATE users SET balance = %s WHERE id = %s", (balance, user_id))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()
