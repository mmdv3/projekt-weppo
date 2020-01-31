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
	('admin', 'admin', TRUE) ;

CREATE TABLE items (
	id SERIAL,
	item VARCHAR(40),
	description VARCHAR(120),
	PRIMARY KEY (id)
);

INSERT INTO items
	(item, description)
	VALUES
	('karma dla psa(biała)', 'zwykłej jakości karma dla psa'),
	('karma dla kota(biała)', 'zwykłej jakości karma dla kota'),
	('karma dla konia(biała)', 'zwykłej jakości karma dla konia'),
	('karma dla papugi(biała)', 'zwykłej jakości karma dla papugi'),
	('karma dla psa(żółta)', 'lepszej jakości karma dla psa'),
	('karma dla kota(żółta)', 'lepszej jakości karma dla kota'),
	('karma dla konia(żółta)', 'lepszej jakości karma dla konia'),
	('karma dla papugi(żółta)', 'lepszej jakości karma dla papugi'),
	('karma dla psa(niebieska)', 'najlepszej jakości karma dla psa'),
	('karma dla kota(niebieska)', 'najlepszej jakości karma dla kota'),
	('karma dla konia(niebieska)', 'najlepszej jakości karma dla konia'),
	('karma dla papugi(niebieska)', 'najlepszej jakości karma dla papugi')
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
