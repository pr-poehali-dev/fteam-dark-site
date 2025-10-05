import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление играми (публикация, одобрение, получение списка)
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
            status = params.get('status', 'approved')
            
            cur.execute(
                "SELECT id, title, description, price, developer_email, genre, age_rating, file_url, logo_url, screenshots, publisher_username, status FROM games WHERE status = %s ORDER BY id DESC",
                (status,)
            )
            
            games = []
            for game in cur.fetchall():
                games.append({
                    'id': game[0],
                    'title': game[1],
                    'description': game[2],
                    'price': float(game[3]),
                    'developer_email': game[4],
                    'genre': game[5],
                    'age_rating': game[6],
                    'file_url': game[7],
                    'logo_url': game[8],
                    'screenshots': game[9] or [],
                    'publisher_username': game[10],
                    'status': game[11]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'games': games})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cur.execute(
                "INSERT INTO games (title, description, price, developer_email, genre, age_rating, file_url, logo_url, screenshots, publisher_username, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (
                    body_data.get('title'),
                    body_data.get('description'),
                    body_data.get('price', 0),
                    body_data.get('developer_email'),
                    body_data.get('genre'),
                    body_data.get('age_rating'),
                    body_data.get('file_url'),
                    body_data.get('logo_url'),
                    body_data.get('screenshots', []),
                    body_data.get('publisher_username'),
                    'pending'
                )
            )
            game_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'game_id': game_id, 'message': 'Игра отправлена на модерацию'})
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            game_id = body_data.get('game_id')
            action = body_data.get('action')
            
            if action == 'approve':
                cur.execute("UPDATE games SET status = %s WHERE id = %s", ('approved', game_id))
                conn.commit()
            elif action == 'reject':
                cur.execute("UPDATE games SET status = %s WHERE id = %s", ('rejected', game_id))
                conn.commit()
            elif action == 'set_featured':
                is_featured = body_data.get('is_featured', True)
                cur.execute("UPDATE games SET is_featured = %s WHERE id = %s", (is_featured, game_id))
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