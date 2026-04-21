/**
 * Service to handle profile-related operations like interests and likes.
 */

export const profileService = {
  /**
   * Sends an interest to another user.
   */
  sendInterest: async (fromUserId: string, toUserId: string) => {
    const res = await fetch('/api/interests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromUserId, toUserId })
    });
    if (!res.ok) throw new Error('Failed to send interest');
    return res.json();
  },

  /**
   * Likes or unlikes a profile.
   */
  toggleLike: async (userId: string, targetProfileId: string) => {
    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetProfileId })
    });
    if (!res.ok) throw new Error('Failed to toggle like');
    return res.json();
  },

  /**
   * Fetches a single profile by ID.
   */
  getProfile: async (id: string) => {
    const res = await fetch(`/api/profiles/${id}`);
    if (!res.ok) throw new Error('Profile not found');
    return res.json();
  },

  /**
   * Fetches likes for a user.
   */
  getLikes: async (userId: string) => {
    const res = await fetch(`/api/likes/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch likes');
    return res.json();
  },

  /**
   * Fetches sent interests for a user.
   */
  getSentInterests: async (userId: string) => {
    const res = await fetch(`/api/interests/sent/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch sent interests');
    return res.json();
  },

  /**
   * Updates a user profile.
   */
  updateProfile: async (id: string, data: any) => {
    const res = await fetch(`/api/profiles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }
    return res.json();
  }
};
