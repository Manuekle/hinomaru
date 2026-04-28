-- Hour of day (0-23, local TZ) when the user wants a daily review reminder.
alter table profiles
  add column if not exists reminder_hour int not null default 19;
