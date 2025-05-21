// Format date to display in message separators
export const formatMessageDate = (timestamp: string | Date): string => {
  let date: Date;

  try {
    // Handle different timestamp formats
    if (typeof timestamp === 'string') {
      // Try to parse the timestamp
      date = new Date(timestamp);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        // If invalid, try to parse as ISO string without milliseconds
        const simplifiedTimestamp = timestamp.split('.')[0] + 'Z';
        date = new Date(simplifiedTimestamp);

        // If still invalid, return a fallback
        if (isNaN(date.getTime())) {
          console.error("Invalid date format:", timestamp);
          return "Unknown date";
        }
      }
    } else {
      date = timestamp;
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Format as "Today", "Yesterday", or specific date
    if (isSameDay(date, today)) {
      return "Today";
    } else if (isSameDay(date, yesterday)) {
      return "Yesterday";
    } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown date";
  }
};

// Check if two dates are the same day
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Format timestamp for display in messages
export const formatMessageTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid time";
  }

    // Format as HH:MM
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid time";
  }
};

// Group messages by date
export const groupMessagesByDate = (messages: any[]) => {
  if (!messages || messages.length === 0) {
    return [];
  }

  const groups: { [key: string]: any[] } = {};

  messages.forEach(message => {
    try {
      // Get date from timestamp
      let messageDate: Date;

      if (typeof message.originalTimeStamp === 'string') {
        messageDate = new Date(message.originalTimeStamp);

        // Check if the date is valid
        if (isNaN(messageDate.getTime())) {
          // Try to parse as ISO string without milliseconds
          const simplifiedTimestamp = message.originalTimeStamp.split('.')[0] + 'Z';
          messageDate = new Date(simplifiedTimestamp);

          // If still invalid, use current date as fallback
          if (isNaN(messageDate.getTime())) {
            console.error("Invalid message timestamp:", message.originalTimeStamp);
            messageDate = new Date(); // Fallback to current date
          }
        }
      } else {
        messageDate = new Date(); // Fallback to current date
      }

      // Use YYYY-MM-DD as the key
      const dateKey = `${messageDate.getFullYear()}-${String(messageDate.getMonth() + 1).padStart(2, '0')}-${String(messageDate.getDate()).padStart(2, '0')}`;

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(message);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  // Convert to array of { date, messages } objects and sort by date
  return Object.entries(groups)
    .map(([dateKey, messages]) => ({
      date: dateKey,
      displayDate: formatMessageDate(new Date(dateKey)),
      messages
    }))
    .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date ascending
};

// Format a date object to YYYY-MM-DD string
export const formatDateToString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
