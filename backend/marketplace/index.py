import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Торговая площадка для игр и рамок
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
            cur.execute(
                """SELECT m.id, m.seller_id, m.item_type, m.item_id, m.price, u.username,
                   CASE 
                     WHEN m.item_type = 'game' THEN g.title
                     WHEN m.item_type = 'frame' THEN f.name
                   END as item_name,
                   CASE 
                     WHEN m.item_type = 'game' THEN g.logo_url
                     WHEN m.item_type = 'frame' THEN f.image_url
                   END as item_image
                   FROM marketplace_items m
                   JOIN users u ON m.seller_id = u.id
                   LEFT JOIN games g ON m.item_type = 'game' AND m.item_id = g.id
                   LEFT JOIN frames f ON m.item_type = 'frame' AND m.item_id = f.id
                   WHERE m.status = 'active'
                   ORDER BY m.created_at DESC"""
            )
            
            items = []
            for item in cur.fetchall():
                items.append({
                    'id': item[0],
                    'seller_id': item[1],
                    'item_type': item[2],
                    'item_id': item[3],
                    'price': float(item[4]),
                    'seller_username': item[5],
                    'item_name': item[6],
                    'item_image': item[7]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'items': items})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'sell':
                cur.execute(
                    "INSERT INTO marketplace_items (seller_id, item_type, item_id, price) VALUES (%s, %s, %s, %s) RETURNING id",
                    (body_data.get('seller_id'), body_data.get('item_type'), body_data.get('item_id'), body_data.get('price'))
                )
                item_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'item_id': item_id, 'message': 'Товар выставлен на продажу'})
                }
            
            elif action == 'buy':
                item_id = body_data.get('item_id')
                buyer_id = body_data.get('buyer_id')
                
                cur.execute("SELECT seller_id, item_type, item_id, price FROM marketplace_items WHERE id = %s AND status = 'active'", (item_id,))
                item = cur.fetchone()
                
                if not item:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Товар не найден'})
                    }
                
                seller_id, item_type, item_ref_id, price = item
                seller_gets = float(price) * 0.9
                
                cur.execute("SELECT balance FROM users WHERE id = %s", (buyer_id,))
                buyer_balance = cur.fetchone()[0]
                
                if float(buyer_balance) < float(price):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Недостаточно средств'})
                    }
                
                cur.execute("UPDATE users SET balance = balance - %s WHERE id = %s", (price, buyer_id))
                cur.execute("UPDATE users SET balance = balance + %s WHERE id = %s", (seller_gets, seller_id))
                
                if item_type == 'game':
                    cur.execute("INSERT INTO user_games (user_id, game_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (buyer_id, item_ref_id))
                elif item_type == 'frame':
                    cur.execute("INSERT INTO user_frames (user_id, frame_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (buyer_id, item_ref_id))
                
                cur.execute("UPDATE marketplace_items SET status = 'sold' WHERE id = %s", (item_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': 'Покупка успешна!'})
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
