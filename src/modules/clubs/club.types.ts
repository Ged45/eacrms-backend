export interface RegisterClubDTO {
  name: string;
  shortName?: string;

  email?: string;
  phone?: string;

  address?: string;
  city?: string;
  region?: string;

  licenseNumber?: string;
  logoUrl?: string;
}

export interface RegisterClubAdminDTO {
  // User fields
  email?: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;

  // Club fields
  clubName: string;
  clubShortName?: string;
  clubEmail?: string;
  clubPhone?: string;
  clubAddress?: string;
  clubCity?: string;
  clubRegion?: string;
  licenseNumber?: string;
  logoUrl?: string;
}

export interface ApproveClubDTO {
  approvedBy: string;
}

export interface RejectClubDTO {
  reason: string;
  rejectedBy: string;
}


