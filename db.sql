DROP TABLE ordered_items;
DROP TABLE orders;
DROP TABLE users;
DROP TABLE items;

CREATE TABLE users (
	id SERIAL,
	username VARCHAR(20),
	password VARCHAR(20),
	privileged BOOLEAN,
	PRIMARY KEY (id)	
);

INSERT INTO users
	(username, password, privileged)
VALUES
	('admin', 'admin', TRUE);

CREATE TABLE items (
	id SERIAL,
	name VARCHAR(60),
	price int,
	code VARCHAR(40),
	image VARCHAR(60),
	available BOOL,
	PRIMARY KEY (id)
);

INSERT INTO items
	(name, price, code, image)
	values
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 999, 'GA00006488', 'images/product-img1.jpg'),
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 255, 'GA00006488', 'images/product-img2.jpg'),
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 444, 'GA00006488', 'images/product-img3.jpg'),
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 598, 'GA00006488', 'images/product-img4.jpg'),
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 999, 'GA00006488', 'images/product-img4.jpg'),
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 255, 'GA00006488', 'images/product-img3.jpg'),
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 598, 'GA00006488', 'images/product-img1.jpg'),
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 49, 'GA00006488', 'images/product-img2.jpg'),
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 49, 'GA00006488', 'images/product-img5.jpg'),
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 542, 'GA00006488', 'images/product-img6.jpg'),
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 49, 'GA00006488', 'images/product-img7.jpg'),
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 322, 'GA00006488', 'images/product-img8.jpg'),
	('Apple Macbook Pro MQ032 14.5" Intel Core i7 5550U 8GB DDR3',
	 111, 'GA00006488', 'images/product-img1.jpg')
;

ALTER TABLE users
ADD CONSTRAINT unique_nick UNIQUE (username);

CREATE TABLE orders (
  id SERIAL,
  ordering_user INTEGER,
  PRIMARY KEY (id),
  FOREIGN KEY (ordering_user) references users (id)
);

CREATE TABLE ordered_items (
  id SERIAL,
  order_id INTEGER,
  product_id INTEGER,
  product_quantity INTEGER,
  PRIMARY KEY (id),
  FOREIGN KEY (order_id) REFERENCES orders (id),
  FOREIGN KEY (product_id) REFERENCES items (id)
);

ALTER TABLE items
	ADD available BOOL
	CONSTRAINT default_constraint DEFAULT TRUE;
