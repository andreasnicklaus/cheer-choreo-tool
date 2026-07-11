export interface User {
  id: string;
  username?: string;
  email?: string;
  emailConfirmed: boolean;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Club {
  id: string;
  name: string;
  ClubLogo?: string;
  createdAt?: string;
  updatedAt?: string;
  Teams?: Team[];
}

export interface Team {
  id: string;
  name: string;
  ClubId?: string;
  Club?: Club;
  createdAt?: string;
  updatedAt?: string;
  SeasonTeams: SeasonTeam[];
}

export interface Season {
  id: string;
  name: string;
  year: number;
  UserId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeasonTeam {
  id: string;
  SeasonID: string;
  TeamID?: string;
  Season?: Season;
  Team?: Team;
  Members?: Member[];
  Choreos?: Choreo[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  id: string;
  name: string;
  nickname?: string;
  abbreviation?: string;
  seasonTeamId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Choreo {
  id: string;
  name: string;
  counts: number;
  matType: string;
  SeasonTeamId: string;
  SeasonTeam?: SeasonTeam;
  Lineups: Lineup[];
  Hits: Hit[];
  Participants?: Participant[];
  createdAt: string;
  updatedAt: string;
  updaterId: string;
  updater: User;
  creatorId: string;
  creator: User;
  UserId: string;
  User: User;
}

export interface Lineup {
  id: string;
  startCount: number;
  endCount: number;
  choreoId?: string;
  Positions: Position[];
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id?: string;
  x: number;
  y: number;
  MemberId: string;
  Member?: Member;
  LineupId?: string;
  createdAt?: string;
  updatedAt?: string;
  timeOfManualUpdate?: string;
}

export interface ChoreoParticipation {
  id: string;
  ChoreoId: string;
  MemberId: string;
  color: string;
  createdAt: string;
}

export interface Participant extends Member {
  ChoreoParticipation: ChoreoParticipation;
}

export interface Hit {
  id: string;
  name: string;
  count: number;
  choreoId: string;
  MemberIds?: string[];
  Members: Member[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  type?: string;
  title: string;
  message: string;
  read?: boolean;
  createdAt: string;
}

export interface Feedback {
  id: string;
  stars: number;
  text: string;
  createdAt?: string;
}

export interface UserAccess {
  id: string;
  childEmail?: string;
  role: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatTypeOption {
  value: string;
  text: string;
}

export interface MatTypeGroup {
  label: string;
  options: MatTypeOption[];
}

export interface OwnerAccess {
  ownerUserId: string;
  role: string;
  enabled?: boolean;
  owner?: { username?: string; email?: string };
}
