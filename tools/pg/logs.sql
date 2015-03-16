
--
-- Name: member_actions; Type: TABLE; Schema: public; Owner: scrollback; Tablespace:
--

CREATE TABLE member_actions (
    id text,
    type text,
    "from" text,
    "to" text,
    "time" timestamp without time zone,
    gateway text,
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



--
-- Name: occupant_actions; Type: TABLE; Schema: public; Owner: scrollback; Tablespace:
--

CREATE TABLE occupant_actions (
    id text,
    type text,
    "from" text,
    "to" text,
    "time" timestamp without time zone,
    gateway text,
    session text,
    resource text,
    text text,
    success boolean,
    primary key (id)
);



--
-- Name: session_actions; Type: TABLE; Schema: public; Owner: scrollback; Tablespace:
--

CREATE TABLE session_actions (
    id text,
    type text,
    "from" text,
    "time" timestamp without time zone,
    gateway text,
    session text,
    resource text,
    suggestednick text,
    authapp text,
    authdata text,
    client inet,
    server text,
    domain text,
    path text,
    success boolean,
    primary key (id)
);



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
	gateway text,
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


--
create table time_queries_actions ( id text, type text, "timestamp" timestamp without time zone , "time" integer, primary key (id) );
create index type_timestamp_time on time_queries_actions (type, timestamp, time);
create index "time" on time_queries_actions (time);
create index timestamp_time on time_queries_actions (timestamp, time);
