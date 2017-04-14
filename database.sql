-- CREATE TABLE cust (
-- 	cust_id int NOT NULL primary key,
--     cust_name varchar(50) NOT NULL,
--     email varchar(50) NOT NULL,
--     password varchar(50) NOT NULL,
--     date_added timestamp default NULL
-- );


CREATE TABLE users (
	id SERIAL NOT NULL primary key unique,
    first_name varchar(50) NOT NULL,
    last_name varchar(50) NOT NULL,
    email varchar(50) NOT NULL unique,
    password varchar(100) NOT NULL,
    phone varchar NOT NULL,
    address varchar(100) NOT NULL,
    is_admin boolean NOT NULL DEFAULT FALSE,
    created_at timestamp default current_timestamp NOT NULL,
    updated_at timestamp default current_timestamp NOT NULL
);

CREATE TABLE products (
	id SERIAL NOT NULL primary key unique,
    name varchar(200) NOT NULL unique,
    description text,
    sku varchar(10) NOT NULL unique,
    country varchar(50) NOT NULL,
    category varchar(50) NOT NULL,
    type varchar(50) NOT NULL,
    price numeric(5,2) NOT NULL,
    quantity int NOT NULL,
    image varchar(100),
    volume varchar(50) NOT NULL,
    created_at timestamp default current_timestamp NOT NULL,
    updated_at timestamp default current_timestamp NOT NULL
);

CREATE TABLE orders (
    id SERIAL NOT NULL primary key unique,
    cust_name varchar(200) NOT NULL,
    email varchar(50) NOT NULL,
    phone varchar NOT NULL,
    delivery_address varchar(100) NOT NULL,
    cc_number varchar NOT NULL,
    cc_date varchar NOT NULL,
    cc_code varchar NOT NULL,
    comments varchar,
    created_at timestamp default current_timestamp NOT NULL,
    updated_at timestamp default current_timestamp NOT NULL
);

CREATE TABLE orders_products (
    id SERIAL NOT NULL primary key unique,
    orders_id REFERENCES orders (id),
    products_id int REFERENCES products (id),
    products_name varchar(200),
    products_price numeric(5,2) NOT NULL,
    quantity int NOT NULL,
    volume varchar(50) NOT NULL,
    image varchar(100),
    created_at timestamp default current_timestamp NOT NULL,
    updated_at timestamp default current_timestamp NOT NULL
);

CREATE TABLE products_purchase (
    id SERIAL NOT NULL primary key unique,
    products_id int REFERENCES products (id),
    purchase_count int NOT NULL,
    category varchar(50) NOT NULL,
    created_at timestamp default current_timestamp NOT NULL,
    updated_at timestamp default current_timestamp NOT NULL
);

CREATE TABLE ratings (
    id SERIAL NOT NULL primary key unique,
    products_id int REFERENCES products (id),
    users_id int REFERENCES users (id),
    r_value int NOT NULL,
    r_comment text,
    created_at timestamp default current_timestamp NOT NULL,
    updated_at timestamp default current_timestamp NOT NULL
);

CREATE TABLE recommendations (
    id SERIAL NOT NULL primary key unique,
    users_id int REFERENCES users (id),
    products_id int REFERENCES products (id),
    weighted_score numeric(5,2) NOT NULL,
    created_at timestamp default current_timestamp NOT NULL,
    updated_at timestamp default current_timestamp NOT NULL

    );

ALTER TABLE users
  ADD COLUMN "is_admin" BOOLEAN DEFAULT FALSE;


ALTER TABLE orders_products
  ADD COLUMN "volume" varchar(50) NOT NULL DEFAULT '750ml';
ALTER TABLE orders_products
  ALTER COLUMN "volume" DROP DEFAULT;