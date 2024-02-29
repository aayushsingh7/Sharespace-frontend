const getReadableData = (createdAt:any)=> {
        const currentTime = new Date()
        //@ts-ignore
        const timeDifference = currentTime - createdAt;
        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);
      
        if (years >= 1) {
          return `${years} year${years > 1 ? 's' : ''}`;
        } else if (months >= 1) {
          return `${months} month${months > 1 ? 's' : ''}`;
        } else if (days >= 1) {
          return `${days} day${days > 1 ? 's' : ''}`;
        } else if (hours >= 1) {
          return `${hours} hour${hours > 1 ? 's' : ''}`;
        } else if (minutes >= 1) {
          return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
          return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
}

export default getReadableData;