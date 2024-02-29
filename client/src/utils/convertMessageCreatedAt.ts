function convertMessageCreatedAt(createdAt: number): string {
  const now = new Date();
  const created = new Date(createdAt);


  const timeDiff = now.getTime() - created.getTime();

  if (timeDiff < 60 * 1000) {
    return 'Just now';
  }
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const weeksDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7));
  const monthsDiff = Math.floor(weeksDiff / 4);

  if (monthsDiff >= 3) {
    return `${monthsDiff}w`;
  } else if (weeksDiff >= 1) {
    return `${weeksDiff}w`;
  } else if (daysDiff >= 1) {
    return `${daysDiff}d`;
  } else if (hoursDiff >= 1) {
    return `${hoursDiff}h`;
  } else {
    return `${minutesDiff}m`;
  }
}

export default convertMessageCreatedAt;
