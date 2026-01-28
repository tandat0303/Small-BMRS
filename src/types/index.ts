export interface RoomListProps {
  filters: FilterState;
  rooms: Room[];
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
}

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
  Bpm_req: number | null;
  bpm_area_exc: string | null;
  isHideArea: number | null;
  isHideRoom: number | null;
}

export interface FilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onFactoryChange?: (factories: string[]) => void;
  rooms?: Room[];
  disabled?: boolean;
}

export interface MobileFilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onClose: () => void;
  onFactoryChange?: (factories: string[]) => void;
  rooms?: Room[];
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
    mode: "allDay" | "range" | null;
    startDateTime: string | null;
    endDateTime: string | null;
  };
  factories: string[];
}

export interface BookingModalProps {
  room: Room;
  onClose: () => void;
}

export interface BookingFormData {
  ID_Room: number;
  ID_User: string;
  Topic: string;
  Purpose: string;
  ID_User2: number;
  Time_Start: string;
  Time_End: string;
  Name_User: string;
  DP_User: string;
  idbpm?: number;
  dayOnly: string;
  dayOnlys: string[];
}

export interface LoginPayload {
  userId: string;
  password: string;
  factory: string;
}

export interface UserInfoPayload {
  factory: string;
  userId: string;
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

export interface UserInfo {
  Person_ID: string;
  Person_Serial_Key: string;
  Department_Serial_Key: string;
  Person_Name: string;
  Birthday: string;
  ID: string;
  ID_Day: string;
  Department_Name: string;
  Date_Come_In: string;
  Mobilephone_Number: string;
  Staying_Address: string;
  Tax_Code: string;
  birthday: string;
  mobilePhoneNumber: string;
  Email: string;
  Vehicle: string;
  Address_Live: string;
}
