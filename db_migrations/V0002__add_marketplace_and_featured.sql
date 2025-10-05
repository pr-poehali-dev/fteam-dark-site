-- Добавляем поле is_featured для популярных игр
ALTER TABLE games ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Таблица товаров на торговой площадке
CREATE TABLE marketplace_items (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id),
    item_type VARCHAR(20) NOT NULL,
    item_id INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_marketplace_status ON marketplace_items(status);
CREATE INDEX idx_marketplace_seller ON marketplace_items(seller_id);
