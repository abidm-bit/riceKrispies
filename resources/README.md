# Schema 

create table public.users
(
    user_id serial primary key,
    email varchar(255) not null unique,
    password_hash varchar(255) not null,
    created_at CURRENT_TIMESTAMP not null
);

create table public.all_keys
(
    key  varchar(255) not null primary key,
    burned boolean not null,
    burned_by integer
    constraint allkeys_burned_by_fkey
    references public.users
);


