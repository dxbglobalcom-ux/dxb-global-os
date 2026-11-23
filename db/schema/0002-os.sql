-- The schema os, the owner's, and the owner's default privileges: what the owner makes from here on gives PUBLIC
-- nothing — no EXECUTE on a function or procedure, no USAGE on a type or domain. Said globally, as the owner
-- itself: said "in schema os" they would close nothing.
create schema os authorization os_owner;
set role os_owner;
alter default privileges revoke execute on functions from public;
alter default privileges revoke usage on types from public;
