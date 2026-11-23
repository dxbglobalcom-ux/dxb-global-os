-- The foundation's five roles: the owner of the schema os, which never logs in, and the four logins of the
-- system. Each holds no attribute but LOGIN and is a member of nothing. No password is written in the chain:
-- the bench's install step (or, later, the company's) gives each login its own, as a verifier only. The installer
-- that runs this file is named by session_user and may act as the owner (SET), never inherit what it holds.
-- A new role gives its maker nothing but what this file grants; the runner applies the file in one transaction, so the setting dies with it.
set local createrole_self_grant to '';
create role os_owner   nologin nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
create role os_engine   login   nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
create role os_executor login   nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
create role os_intake   login   nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
create role os_reader   login   nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
do $installer$ begin execute format('grant os_owner to %I with set true, inherit false', session_user); end $installer$;
