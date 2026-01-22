export interface Room {
  ID_Room: number;
  Name: string;
  Area: string;
  floor: string;
  Capacity: number;
  imageRoom: string;
  Factory: string;
  ID_Area: number;
  note: string;
  Bpm_req: string | null;
  bpm_area_exc: string | null;
  isHideArea: number | null;
  isHideRoom: number | null;
}

export interface Meeting {
  ID_Schedule: number;
  ID_Room: number;
  Room_Name: string;
  Area: string;
  Start_Time: string;
  End_Time: string;
  Meeting_Name: string;
  Department: string;
  Host_Name: string;
  Host_ID: string;
  Status: string;
  Created_Date: string;
}

export interface FilterState {
  dateRange: {
    start: string | null;
    end: string | null;
  };
  areas: string[];
  capacities: number[];
  roomStatus: 'all' | 'available' | 'occupied';
}

export interface BookingFormData {
  roomId: number;
  date: string;
  startTime: string;
  endTime: string;
  meetingName: string;
  department: string;
  hostName: string;
}

export interface LoginPayload {
  userId: string,
  password: string,
  factory: string,
}