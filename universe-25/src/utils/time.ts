// =============================================================================
// [GLOBAL TIME FORMATTING UTILITY]
// Hàm chuẩn hóa giá trị thời gian (giây hoặc milliseconds) thành time string:
// - Dưới 1 giờ: mm:ss (ví dụ: 03:45, 00:30)
// - Từ 1 giờ trở lên: hh:mm:ss (ví dụ: 01:23:45)
// =============================================================================

export function formatDuration(seconds: number | string | null | undefined): string {
  if (seconds === null || seconds === undefined || seconds === '') {
    return '--:--';
  }

  let sec = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
  if (isNaN(sec) || sec < 0) {
    return '--:--';
  }

  sec = Math.floor(sec);

  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const remainingSecs = sec % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(remainingSecs)}`;
  }
  return `${pad(mins)}:${pad(remainingSecs)}`;
}
