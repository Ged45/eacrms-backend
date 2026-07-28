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

export interface ApproveClubDTO {
  approvedBy: string;
}

export interface RejectClubDTO {
  reason: string;
  rejectedBy: string;
}


