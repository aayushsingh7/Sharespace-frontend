function convertPostCreatedAt(createdAt: string): string {
  let d =  parseInt(createdAt)
  const now = new Date();
  const created = new Date(d);

  // Calculate the time difference in milliseconds
  const timeDiff = now.getTime() - created.getTime();

  // Convert milliseconds to minutes, hours, and days
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const monthsDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
  const yearsDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));

  if (yearsDiff >= 1) {
    return yearsDiff === 1 ? '1 year ago' : `${yearsDiff} years ago`;
  } else if (monthsDiff >= 1) {
    return monthsDiff === 1 ? '1 month ago' : `${monthsDiff} months ago`;
  } else if (daysDiff >= 1) {
    return daysDiff === 1 ? '1 day ago' : `${daysDiff} days ago`;
  } else if (hoursDiff >= 1) {
    return hoursDiff === 1 ? '1 hour ago' : `${hoursDiff} hours ago`;
  } else if (minutesDiff >= 1) {
    return minutesDiff === 1 ? '1 minute ago' : `${minutesDiff} minutes ago`;
  } else {
    return 'just now';
  }
}

export default convertPostCreatedAt;
