-- PostgreSQL database structure dump for SkyNet

-- Basic session configuration
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Custom TYPE definitions
CREATE TYPE public.user_role AS ENUM (
    'ADMIN',
    'SUPERVISOR',
    'TECHNICIAN'
);
ALTER TYPE public.user_role OWNER TO postgres;

CREATE TYPE public.visit_log_event AS ENUM (
    'CHECKIN',
    'CHECKOUT'
);
ALTER TYPE public.visit_log_event OWNER TO postgres;

CREATE TYPE public.visit_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'FINISHED',
    'CANCELLED'
);
ALTER TYPE public.visit_status OWNER TO postgres;

SET default_tablespace = '';
SET default_table_access_method = heap;

-- Table: clients
CREATE TABLE public.clients (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    address text,
    contact_name character varying(100),
    phone character varying(20),
    lat numeric(10,8) NOT NULL,
    lng numeric(11,8) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    email character varying(100)
);
ALTER TABLE public.clients OWNER TO postgres;

CREATE SEQUENCE public.clients_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.clients_id_seq OWNER TO postgres;
ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;

-- Table: users
CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role NOT NULL,
    supervisor_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.users OWNER TO postgres;

CREATE SEQUENCE public.users_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.users_id_seq OWNER TO postgres;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

-- Table: visits
CREATE TABLE public.visits (
    id integer NOT NULL,
    client_id integer NOT NULL,
    technician_id integer NOT NULL,
    supervisor_id integer NOT NULL,
    planned_at timestamp with time zone NOT NULL,
    status public.visit_status DEFAULT 'PENDING'::public.visit_status,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.visits OWNER TO postgres;

CREATE SEQUENCE public.visits_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.visits_id_seq OWNER TO postgres;
ALTER SEQUENCE public.visits_id_seq OWNED BY public.visits.id;

-- Table: visit_logs
CREATE TABLE public.visit_logs (
    id integer NOT NULL,
    visit_id integer NOT NULL,
    event_type public.visit_log_event NOT NULL,
    occurred_at timestamp with time zone DEFAULT now(),
    lat numeric(10,8),
    lng numeric(11,8)
);
ALTER TABLE public.visit_logs OWNER TO postgres;

CREATE SEQUENCE public.visit_logs_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.visit_logs_id_seq OWNER TO postgres;
ALTER SEQUENCE public.visit_logs_id_seq OWNED BY public.visit_logs.id;

-- Table: visit_reports
CREATE TABLE public.visit_reports (
    id integer NOT NULL,
    visit_id integer NOT NULL,
    summary text NOT NULL,
    minutes_spent integer,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.visit_reports OWNER TO postgres;

CREATE SEQUENCE public.visit_reports_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.visit_reports_id_seq OWNER TO postgres;
ALTER SEQUENCE public.visit_reports_id_seq OWNED BY public.visit_reports.id;

-- Set default values for ID columns to use sequences
ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY public.visits ALTER COLUMN id SET DEFAULT nextval('public.visits_id_seq'::regclass);
ALTER TABLE ONLY public.visit_logs ALTER COLUMN id SET DEFAULT nextval('public.visit_logs_id_seq'::regclass);
ALTER TABLE ONLY public.visit_reports ALTER COLUMN id SET DEFAULT nextval('public.visit_reports_id_seq'::regclass);

-- Define Primary and Unique Keys
ALTER TABLE ONLY public.clients ADD CONSTRAINT clients_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.visits ADD CONSTRAINT visits_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.visit_logs ADD CONSTRAINT visit_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.visit_reports ADD CONSTRAINT visit_reports_pkey PRIMARY KEY (id);

-- Define Foreign Key relationships
ALTER TABLE ONLY public.users ADD CONSTRAINT users_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.visits ADD CONSTRAINT visits_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.visits ADD CONSTRAINT visits_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.visits ADD CONSTRAINT visits_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.visit_logs ADD CONSTRAINT visit_logs_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.visit_reports ADD CONSTRAINT visit_reports_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id) ON DELETE CASCADE;