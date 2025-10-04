--
-- PostgreSQL database dump
--

\restrict rpZ2hQLH05OlbakFR150ZMnJTMVr6Fm1hmqpePcENsRiqZc5gPIMhPZ7AjbIQve

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: stok_harian; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stok_harian (
    id integer NOT NULL,
    tanggal date NOT NULL,
    bolu_kukus integer NOT NULL,
    roti_gabin integer NOT NULL,
    pastel integer NOT NULL,
    martabak_telur integer NOT NULL,
    moci integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    mod integer
);


ALTER TABLE public.stok_harian OWNER TO postgres;

--
-- Name: stok_harian_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stok_harian_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stok_harian_id_seq OWNER TO postgres;

--
-- Name: stok_harian_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stok_harian_id_seq OWNED BY public.stok_harian.id;


--
-- Name: stok_harian id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stok_harian ALTER COLUMN id SET DEFAULT nextval('public.stok_harian_id_seq'::regclass);


--
-- Data for Name: stok_harian; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stok_harian (id, tanggal, bolu_kukus, roti_gabin, pastel, martabak_telur, moci, created_at, updated_at, mod) FROM stdin;
1	2025-09-30	12	12	2	12	12	2025-09-30 19:00:06.276803+07	2025-09-30 19:00:06.276803+07	\N
2	2025-09-27	45	45	45	45	45	2025-09-30 19:28:31.480206+07	2025-09-30 19:28:31.480206+07	\N
3	2025-10-01	12	12	12	12	12	2025-10-01 16:08:46.103276+07	2025-10-01 16:08:46.103276+07	0
6	2025-09-29	34	0	0	0	0	2025-10-01 23:32:15.13819+07	2025-10-01 23:32:15.13819+07	0
8	2025-09-28	88	0	0	0	0	2025-10-01 23:41:41.946416+07	2025-10-01 23:41:41.946416+07	0
21	2025-10-02	127	28	0	43	0	2025-10-03 23:34:52.093286+07	2025-10-03 23:34:52.093286+07	0
20	2025-10-03	123	28	50	32	28	2025-10-03 19:55:04.631221+07	2025-10-04 00:27:06.423872+07	1
29	2025-10-04	33	0	0	0	0	2025-10-04 17:08:56.16262+07	2025-10-04 17:08:56.16262+07	1
\.


--
-- Name: stok_harian_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stok_harian_id_seq', 32, true);


--
-- Name: stok_harian stok_harian_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stok_harian
    ADD CONSTRAINT stok_harian_pkey PRIMARY KEY (id);


--
-- Name: stok_harian stok_harian_tanggal_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stok_harian
    ADD CONSTRAINT stok_harian_tanggal_key UNIQUE (tanggal);


--
-- Name: stok_harian update_stok_harian_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_stok_harian_updated_at BEFORE UPDATE ON public.stok_harian FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- PostgreSQL database dump complete
--

\unrestrict rpZ2hQLH05OlbakFR150ZMnJTMVr6Fm1hmqpePcENsRiqZc5gPIMhPZ7AjbIQve

