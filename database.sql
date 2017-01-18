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
    update_at timestamp default current_timestamp NOT NULL
);