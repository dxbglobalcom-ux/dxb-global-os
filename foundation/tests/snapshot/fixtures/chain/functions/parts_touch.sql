create or replace function os.parts_touch() returns trigger language plpgsql as $$
begin
  new.qty := coalesce(new.qty, 1);
  return new;
end;
$$;
