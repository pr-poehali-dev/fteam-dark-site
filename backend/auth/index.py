import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Авторизация и регистрация пользователей
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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'login':
                email = body_data.get('email')
                password = body_data.get('password')
                
                cur.execute(
                    "SELECT id, email, username, display_name, avatar_url, balance, role, is_verified, is_banned FROM users WHERE email = %s AND password = %s",
                    (email, password)
                )
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Неверный email или пароль'})
                    }
                
                if user[8]:
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Данный аккаунт заблокирован Администрацией'})
                    }
                
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
            
            elif action == 'register':
                email = body_data.get('email')
                password = body_data.get('password')
                username = body_data.get('username')
                
                cur.execute("SELECT id FROM users WHERE email = %s OR username = %s", (email, username))
                if cur.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Пользователь с таким email или логином уже существует'})
                    }
                
                cur.execute(
                    "INSERT INTO users (email, password, username, display_name) VALUES (%s, %s, %s, %s) RETURNING id, email, username, display_name, avatar_url, balance, role, is_verified, is_banned",
                    (email, password, username, username)
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
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()
