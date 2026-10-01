-- PostgreSQL design draft. Not applied to a production database.
begin;
create table clubs (
  id bigint generated always as identity primary key,
  name text not null check (length(trim(name)) > 0),
  source_url text
);
create table players (
  id bigint generated always as identity primary key,
  name text not null check (length(trim(name)) > 0),
  birth_date date,
  nationality text,
  external_ids jsonb not null default '{}'
);
create table matches (
  id bigint generated always as identity primary key,
  home_club_id bigint not null references clubs(id),
  away_club_id bigint not null references clubs(id),
  kickoff timestamptz,
  season text not null,
  source_url text,
  provenance text not null check (provenance in ('sample','manual_unverified','licensed')),
  quality text not null default 'draft' check (quality in ('draft','reviewed','published')),
  coach_home text,
  coach_away text,
  home_goals smallint check(home_goals >= 0),
  away_goals smallint check(away_goals >= 0),
  check(home_club_id <> away_club_id)
);
create index matches_home on matches(home_club_id, kickoff);
create index matches_away on matches(away_club_id, kickoff);
create table appearances (
  match_id bigint not null references matches(id),
  player_id bigint not null references players(id),
  side smallint not null check(side in (0,1)),
  shirt_number smallint not null check(shirt_number between 1 and 999),
  position text not null check(position in ('GK','DF','MF','FW')),
  starter boolean not null,
  minutes_played smallint check(minutes_played between 0 and 130),
  primary key(match_id, player_id),
  unique(match_id, side, shirt_number)
);
create index appearances_player on appearances(player_id, match_id);
create table events (
  id bigint generated always as identity primary key,
  match_id bigint not null,
  player_id bigint not null,
  source_event_id text not null,
  opponent_id bigint,
  minute smallint not null check(minute between 0 and 130),
  second smallint not null check(second between 0 and 59),
  period smallint not null check(period between 1 and 4),
  type text not null check(type in ('touch','pass','shot','goal','assist','key_pass','big_chance_missed','interception','tackle','dribble','duel','recovery','goal_line_clearance','dangerous_loss','error_goal','save','claim','yellow','red','penalty_foul')),
  x numeric not null check(x between 0 and 105),
  y numeric not null check(y between 0 and 68),
  end_x numeric check(end_x between 0 and 105),
  end_y numeric check(end_y between 0 and 68),
  success boolean not null,
  xg numeric check(xg between 0 and 1),
  xgot numeric check(xgot between 0 and 1),
  danger_in_box boolean not null default false,
  foreign key(match_id, player_id) references appearances(match_id, player_id),
  foreign key(match_id, opponent_id) references appearances(match_id, player_id),
  unique(match_id, source_event_id),
  check((end_x is null) = (end_y is null)),
  check(type not in ('pass','key_pass') or end_x is not null),
  check(opponent_id is null or opponent_id <> player_id)
);
-- An importer must also verify the opponent belongs to the other side.
create index events_player_time on events(match_id, player_id, minute, second);
create index events_match_time on events(match_id, minute, second);
create index events_opponent on events(match_id, opponent_id) where opponent_id is not null;
create table ratings (
  match_id bigint not null,
  player_id bigint not null,
  algorithm_version text not null,
  score numeric check(score between 1 and 10),
  event_count integer not null check(event_count >= 0),
  breakdown jsonb not null,
  calculated_at timestamptz not null default now(),
  primary key(match_id, player_id, algorithm_version),
  foreign key(match_id, player_id) references appearances(match_id, player_id)
);
create table contracts (
  id bigint generated always as identity primary key,
  player_id bigint not null references players(id),
  club_id bigint not null references clubs(id),
  starts_on date,
  ends_on date,
  source_url text,
  quality text not null default 'unverified' check(quality in ('unverified','reviewed')),
  check(ends_on is null or starts_on is null or ends_on >= starts_on)
);
create index contracts_player on contracts(player_id, ends_on);
create index contracts_club on contracts(club_id, ends_on);
create table valuation_scenarios (
  id bigint generated always as identity primary key,
  player_id bigint not null references players(id),
  calculated_at timestamptz not null default now(),
  algorithm_version text not null,
  input jsonb not null,
  value_eur numeric not null check(value_eur >= 0),
  simulated_vnd numeric not null check(simulated_vnd >= 0),
  provenance text not null default 'scenario' check(provenance = 'scenario')
);
create index valuations_player_time on valuation_scenarios(player_id, calculated_at desc);
commit;
