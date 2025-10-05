import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление рамками (создание, покупка, установка)
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
            
            if user_id:
                cur.execute(
                    """SELECT f.id, f.name, f.price, f.image_url, uf.is_active 
                       FROM frames f 
                       JOIN user_frames uf ON f.id = uf.frame_id 
                       WHERE uf.user_id = %s""",
                    (user_id,)
                )
                frames = []
                for frame in cur.fetchall():
                    frames.append({
                        'id': frame[0],
                        'name': frame[1],
                        'price': float(frame[2]),
                        'image_url': frame[3],
                        'is_active': frame[4]
                    })
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'frames': frames})
                }
            
            cur.execute("SELECT id, name, price, image_url FROM frames ORDER BY id DESC")
            frames = []
            for frame in cur.fetchall():
                frames.append({
                    'id': frame[0],
                    'name': frame[1],
                    'price': float(frame[2]),
                    'image_url': frame[3]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'frames': frames})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create':
                cur.execute(
                    "INSERT INTO frames (name, price, image_url) VALUES (%s, %s, %s) RETURNING id",
                    (body_data.get('name'), body_data.get('price'), body_data.get('image_url'))
                )
                frame_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'frame_id': frame_id, 'message': 'Рамка создана'})
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            user_id = body_data.get('user_id')
            frame_id = body_data.get('frame_id')
            
            if action == 'set_active':
                cur.execute("UPDATE user_frames SET is_active = false WHERE user_id = %s", (user_id,))
                cur.execute(
                    "UPDATE user_frames SET is_active = true WHERE user_id = %s AND frame_id = %s",
                    (user_id, frame_id)
                )
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
