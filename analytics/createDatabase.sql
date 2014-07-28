--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: member_actions; Type: TABLE; Schema: public; Owner: scrollback; Tablespace:
--

CREATE TABLE member_actions (
    id text,
    type text,
    "from" text,
    "to" text,
    "time" timestamp without time zone,
    session text,
    resource text,
    text text,
    ref text,
    role text,
    transitionrole text,
    transitiontype text,
    transitiontime timestamp without time zone,
    success boolean,
    primary key (id)
);


ALTER TABLE public.member_actions OWNER TO scrollback;

--
-- Name: occupant_actions; Type: TABLE; Schema: public; Owner: scrollback; Tablespace:
--

CREATE TABLE occupant_actions (
    id text,
    type text,
    "from" text,
    "to" text,
    "time" timestamp without time zone,
    session text,
    resource text,
    text text,
    success boolean,
    primary key (id)
);


ALTER TABLE public.occupant_actions OWNER TO scrollback;

--
-- Name: session_actions; Type: TABLE; Schema: public; Owner: scrollback; Tablespace:
--

CREATE TABLE session_actions (
    id text,
    type text,
    "from" text,
    "time" timestamp without time zone,
    session text,
    resource text,
    suggestednick text,
    authapp text,
    authdata text,
    gateway text,
    client inet,
    server text,
    domain text,
    path text,
    success boolean,
    primary key (id)
);


ALTER TABLE public.session_actions OWNER TO scrollback;

--
-- Name: text_actions; Type: TABLE; Schema: public; Owner: scrollback; Tablespace:
--

CREATE TABLE text_actions (
    id text NOT NULL,
    type text,
    "from" text,
    "to" text,
    "time" timestamp without time zone,
    session text,
    resource text,
    text text,
    ref text,
    mentions text[],
    labels text[],
    labelscores real[],
    threads text[],
    threadtitles text[],
    threadscores real[],
    success boolean,
    primary key (id)
);


ALTER TABLE public.text_actions OWNER TO scrollback;

--
-- Name: user_room_actions; Type: TABLE; Schema: public; Owner: scrollback; Tablespace:
--

CREATE TABLE user_room_actions (
    id text,
    type text,
    "from" text,
    "to" text,
    "time" timestamp without time zone,
    session text,
    resource text,
    creation boolean,
    description text,
    picture text,
    identities text[],
    timezone integer,
    params text,
    guides text,
    success boolean,
    primary key (id)
);


ALTER TABLE public.user_room_actions OWNER TO scrollback;

--
-- Data for Name: member_actions; Type: TABLE DATA; Schema: public; Owner: scrollback
--

COPY member_actions (id, type, "from", "to", "time", session, resource, text, ref, role, transitionrole, transitiontype, transitiontime, success) FROM stdin;
\.


--
-- Data for Name: occupant_actions; Type: TABLE DATA; Schema: public; Owner: scrollback
--

COPY occupant_actions (id, type, "from", "to", "time", session, resource, text, success) FROM stdin;
\.


--
-- Data for Name: session_actions; Type: TABLE DATA; Schema: public; Owner: scrollback
--

COPY session_actions (id, type, "from", "time", session, resource, suggestednick, authapp, authdata, gateway, client, server, origin, path, success) FROM stdin;
\.


--
-- Data for Name: text_actions; Type: TABLE DATA; Schema: public; Owner: scrollback
--

COPY text_actions (id, type, "from", "to", "time", session, resource, text, ref, mentions, labels, labelscores, threads, threadtitles, threadscores, success) FROM stdin;
\.


--
-- Data for Name: user_room_actions; Type: TABLE DATA; Schema: public; Owner: scrollback
--

COPY user_room_actions (id, type, "from", "to", "time", session, resource, iscreated, description, picture, identities, timezone, params, guides, success) FROM stdin;
\.


--
-- Name: text_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: scrollback; Tablespace:
--

ALTER TABLE ONLY text_actions
    ADD CONSTRAINT text_actions_pkey PRIMARY KEY (id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--
