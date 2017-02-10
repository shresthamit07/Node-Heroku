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
