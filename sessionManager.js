/**
 * Session Manager with Inactivity Timeout
 * Manages user sessions and automatically logs out users after 15 minutes of inactivity
 */

class SessionManager {
  constructor() {
    this.sessions = new Map(); // Store active sessions
    this.INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.CLEANUP_INTERVAL = 5 * 60 * 1000; // Check for inactive sessions every 5 minutes
    
    // Start periodic cleanup process
    this.startCleanupProcess();
  }

  /**
   * Create a new session for a user
   * @param {string} token - JWT token
   * @param {object} user - User object containing id, emailid, username
   * @param {string} ipAddress - Client IP address
   * @returns {object} Session object
   */
  createSession(token, user, ipAddress = null) {
    const sessionId = this.generateSessionId();
    const now = Date.now();

    const session = {
      sessionId,
      token,
      userId: user.id,
      emailid: user.emailid,
      username: user.username,
      createdAt: now,
      lastActivityAt: now,
      ipAddress,
      isActive: true
    };

    this.sessions.set(sessionId, session);

    console.log(`✓ Session created - SessionID: ${sessionId}, User: ${user.emailid}`);
    return session;
  }

  /**
   * Update last activity timestamp for a session
   * @param {string} token - JWT token to identify session
   * @returns {boolean} True if session was updated, false if not active
   */
  updateActivity(token) {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.token === token && session.isActive) {
        session.lastActivityAt = Date.now();
        return true;
      }
    }
    return false;
  }

  /**
   * Validate if a session is still active
   * @param {string} token - JWT token
   * @returns {object|null} Session object if valid, null otherwise
   */
  validateSession(token) {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.token === token && session.isActive) {
        return session;
      }
    }
    return null;
  }

  /**
   * Get session by token
   * @param {string} token - JWT token
   * @returns {object|null} Session object or null
   */
  getSessionByToken(token) {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.token === token) {
        return session;
      }
    }
    return null;
  }

  /**
   * Logout a user by invalidating their session
   * @param {string} token - JWT token
   * @returns {object} Result object with success status
   */
  logout(token) {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.token === token) {
        const logoutData = {
          sessionId: session.sessionId,
          userId: session.userId,
          emailid: session.emailid,
          username: session.username,
          logoutTime: new Date().toISOString(),
          sessionDuration: Math.round((Date.now() - session.createdAt) / 1000) // in seconds
        };

        session.isActive = false;
        this.sessions.delete(sessionId);

        console.log(`✓ Session logged out - SessionID: ${sessionId}, User: ${session.emailid}, Duration: ${logoutData.sessionDuration}s`);
        return {
          success: true,
          message: 'Logout successful',
          data: logoutData
        };
      }
    }

    return {
      success: false,
      message: 'Session not found or already logged out'
    };
  }

  /**
   * Logout all sessions for a specific user
   * @param {number} userId - User ID
   * @returns {object} Result with count of sessions logged out
   */
  logoutAllUserSessions(userId) {
    let count = 0;
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId && session.isActive) {
        session.isActive = false;
        this.sessions.delete(sessionId);
        count++;
      }
    }
    console.log(`✓ All sessions logged out for user ${userId} - Count: ${count}`);
    return {
      success: true,
      message: `${count} session(s) logged out`,
      count
    };
  }

  /**
   * Periodically check for inactive sessions and logout users
   */
  startCleanupProcess() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let inactiveCount = 0;

      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.isActive) {
          const inactivityDuration = now - session.lastActivityAt;

          if (inactivityDuration > this.INACTIVITY_TIMEOUT) {
            session.isActive = false;
            this.sessions.delete(sessionId);
            inactiveCount++;

            console.log(`✓ Session auto-logout (inactivity) - SessionID: ${sessionId}, User: ${session.emailid}, Inactivity: ${Math.round(inactivityDuration / 1000)}s`);
          }
        }
      }

      if (inactiveCount > 0) {
        console.log(`[Cleanup] Removed ${inactiveCount} inactive session(s)`);
      }
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Get all active sessions (admin/debug purpose)
   * @returns {array} Array of active sessions
   */
  getAllActiveSessions() {
    const activeSessions = [];
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.isActive) {
        activeSessions.push({
          sessionId: session.sessionId,
          userId: session.userId,
          emailid: session.emailid,
          username: session.username,
          createdAt: new Date(session.createdAt).toISOString(),
          lastActivityAt: new Date(session.lastActivityAt).toISOString(),
          inactivityMinutes: Math.round((Date.now() - session.lastActivityAt) / 60000),
          ipAddress: session.ipAddress
        });
      }
    }
    return activeSessions;
  }

  /**
   * Get session statistics
   * @returns {object} Statistics object
   */
  getStats() {
    let activeCount = 0;
    let totalCount = this.sessions.size;

    for (const session of this.sessions.values()) {
      if (session.isActive) activeCount++;
    }

    return {
      activeSessionsCount: activeCount,
      totalSessionsCount: totalCount,
      inactivityTimeoutMinutes: this.INACTIVITY_TIMEOUT / 60000
    };
  }

  /**
   * Generate a unique session ID
   * @returns {string} Random session ID
   */
  generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Stop the cleanup process (useful for testing or graceful shutdown)
   */
  stopCleanupProcess() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      console.log('✓ Session cleanup process stopped');
    }
  }

  /**
   * Clear all sessions (useful for testing)
   */
  clearAllSessions() {
    this.sessions.clear();
    console.log('✓ All sessions cleared');
  }
}

// Export singleton instance
module.exports = new SessionManager();
