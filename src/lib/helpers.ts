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
    e.getHours(),
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

export const formatDate = (iso: string) => {
  const d = new Date(iso);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
};

const formatTime = (iso: string) => {
  const localIso = iso.replace("Z", "").split("+")[0];
  const d = new Date(localIso);

  const hours = d.getHours();
  const minutes = d.getMinutes();
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export const formatDateTimeRange = (start: string, end: string) => {
  return `${formatDate(start)} · ${formatTime(start)} - ${formatTime(end)}`;
};

export function setTimeToday(hour: number | undefined, minute = 0) {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
  ).toISOString();
}

export const formatLocalDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const dayNames: { [key: string]: string } = {
  monday: "thứ hai",
  tuesday: "thứ ba",
  wednesday: "thứ tư",
  thursday: "thứ năm",
  friday: "thứ sáu",
  saturday: "thứ bảy",
};

export const isOverlapping = (
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
) => aStart < bEnd && aEnd > bStart;

export const isUpcoming = (startTime: string) => {
  const startDate = new Date(startTime.replace('Z', ''));
  const now = new Date();
  return startDate > now;
};

export const formatDateTime = (dateTimeStr: string) => {
  const [datePart, timePart] = dateTimeStr.split('T');
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  
  return {
    date: `${day}/${month}/${year}`,
    time: `${hour}:${minute}`,
  };
};

export const formatRangeLabel = (startISO: string, endISO: string) => {
  const start = new Date(startISO);
  const end = new Date(endISO);

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = start.getMonth() === end.getMonth() && sameYear;

  const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  if (sameMonth) {
    return `${start.getDate()} - ${end.getDate()}/${start.getMonth() + 1}/${start.getFullYear()}, ${timeStr}`;
  }

  if (sameYear) {
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${start.getFullYear()}, ${timeStr}`;
  }

  return `${start.getDate()}/${start.getMonth() + 1}/${start.getFullYear()} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}, ${timeStr}`;
};
