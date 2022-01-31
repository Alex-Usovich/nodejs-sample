const sql = {
  CREATE_CONVERSATION_MESSAGE: `
    INSERT INTO conversation_messages (convo_id, frombot, requested, respond, message_uid)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING conversation_messages.id;`,
  SELECT_CONVERSATION_MESSAGES_BY_CONVERSATION: `
    SELECT
      conversations.started_at,
      conversations.finished_at,
      users.email AS "userEmail",
      users.id AS "userId",
      conversation_messages.requested,
      conversation_messages.respond,
      conversation_messages.created_at,
      conversation_messages.message_uid
    FROM conversation_messages
      INNER JOIN conversations ON
        conversations.id = conversation_messages.convo_id
      INNER JOIN users ON
        users.id = conversations.user_id    
      WHERE conversations.id = $1;`,
  SELECT_CONVERSATION_MESSAGES_BY_USER: `
    SELECT
      conversations.started_at,
      conversations.finished_at,
      users.email AS "userEmail",
      users.id AS "userId",
      conversation_messages.frombot,
      conversation_messages.requested,
      conversation_messages.respond,
      conversation_messages.created_at,
      conversation_messages.message_uid
    FROM conversation_messages
      INNER JOIN conversations ON
        conversations.id = conversation_messages.convo_id
      INNER JOIN users ON
        users.id = conversations.user_id    
      WHERE users.email = $1
    ORDER BY  conversation_messages.created_at DESC
    LIMIT $2;`,
  SELECT_CONVERSATION_MESSAGES_BY_USER_PAGINATION: `
    SELECT 
      conversations.started_at,
      conversations.finished_at,
      users.email AS "userEmail",
      users.id AS "userId",
      conversation_messages.frombot,
      conversation_messages.requested,
      conversation_messages.respond,
      conversation_messages.created_at,
      conversation_messages.message_uid 
    FROM conversation_messages
      INNER JOIN conversations ON
        conversations.id = conversation_messages.convo_id
      INNER JOIN users ON
        users.id = conversations.user_id    
    WHERE conversation_messages.id < 
      (SELECT id
        FROM conversation_messages
        WHERE conversation_messages.message_uid = $2)
        AND users.email = $1
    ORDER BY created_at DESC
    LIMIT $3`,
  SELECT_CONVERSATION_MESSAGES_COUNT: `
    SELECT
      COUNT(*) as "messages_count"
    FROM conversation_messages
      INNER JOIN conversations ON
        conversations.id = conversation_messages.convo_id
      INNER JOIN users ON
        users.id = conversations.user_id    
    WHERE users.email = $1;`,
  SELECT_CONVERSATION_MESSAGES_COUNT_TODAY: `
    SELECT
      COUNT(*) as "messages_count"
    FROM conversation_messages
      INNER JOIN conversations ON
        conversations.id = conversation_messages.convo_id
      INNER JOIN users ON
        users.id = conversations.user_id    
    WHERE users.email = $1 
      AND conversation_messages.created_at::date = current_date;`,
  GET_24H_ACTIVITY: `
    SELECT 
      COUNT(*)
    FROM 
    (
      SELECT 
        COUNT(*) as entries_count
      FROM conversation_messages 
        INNER JOIN conversations ON conversations.id = conversation_messages.convo_id
        INNER JOIN users ON users.id = conversations.user_id
      WHERE 
        users.email = $1 AND conversation_messages.created_at >= (now() - interval '24 hours')
      UNION
      SELECT
        COUNT(*) as entries_count
      FROM metrics 
        INNER JOIN users ON users.id = metrics.user_id
      WHERE
        users.email = $1 AND metrics.created_at >= (now() - interval '24 hours')
      UNION
      SELECT
        COUNT(*) as entries_count
      FROM feeling 
        INNER JOIN users ON users.id = feeling.user_id
      WHERE
        users.email = $1 AND feeling.created_at >= (now() - interval '24 hours')
    ) as data
    WHERE entries_count > 0`,
  GET_48H_ACTIVITY: `
    SELECT 
      COUNT(*)
    FROM 
    (
      SELECT 
        COUNT(*) as entries_count
      FROM conversation_messages 
        INNER JOIN conversations ON conversations.id = conversation_messages.convo_id
        INNER JOIN users ON users.id = conversations.user_id
      WHERE 
        users.email = $1 AND conversation_messages.created_at >= (now() - interval '48 hours')
      UNION
      SELECT
        COUNT(*) as entries_count
      FROM metrics 
        INNER JOIN users ON users.id = metrics.user_id
      WHERE
        users.email = $1 AND metrics.created_at >= (now() - interval '48 hours')
      UNION
      SELECT
        COUNT(*) as entries_count
      FROM feeling 
        INNER JOIN users ON users.id = feeling.user_id
      WHERE
        users.email = $1 AND feeling.created_at >= (now() - interval '48 hours')
    ) as data
    WHERE entries_count > 0`
};

class ConversationMessageRepository {
  constructor(db) {
    this.db = db;
  }

  async getConversationMessages(conversation) {
    try {
      return await this.db.manyOrNone(
        sql.SELECT_CONVERSATION_MESSAGES_BY_CONVERSATION,
        [ conversation ]
      );
    } catch (e) {
      throw e;
    }
  }

  async getUserConversationMessages(email) {
    try {
      return await this.db.manyOrNone(
        sql.SELECT_CONVERSATION_MESSAGES_BY_USER,
        [ email ]
      );
    } catch (e) {
      throw e;
    }
  }

  async createUserConversationMessage(conversationMessage) {
    try {
      const mess = await this.db.one(
        sql.CREATE_CONVERSATION_MESSAGE,
          [
            conversationMessage.convo_id,
            JSON.stringify(!!conversationMessage.frombot),
            JSON.stringify(conversationMessage.requested),
            JSON.stringify(conversationMessage.respond),
            conversationMessage.message_uid
          ]
      );

      return mess;
    } catch (e) {
      console.log('E: ',e);
      throw e;
    }
  }

  async getInitialHistory({normalized, amount}) {
    try {
      return await this.db.manyOrNone(
        sql.SELECT_CONVERSATION_MESSAGES_BY_USER,
        [ normalized, amount ]
      );
    } catch (e) {
      throw e;
    }
  }

  async getHistory({ normalized, message_uid, amountPerPage }) {
    try {
      return await this.db.manyOrNone(
        sql.SELECT_CONVERSATION_MESSAGES_BY_USER_PAGINATION,
        [ normalized, message_uid, amountPerPage ]
      );
    } catch (e) {
      throw e;
    }
  }

  async getMessagesCount({normalized}) {
     try {
       return await this.db.one(
         sql.SELECT_CONVERSATION_MESSAGES_COUNT,
         [ normalized ]
       );
     } catch (e) {
       throw e;
     }
  }

  async amountOfMessagesToday({email}) {
    try {
      return await this.db.one(
        sql.SELECT_CONVERSATION_MESSAGES_COUNT_TODAY,
        [ email ]
      );
    } catch (e) {
      throw e;
    }
  }

  async check24hActivity({email}) {
    try {
      return await this.db.one(
        sql.GET_24H_ACTIVITY,
        [ email ]
      );
    } catch (e) {
      throw e;
    }
  }

  async check48hActivity({email}) {
    try {
      return await this.db.one(
        sql.GET_48H_ACTIVITY,
        [ email ]
      );
    } catch (e) {
      throw e;
    }
  }
}

module.exports = ConversationMessageRepository;
