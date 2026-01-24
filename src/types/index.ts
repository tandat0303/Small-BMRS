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
export interface FilterState {
  dateRange: {
    start: string | null;
    end: string | null;
  };
  areas: string[];
  capacities: number[];
  roomStatus: "available" | "occupied" | null;
  timeFilter: {
    mode: 'allDay' | 'range' | null;
    startDateTime: string | null;
    endDateTime: string | null;
  }
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
  userId: string;
  password: string;
  factory: string;
}
export interface Schedule {
  ID_Schedule: number;
  ID_Room: number;
  ID_User: string;
  imageRoom: string;
  Topic: string;
  Purpose: string;
  Time_Start: string;
  Time_End: string;
  Capacity: number;
  Name: string;
  Factory: string;
  Area: string;
  Name_User: string;
  DP_User: string;
  Cancel: string | null;
}
