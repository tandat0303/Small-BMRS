export const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const getDaysInMonth = (date: Date) => {
  const y = date.getFullYear();
  const m = date.getMonth();
  return {
    days: new Date(y, m + 1, 0).getDate(),
    start: new Date(y, m, 1).getDay(),
  };
};

export const formatTimeRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(s.getHours())}:${pad(s.getMinutes())} – ${pad(
    e.getHours()
  )}:${pad(e.getMinutes())}`;
};

export const getMeetingStatus = (start: string, end: string) => {
  const now = new Date();
  const s = new Date(start);
  const e = new Date(end);

  if (now >= s && now <= e) return "ongoing";
  if (now < s) return "upcoming";
  return "ended";
};

const formatDate = (iso: string) => {
  const d = new Date(iso);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
};

const formatTime = (iso: string) => {
  const localIso = iso.replace('Z', '').split('+')[0];
  const d = new Date(localIso);
  
  const hours = d.getHours();
  const minutes = d.getMinutes();
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export const formatDateTimeRange = (start: string, end: string) => {
  return `${formatDate(start)} · ${formatTime(start)} - ${formatTime(end)}`;
};

export function setTimeToday(hour, minute = 0) {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute
  ).toISOString();
}


