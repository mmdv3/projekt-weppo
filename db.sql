CREATE TABLE users (
	id SERIAL,
	nick VARCHAR(20),
	password VARCHAR(20),
	privileged BOOLEAN,
	PRIMARY KEY (id)	
);

INSERT INTO users
	(nick, password, privileged)
VALUES
	('admin', 'admin', TRUE);

CREATE TABLE items (
	id SERIAL,
	item VARCHAR(40),
	author VARCHAR(40),
	description VARCHAR(3000),
	description_short VARCHAR(100),
	image VARCHAR(60),
	price MONEY,
	PRIMARY KEY (id)
);

INSERT INTO items
	(item, author, description, description_short, image, price)
	VALUES
	('Photography',
	  'Best Author',
	  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus nec dui. Donec nec neque ut quam sodales feugiat. Nam sodales, pede vel dapibus lobortis, ipsum diam molestie risus, a vulputate risus nisl pulvinar lacus.',
	  'Etiam luctus. Quisque facilisis suscipit elit. Curabitur...',
	  'images/templatemo_image_01.jpg',
	  55),
	('Photography 2',
	  'Best Author',
	  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus nec dui. Donec nec neque ut quam sodales feugiat. Nam sodales, pede vel dapibus lobortis, ipsum diam molestie risus, a vulputate risus nisl pulvinar lacus.',
	  'Etiam luctus. Quisque facilisis suscipit elit. Curabitur...',
	  'images/templatemo_image_01.jpg',
	  55),
	('Photography 3',
	  'Best Author',
	  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus nec dui. Donec nec neque ut quam sodales feugiat. Nam sodales, pede vel dapibus lobortis, ipsum diam molestie risus, a vulputate risus nisl pulvinar lacus.',
	  'Etiam luctus. Quisque facilisis suscipit elit. Curabitur...',
	  'images/templatemo_image_01.jpg',
	  55),
	('Cooking',
	  'New Author',
	  '',
	  'Aliquam a dui, ac magna quis est eleifend dictum.',
	  'images/templatemo_image_02.jpg',
	  35),
	('Cooking 2',
	  'New Author',
	  '',
	  'Aliquam a dui, ac magna quis est eleifend dictum.',
	  'images/templatemo_image_02.jpg',
	  35),
	('Cooking 3',
	  'New Author',
	  '',
	  'Aliquam a dui, ac magna quis est eleifend dictum.',
	  'images/templatemo_image_02.jpg',
	  35),
	('Gardening',
	  'Famous Author',
	  '',
	  'Ut fringilla enim sed turpis. Sed justo dolor, convallis at.',
	  'images/templatemo_image_03.jpg',
	  65),
	('Gardening 2',
	  'Famous Author',
	  '',
	  'Ut fringilla enim sed turpis. Sed justo dolor, convallis at.',
	  'images/templatemo_image_03.jpg',
	  65),
	('Gardening 3',
	  'Famous Author',
	  '',
	  'Ut fringilla enim sed turpis. Sed justo dolor, convallis at.',
	  'images/templatemo_image_03.jpg',
	  65),
	('Sushi Book',
	  'Japanese Name',
	  '',
	  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	  'images/templatemo_image_04.jpg',
	  45),
	('Sushi Book 2',
	  'Japanese Name',
	  '',
	  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	  'images/templatemo_image_04.jpg',
	  45),
	('Sushi Book 3',
	  'Japanese Name',
	  '',
	  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	  'images/templatemo_image_04.jpg',
	  45)
; 

ALTER TABLE users
ADD CONSTRAINT unique_nick UNIQUE (nick);

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
